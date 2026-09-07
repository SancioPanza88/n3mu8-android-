import React, { useState } from 'react';
import {
  Search,
  Clipboard,
  Trash2,
  FileCode,
  CheckCircle,
  AlertTriangle,
  Lock,
  Film,
  Volume2,
  Subtitles,
  ChevronDown,
  ChevronUp,
  Play,
  Upload,
  ExternalLink,
  Loader2,
  Code2,
} from 'lucide-react';
import { NReConfig, StreamProbeResult, VideoVariant, AudioTrack, SubtitleTrack } from '../types';
import { parseCurlCommand, parseHarEntries } from '../utils/curlParser';

interface StreamProbeCardProps {
  config: NReConfig;
  onChangeConfig: (newConfig: Partial<NReConfig>) => void;
  probeResult: StreamProbeResult | null;
  setProbeResult: (res: StreamProbeResult | null) => void;
  lang: 'it' | 'en';
}

export const StreamProbeCard: React.FC<StreamProbeCardProps> = ({
  config,
  onChangeConfig,
  probeResult,
  setProbeResult,
  lang,
}) => {
  const [isProbing, setIsProbing] = useState(false);
  const [probeError, setProbeError] = useState<string | null>(null);
  const [showCurlModal, setShowCurlModal] = useState(false);
  const [curlInput, setCurlInput] = useState('');
  const [showHarModal, setShowHarModal] = useState(false);
  const [harDetectedStreams, setHarDetectedStreams] = useState<Array<{ url: string; method: string; type: string }>>([]);
  const [showRawManifest, setShowRawManifest] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState(false);

  // Handle URL Paste from clipboard
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        if (text.trim().startsWith('curl ')) {
          const parsed = parseCurlCommand(text);
          onChangeConfig({
            url: parsed.url,
            headers: [...(config.headers || []), ...parsed.headers],
            cookies: parsed.cookies || config.cookies,
            userAgent: parsed.userAgent || config.userAgent,
          });
        } else {
          onChangeConfig({ url: text.trim() });
        }
      }
    } catch {
      // Fallback
    }
  };

  // Run Stream Probe API
  const handleProbeStream = async () => {
    if (!config.url.trim()) return;

    setIsProbing(true);
    setProbeError(null);

    // Convert enabled headers to record
    const headersMap: Record<string, string> = {};
    (config.headers || [])
      .filter(h => h.enabled && h.key.trim() && h.value.trim())
      .forEach(h => {
        headersMap[h.key.trim()] = h.value.trim();
      });

    if (config.cookies) {
      headersMap['Cookie'] = config.cookies;
    }
    if (config.userAgent) {
      headersMap['User-Agent'] = config.userAgent;
    }

    try {
      const resp = await fetch('/api/probe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: config.url.trim(),
          headers: headersMap,
        }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || `Errore HTTP ${resp.status}`);
      }

      const result: StreamProbeResult = await resp.json();
      setProbeResult(result);

      // Auto-extract suggested save name if not set
      if (!config.saveName) {
        try {
          const parsedUrl = new URL(config.url);
          const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
          const lastPart = pathParts[pathParts.length - 1] || 'video';
          const cleanName = lastPart.replace(/\.(m3u8|mpd|mp4|ts)$/i, '');
          if (cleanName) {
            onChangeConfig({ saveName: cleanName });
          }
        } catch {
          // ignore
        }
      }
    } catch (err: any) {
      setProbeError(err.message || 'Impossibile analizzare il flusso. Verifica URL e intestazioni.');
    } finally {
      setIsProbing(false);
    }
  };

  // Parse cURL modal submission
  const handleApplyCurl = () => {
    if (!curlInput.trim()) return;
    const parsed = parseCurlCommand(curlInput);
    onChangeConfig({
      url: parsed.url || config.url,
      headers: parsed.headers.length ? [...config.headers, ...parsed.headers] : config.headers,
      cookies: parsed.cookies || config.cookies,
      userAgent: parsed.userAgent || config.userAgent,
    });
    setCurlInput('');
    setShowCurlModal(false);
  };

  // Parse HAR file upload
  const handleHarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const streams = parseHarEntries(json);
        setHarDetectedStreams(streams);
        setShowHarModal(true);
      } catch {
        alert(lang === 'it' ? 'File HAR non valido o danneggiato' : 'Invalid or corrupted HAR file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Main Stream Input Card */}
      <div id="stream-input-card" className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm sm:text-base font-semibold text-white">
              {lang === 'it' ? 'Acquisizione Flusso (HLS, DASH, MSS)' : 'Stream Capture (HLS, DASH, MSS)'}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            {/* cURL Import button */}
            <button
              id="btn-import-curl"
              onClick={() => setShowCurlModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-sky-300 transition"
              title={lang === 'it' ? 'Incolla comando cURL del browser' : 'Paste browser cURL command'}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Incolla cURL</span>
            </button>

            {/* HAR upload label */}
            <label
              id="btn-upload-har"
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-indigo-300 transition cursor-pointer"
              title={lang === 'it' ? 'Carica file .HAR di rete' : 'Upload network .HAR file'}
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Importa HAR</span>
              <input type="file" accept=".har,application/json" onChange={handleHarUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* URL Input Row */}
        <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <input
              id="input-stream-url"
              type="text"
              value={config.url}
              onChange={(e) => onChangeConfig({ url: e.target.value })}
              placeholder={lang === 'it' ? 'Incolla URL .m3u8, .mpd, .ism o comando cURL...' : 'Paste .m3u8, .mpd, .ism URL or cURL command...'}
              className="w-full h-11 pl-3.5 pr-20 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition font-mono"
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {config.url && (
                <button
                  id="btn-clear-url"
                  onClick={() => {
                    onChangeConfig({ url: '' });
                    setProbeResult(null);
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition"
                  title="Cancella URL"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                id="btn-paste-url"
                onClick={handlePasteClipboard}
                className="p-1.5 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-slate-800 transition"
                title={lang === 'it' ? 'Incolla dagli appunti' : 'Paste from clipboard'}
              >
                <Clipboard className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            id="btn-probe-stream"
            onClick={handleProbeStream}
            disabled={isProbing || !config.url.trim()}
            className="h-11 px-5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-semibold text-white shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 active:scale-95 transition"
          >
            {isProbing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{lang === 'it' ? 'Scansione in corso...' : 'Probing...'}</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>{lang === 'it' ? 'Analizza Flusso' : 'Probe Stream'}</span>
              </>
            )}
          </button>
        </div>

        {/* Error message */}
        {probeError && (
          <div id="probe-error-banner" className="mt-3 p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">{lang === 'it' ? 'Attenzione:' : 'Notice:'}</span> {probeError}
            </div>
          </div>
        )}

        {/* Quick Format Badges */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
          <span>{lang === 'it' ? 'Supportati:' : 'Supported:'}</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 font-mono text-sky-400">HLS (.m3u8)</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 font-mono text-indigo-400">DASH (.mpd)</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 font-mono text-emerald-400">MSS (SmoothStreaming)</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 font-mono text-amber-400">CENC / DRM (KID:KEY)</span>
        </div>
      </div>

      {/* Stream Probe Results Card (Stream Inspector) */}
      {probeResult && (
        <div id="stream-inspector-card" className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 shadow-xl space-y-4 animate-fadeIn">
          {/* Header of Inspector */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-sky-950 border border-sky-500/40 text-xs font-bold text-sky-400 uppercase tracking-wide">
                {probeResult.type} Manifest
              </span>
              <span className="text-xs text-slate-300 truncate max-w-[200px] sm:max-w-md font-mono">
                {probeResult.variants.length} {lang === 'it' ? 'Risoluzioni video' : 'Video streams'} • {probeResult.audios.length} {lang === 'it' ? 'Audio' : 'Audios'} • {probeResult.subtitles.length} {lang === 'it' ? 'Sottotitoli' : 'Subtitles'}
              </span>
            </div>

            {probeResult.encryption.length > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/40 text-xs font-medium text-amber-300">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>{probeResult.encryption[0].method}</span>
              </div>
            )}
          </div>

          {/* Video Variants List */}
          {probeResult.variants.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-sky-400" />
                  <span>{lang === 'it' ? 'Flussi Video Rilevati' : 'Detected Video Streams'}</span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {lang === 'it' ? 'Tocca per selezionare' : 'Tap to select'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {probeResult.variants.map((v, idx) => {
                  const isSelected = config.selectedVideoResolution === v.resolution;
                  const isHighDef = v.resolution.includes('1080') || v.resolution.includes('2160') || (v.bandwidth && v.bandwidth > 3000000);
                  const is4K = v.resolution.includes('2160') || v.resolution.includes('3840');

                  return (
                    <button
                      key={idx}
                      onClick={() => onChangeConfig({ selectedVideoResolution: isSelected ? '' : v.resolution })}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-sky-950/70 border-sky-500/80 shadow-md shadow-sky-500/10'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-white">
                            {v.resolution || `Stream #${idx + 1}`}
                          </span>
                          {is4K ? (
                            <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 text-[9px] font-bold">4K UHD</span>
                          ) : isHighDef ? (
                            <span className="px-1.5 py-0.2 rounded bg-sky-950 text-sky-400 text-[9px] font-bold">HD</span>
                          ) : null}
                          {v.frameRate && (
                            <span className="text-[10px] text-slate-400">{v.frameRate} fps</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {v.bandwidth ? `${(v.bandwidth / 1000000).toFixed(2)} Mbps` : ''}
                          {v.codecs ? ` • ${v.codecs}` : ''}
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isSelected ? (
                          <CheckCircle className="w-4 h-4 text-sky-400" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-700" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Audio Tracks */}
          {probeResult.audios.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === 'it' ? 'Tracce Audio Rilevate' : 'Detected Audio Tracks'}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {probeResult.audios.map((a, idx) => {
                  const isSelected = config.selectedAudioLanguage === a.language;
                  return (
                    <button
                      key={idx}
                      onClick={() => onChangeConfig({ selectedAudioLanguage: isSelected ? '' : a.language })}
                      className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-2 transition ${
                        isSelected
                          ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-semibold uppercase">{a.language || 'und'}</span>
                      <span className="text-slate-400">({a.name})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Subtitles */}
          {probeResult.subtitles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Subtitles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'it' ? 'Tracce Sottotitoli' : 'Subtitle Tracks'}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {probeResult.subtitles.map((s, idx) => {
                  const isSelected = config.selectedSubtitleLanguage === s.language;
                  return (
                    <button
                      key={idx}
                      onClick={() => onChangeConfig({ selectedSubtitleLanguage: isSelected ? '' : s.language })}
                      className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-2 transition ${
                        isSelected
                          ? 'bg-amber-950/70 border-amber-500 text-amber-300'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <Subtitles className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-semibold uppercase">{s.language || 'und'}</span>
                      <span className="text-slate-400">({s.name})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Raw Manifest Viewer Collapsible */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => setShowRawManifest(!showRawManifest)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition"
            >
              {showRawManifest ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{lang === 'it' ? 'Ispeziona Codice Manifest' : 'Inspect Raw Manifest Code'}</span>
            </button>

            {showRawManifest && probeResult.rawPreview && (
              <div className="mt-2 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 max-h-48 overflow-y-auto whitespace-pre">
                {probeResult.rawPreview}
              </div>
            )}
          </div>
        </div>
      )}

      {/* cURL Import Modal */}
      {showCurlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm sm:text-base font-semibold text-white">
                  {lang === 'it' ? 'Incolla Comando cURL del Browser' : 'Paste Browser cURL Command'}
                </h3>
              </div>
              <button
                onClick={() => setShowCurlModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              {lang === 'it'
                ? 'Apri Strumenti per sviluppatori (F12) > Scheda Rete nel browser, fai clic destro sulla richiesta .m3u8 o .mpd e scegli "Copia come cURL (bash)". L\'URL, i Cookie e le Intestazioni di autenticazione verranno estratti automaticamente!'
                : 'Open DevTools (F12) > Network in your browser, right click the .m3u8 or .mpd request and select "Copy as cURL (bash)". The URL, Cookies and Headers will be parsed automatically!'}
            </p>

            <textarea
              value={curlInput}
              onChange={(e) => setCurlInput(e.target.value)}
              placeholder="curl 'https://example.com/stream.m3u8' -H 'User-Agent: ...' -H 'Cookie: ...' --compressed"
              rows={6}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 font-mono focus:outline-none focus:border-sky-500"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowCurlModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-700"
              >
                {lang === 'it' ? 'Annulla' : 'Cancel'}
              </button>
              <button
                onClick={handleApplyCurl}
                disabled={!curlInput.trim()}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-xs font-semibold text-slate-950"
              >
                {lang === 'it' ? 'Estrai Parametri' : 'Extract Parameters'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HAR streams modal */}
      {showHarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm sm:text-base font-semibold text-white">
                  {lang === 'it' ? 'Flussi Rilevati nel file HAR' : 'Streams Found in HAR'} ({harDetectedStreams.length})
                </h3>
              </div>
              <button
                onClick={() => setShowHarModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {harDetectedStreams.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                {lang === 'it' ? 'Nessun flusso HLS (.m3u8) o DASH (.mpd) trovato in questo file HAR.' : 'No HLS or DASH streams found in this HAR file.'}
              </p>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2">
                {harDetectedStreams.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-sky-400 font-mono mr-2">
                        {s.type}
                      </span>
                      <p className="text-xs text-slate-200 font-mono truncate mt-1">
                        {s.url}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onChangeConfig({ url: s.url });
                        setShowHarModal(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-xs font-semibold text-slate-950 shrink-0"
                    >
                      {lang === 'it' ? 'Seleziona' : 'Select'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
