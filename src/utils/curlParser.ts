import { HeaderItem } from '../types';

export interface ParsedCurl {
  url: string;
  headers: HeaderItem[];
  cookies: string;
  userAgent: string;
}

export function parseCurlCommand(rawCurl: string): ParsedCurl {
  let url = '';
  const headers: HeaderItem[] = [];
  let cookies = '';
  let userAgent = '';

  // Clean newlines and escapes
  const cleanCmd = rawCurl
    .replace(/\\\r?\n/g, ' ')
    .replace(/\r?\n/g, ' ')
    .trim();

  // Extract URL: usually follows curl 'URL' or curl "URL" or bare URL
  const urlMatch = cleanCmd.match(/curl\s+(?:--location\s+)?(?:-[A-Za-z0-9-]+\s+)*['"]([^'"]+)['"]/i) ||
                   cleanCmd.match(/curl\s+['"]([^'"]+)['"]/i) ||
                   cleanCmd.match(/https?:\/\/[^\s'"]+/i);

  if (urlMatch) {
    url = urlMatch[1] || urlMatch[0];
  }

  // Extract Headers (-H 'Key: Value' or --header 'Key: Value')
  const headerRegex = /(?:-H|--header)\s+['"]([^'"]+)['"]/gi;
  let hMatch: RegExpExecArray | null;
  while ((hMatch = headerRegex.exec(cleanCmd)) !== null) {
    const headerStr = hMatch[1];
    const colonIndex = headerStr.indexOf(':');
    if (colonIndex > 0) {
      const key = headerStr.slice(0, colonIndex).trim();
      const value = headerStr.slice(colonIndex + 1).trim();

      if (key.toLowerCase() === 'cookie') {
        cookies = value;
      } else if (key.toLowerCase() === 'user-agent') {
        userAgent = value;
      } else {
        headers.push({
          id: Math.random().toString(36).substring(2, 9),
          key,
          value,
          enabled: true,
        });
      }
    }
  }

  // Extract -b or --cookie
  const cookieMatch = cleanCmd.match(/(?:-b|--cookie)\s+['"]([^'"]+)['"]/i);
  if (cookieMatch && !cookies) {
    cookies = cookieMatch[1];
  }

  // Extract -A or --user-agent
  const uaMatch = cleanCmd.match(/(?:-A|--user-agent)\s+['"]([^'"]+)['"]/i);
  if (uaMatch && !userAgent) {
    userAgent = uaMatch[1];
  }

  return {
    url,
    headers,
    cookies,
    userAgent,
  };
}

export function parseHarEntries(harJson: any): Array<{ url: string; method: string; type: string }> {
  try {
    const entries = harJson?.log?.entries || [];
    const mediaStreams: Array<{ url: string; method: string; type: string }> = [];

    for (const entry of entries) {
      const reqUrl = entry.request?.url || '';
      const mime = entry.response?.content?.mimeType || '';

      const isHls = reqUrl.includes('.m3u8') || mime.includes('mpegurl') || mime.includes('x-mpegURL');
      const isDash = reqUrl.includes('.mpd') || mime.includes('dash+xml');
      const isVideo = mime.includes('video') || reqUrl.endsWith('.mp4') || reqUrl.endsWith('.m4s');

      if (isHls || isDash || isVideo) {
        mediaStreams.push({
          url: reqUrl,
          method: entry.request?.method || 'GET',
          type: isHls ? 'HLS (.m3u8)' : isDash ? 'DASH (.mpd)' : 'Video Segment',
        });
      }
    }

    return mediaStreams;
  } catch {
    return [];
  }
}
