import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Stream Probe Endpoint
  // Fetches HLS/DASH/Direct manifests bypassing CORS and parses track structures
  app.post('/api/probe', async (req, res) => {
    try {
      const { url, headers = {}, method = 'GET' } = req.body;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL mancante o non valido' });
      }

      const reqHeaders: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
        'Accept': '*/*',
        ...headers,
      };

      const response = await fetch(url, {
        method,
        headers: reqHeaders,
        redirect: 'follow',
      });

      if (!response.ok) {
        return res.status(response.status).json({
          error: `Errore HTTP ${response.status}: ${response.statusText}`,
          url,
        });
      }

      const contentType = response.headers.get('content-type') || '';
      const finalUrl = response.url || url;
      const text = await response.text();

      // Determine stream type
      const isM3U8 = url.includes('.m3u8') || text.includes('#EXTM3U');
      const isMPD = url.includes('.mpd') || text.includes('<MPD');

      let parsedInfo: any = {
        type: isM3U8 ? 'HLS' : isMPD ? 'DASH' : 'DIRECT',
        url: finalUrl,
        contentType,
        contentLength: text.length,
        rawPreview: text.slice(0, 3000),
        variants: [],
        audios: [],
        subtitles: [],
        encryption: [],
        totalSegmentsEstimate: 0,
      };

      if (isM3U8) {
        // Parse HLS
        const lines = text.split('\n').map(l => l.trim());
        let currentBandwidth = 0;
        let currentResolution = '';
        let currentCodecs = '';
        let currentFrameRate = '';
        let currentName = '';

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          // Check Encryption
          if (line.startsWith('#EXT-X-KEY:')) {
            const methodMatch = line.match(/METHOD=([^,]+)/);
            const uriMatch = line.match(/URI="([^"]+)"/);
            const keyFormatMatch = line.match(/KEYFORMAT="([^"]+)"/);
            parsedInfo.encryption.push({
              method: methodMatch ? methodMatch[1] : 'AES-128',
              uri: uriMatch ? uriMatch[1] : undefined,
              format: keyFormatMatch ? keyFormatMatch[1] : 'identity',
              raw: line,
            });
          }

          // Check Media variants (Audio / Subtitles)
          if (line.startsWith('#EXT-X-MEDIA:')) {
            const typeMatch = line.match(/TYPE=([A-Z-]+)/);
            const groupMatch = line.match(/GROUP-ID="([^"]+)"/);
            const nameMatch = line.match(/NAME="([^"]+)"/);
            const langMatch = line.match(/LANGUAGE="([^"]+)"/);
            const uriMatch = line.match(/URI="([^"]+)"/);

            const item = {
              group: groupMatch ? groupMatch[1] : '',
              name: nameMatch ? nameMatch[1] : 'Default',
              language: langMatch ? langMatch[1] : 'und',
              uri: uriMatch ? uriMatch[1] : '',
            };

            if (typeMatch && typeMatch[1] === 'AUDIO') {
              parsedInfo.audios.push(item);
            } else if (typeMatch && typeMatch[1] === 'SUBTITLES') {
              parsedInfo.subtitles.push(item);
            }
          }

          // Check Stream Inf (Video variants)
          if (line.startsWith('#EXT-X-STREAM-INF:')) {
            const bwMatch = line.match(/BANDWIDTH=(\d+)/);
            const resMatch = line.match(/RESOLUTION=([0-9x]+)/);
            const codecsMatch = line.match(/CODECS="([^"]+)"/);
            const fpsMatch = line.match(/FRAME-RATE=([0-9.]+)/);
            const nameMatch = line.match(/NAME="([^"]+)"/);

            currentBandwidth = bwMatch ? parseInt(bwMatch[1], 10) : 0;
            currentResolution = resMatch ? resMatch[1] : '';
            currentCodecs = codecsMatch ? codecsMatch[1] : '';
            currentFrameRate = fpsMatch ? fpsMatch[1] : '';
            currentName = nameMatch ? nameMatch[1] : '';

            // The next non-empty line without '#' is the variant URI
            let nextUri = '';
            for (let j = i + 1; j < lines.length; j++) {
              if (lines[j] && !lines[j].startsWith('#')) {
                nextUri = lines[j];
                break;
              }
            }

            parsedInfo.variants.push({
              bandwidth: currentBandwidth,
              resolution: currentResolution,
              codecs: currentCodecs,
              frameRate: currentFrameRate,
              name: currentName,
              uri: nextUri,
            });
          }

          // Segment Count in media playlist
          if (line.startsWith('#EXTINF:')) {
            parsedInfo.totalSegmentsEstimate++;
          }
        }
      } else if (isMPD) {
        // Parse DASH XML roughly
        const adaptationSetRegex = /<AdaptationSet([^>]*)>([\s\S]*?)<\/AdaptationSet>/gi;
        let match;
        while ((match = adaptationSetRegex.exec(text)) !== null) {
          const attrs = match[1];
          const inner = match[2];
          const mimeMatch = attrs.match(/mimeType="([^"]+)"/);
          const langMatch = attrs.match(/lang="([^"]+)"/);
          const mime = mimeMatch ? mimeMatch[1] : '';
          const lang = langMatch ? langMatch[1] : 'und';

          if (mime.includes('video')) {
            const repRegex = /<Representation([^>]*)\/?>/gi;
            let repMatch;
            while ((repMatch = repRegex.exec(inner)) !== null) {
              const repAttrs = repMatch[1];
              const id = (repAttrs.match(/id="([^"]+)"/) || [])[1] || '';
              const bw = parseInt((repAttrs.match(/bandwidth="(\d+)"/) || [])[1] || '0', 10);
              const width = (repAttrs.match(/width="(\d+)"/) || [])[1] || '';
              const height = (repAttrs.match(/height="(\d+)"/) || [])[1] || '';
              const codecs = (repAttrs.match(/codecs="([^"]+)"/) || [])[1] || '';
              parsedInfo.variants.push({
                id,
                bandwidth: bw,
                resolution: width && height ? `${width}x${height}` : '',
                codecs,
                mime,
              });
            }
          } else if (mime.includes('audio')) {
            parsedInfo.audios.push({
              language: lang,
              name: `Audio (${lang})`,
              mime,
            });
          } else if (mime.includes('subtitle') || mime.includes('vtt') || mime.includes('ttml')) {
            parsedInfo.subtitles.push({
              language: lang,
              name: `Subtitle (${lang})`,
              mime,
            });
          }
        }

        // Check for Widevine / PlayReady PSSH
        if (text.includes('cenc:pssh') || text.includes('ContentProtection')) {
          const psshMatches = text.match(/<cenc:pssh[^>]*>([A-Za-z0-9+/=]+)<\/cenc:pssh>/g) || [];
          parsedInfo.encryption.push({
            method: 'DASH CENC (DRM)',
            format: 'Widevine / PlayReady',
            psshCount: psshMatches.length,
          });
        }
      }

      res.json(parsedInfo);
    } catch (err: any) {
      console.error('Probe error:', err);
      res.status(500).json({ error: err.message || 'Errore durante la scansione del flusso' });
    }
  });

  // Stream Segment / Data Proxy
  // Allows testing segment downloading and bypassing CORS in web preview
  app.get('/api/proxy', async (req, res) => {
    try {
      const url = req.query.url as string;
      if (!url) {
        return res.status(400).send('URL query parameter required');
      }

      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
      };

      if (req.headers['referer']) headers['Referer'] = req.headers['referer'] as string;

      const response = await fetch(url, { headers });
      if (!response.ok) {
        return res.status(response.status).send(`Failed to fetch upstream: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType) res.setHeader('Content-Type', contentType);

      res.setHeader('Access-Control-Allow-Origin', '*');
      const arrayBuf = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuf));
    } catch (err: any) {
      res.status(500).send(err.message);
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`N_m3u8DL-RE Android GUI Server running on port ${PORT}`);
  });
}

startServer();
