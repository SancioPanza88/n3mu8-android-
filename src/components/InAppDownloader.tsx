import React, { useState, useRef, useEffect } from 'react';
import {
  DownloadCloud,
  Play,
  Pause,
  Square,
  CheckCircle,
  AlertCircle,
  FileVideo,
  Clock,
  Zap,
  HardDrive,
  RefreshCw,
  FolderCheck,
} from 'lucide-react';
import { NReConfig, StreamProbeResult } from '../types';

interface InAppDownloaderProps {
  config: NReConfig;
  probeResult: StreamProbeResult | null;
  lang: 'it' | 'en';
}

export const InAppDownloader: React.FC<InAppDownloaderProps> = ({
  config,
  probeResult,
  lang,
}) => {
  const [status, setStatus] = useState<'idle' | 'fetching-manifest' | 'downloading' | 'completed' | 'error' | 'cancelled'>('idle');
  const [progress, setProgress] = useState(0);
  const [downloadedSegments, setDownloadedSegments] = useState(0);
  const [totalSegments, setTotalSegments] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState('0 MB/s');
  const [downloadedBytes, setDownloadedBytes] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [savedBlobUrl, setSavedBlobUrl] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedChunksRef = useRef<Uint8Array[]>([]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (savedBlobUrl) URL.revokeObjectURL(savedBlobUrl);
    };
  }, [savedBlobUrl]);

  const handleStartDownload = async () => {
    if (!config.url.trim()) return;

    setStatus('fetching-manifest');
    setProgress(0);
    setDownloadedSegments(0);
    setTotalSegments(0);
    setDownloadedBytes(0);
    setErrorMessage('');
    accumulatedChunksRef.current = [];
    startTimeRef.current = Date.now();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // 1. Fetch Manifest
      const manifestResp = await fetch(`/api/proxy?url=${encodeURIComponent(config.url.trim())}`, {
        signal: controller.signal,
      });

      if (!manifestResp.ok) {
        throw new Error(`Errore durante il recupero del manifest: ${manifestResp.statusText}`);
      }

      const manifestText = await manifestResp.text();
      const isM3u8 = config.url.includes('.m3u8') || manifestText.includes('#EXTM3U');

      // Resolve base URL for segments
      const baseUrl = config.url.substring(0, config.url.lastIndexOf('/') + 1);

      let segmentUrls: string[] = [];

      if (isM3u8) {
        // If master playlist with STREAM-INF, pick selected or first variant
        if (manifestText.includes('#EXT-X-STREAM-INF:')) {
          const lines = manifestText.split('\n').map(l => l.trim());
          let targetVariantUri = '';
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('#EXT-X-STREAM-INF:')) {
              // check if matches resolution
              for (let j = i + 1; j < lines.length; j++) {
                if (lines[j] && !lines[j].startsWith('#')) {
                  targetVariantUri = lines[j];
                  break;
                }
              }
              if (targetVariantUri) break;
            }
          }

          if (targetVariantUri) {
            const variantFullUrl = targetVariantUri.startsWith('http')
              ? targetVariantUri
              : new URL(targetVariantUri, baseUrl).toString();

            // Fetch variant media playlist
            const varResp = await fetch(`/api/proxy?url=${encodeURIComponent(variantFullUrl)}`, {
              signal: controller.signal,
            });
            const varText = await varResp.text();
            const varLines = varText.split('\n').map(l => l.trim());
            const varBaseUrl = variantFullUrl.substring(0, variantFullUrl.lastIndexOf('/') + 1);

            for (const line of varLines) {
              if (line && !line.startsWith('#')) {
                const fullSegUrl = line.startsWith('http') ? line : new URL(line, varBaseUrl).toString();
                segmentUrls.push(fullSegUrl);
              }
            }
          }
        } else {
          // Direct media playlist
          const lines = manifestText.split('\n').map(l => l.trim());
          for (const line of lines) {
            if (line && !line.startsWith('#')) {
              const fullSegUrl = line.startsWith('http') ? line : new URL(line, baseUrl).toString();
              segmentUrls.push(fullSegUrl);
            }
          }
        }
      } else {
        // Direct media file
        segmentUrls = [config.url];
      }

      if (segmentUrls.length === 0) {
        throw new Error('Nessun segmento o flusso valido rilevato nel manifest.');
      }

      setTotalSegments(segmentUrls.length);
      setStatus('downloading');

      let totalBytesReceived = 0;
      const chunks: Uint8Array[] = [];

      // Download segments in chunks
      for (let i = 0; i < segmentUrls.length; i++) {
        if (controller.signal.aborted) break;

        const segUrl = segmentUrls[i];
        const segResp = await fetch(`/api/proxy?url=${encodeURIComponent(segUrl)}`, {
          signal: controller.signal,
        });

        if (!segResp.ok) {
          throw new Error(`Errore durante il download del segmento ${i + 1}`);
        }

        const buf = await segResp.arrayBuffer();
        const u8 = new Uint8Array(buf);
        chunks.push(u8);
        totalBytesReceived += u8.byteLength;

        // Calculate speed & progress
        const elapsedSec = (Date.now() - startTimeRef.current) / 1000;
        const speedMb = elapsedSec > 0 ? (totalBytesReceived / (1024 * 1024) / elapsedSec).toFixed(2) : '0';

        setDownloadedSegments(i + 1);
        setDownloadedBytes(totalBytesReceived);
        setProgress(Math.round(((i + 1) / segmentUrls.length) * 100));
        setDownloadSpeed(`${speedMb} MB/s`);
      }

      accumulatedChunksRef.current = chunks;
      const finalBlob = new Blob(chunks, { type: 'video/mp4' });
      const blobUrl = URL.createObjectURL(finalBlob);
      setSavedBlobUrl(blobUrl);
      setStatus('completed');
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setStatus('cancelled');
      } else {
        setStatus('error');
        setErrorMessage(err.message || 'Errore durante il download del flusso.');
      }
    }
  };

  const handleCancelDownload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStatus('cancelled');
  };

  return (
    <div id="in-app-downloader" className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <DownloadCloud className="w-5 h-5 text-sky-400" />
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-white">
              {lang === 'it' ? 'Download Diretto Web & Tester Segmenti' : 'Web Stream Downloader & Tester'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {lang === 'it'
                ? 'Scarica e assembla i segmenti direttamente nel browser senza uscire dall\'app'
                : 'Download and assemble segments directly in browser without Termux'}
            </p>
          </div>
        </div>

        {status === 'downloading' && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-950 border border-sky-500/40 text-xs font-semibold text-sky-400 animate-pulse">
            <Zap className="w-3.5 h-3.5" />
            <span>{downloadSpeed}</span>
          </span>
        )}
      </div>

      {/* Status View */}
      {status === 'idle' && (
        <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center space-y-3">
          <FileVideo className="w-10 h-10 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-200 block">
              {config.url
                ? (lang === 'it' ? 'Pronto per scaricare il flusso configurato' : 'Ready to download stream')
                : (lang === 'it' ? 'Inserisci un URL nella prima scheda o carica un esempio' : 'Enter a stream URL or load a preset')}
            </span>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto">
              {lang === 'it'
                ? 'Ideale per scaricare rapidamente flussi standard HLS/DASH o testare la connettività e velocità dei segmenti direttamente sul telefono.'
                : 'Ideal for downloading HLS/DASH streams or testing segment download speed directly on your phone.'}
            </p>
          </div>

          <button
            id="btn-start-web-download"
            onClick={handleStartDownload}
            disabled={!config.url.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold text-white shadow-md shadow-sky-500/20 active:scale-95 transition"
          >
            {lang === 'it' ? 'Avvia Download Web' : 'Start Web Download'}
          </button>
        </div>
      )}

      {/* Active Downloading Progress */}
      {(status === 'fetching-manifest' || status === 'downloading') && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200">
              {status === 'fetching-manifest'
                ? (lang === 'it' ? 'Analisi playlist segmenti...' : 'Fetching segment playlist...')
                : `${lang === 'it' ? 'Scaricamento segmenti:' : 'Downloading chunks:'} ${downloadedSegments} / ${totalSegments}`}
            </span>
            <span className="font-mono font-bold text-sky-400">{progress}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
              <span className="text-slate-500 block">{lang === 'it' ? 'Velocità' : 'Speed'}</span>
              <span className="font-mono font-semibold text-emerald-400">{downloadSpeed}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
              <span className="text-slate-500 block">{lang === 'it' ? 'Dati Scaricati' : 'Downloaded'}</span>
              <span className="font-mono font-semibold text-sky-400">
                {(downloadedBytes / (1024 * 1024)).toFixed(1)} MB
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
              <span className="text-slate-500 block">{lang === 'it' ? 'Segmenti' : 'Segments'}</span>
              <span className="font-mono font-semibold text-indigo-400">
                {downloadedSegments}/{totalSegments}
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleCancelDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold hover:bg-rose-900/80 transition"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>{lang === 'it' ? 'Interrompi' : 'Cancel'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Completed View */}
      {status === 'completed' && (
        <div className="p-5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3 animate-fadeIn">
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
          <div className="space-y-1">
            <span className="text-sm font-bold text-white block">
              {lang === 'it' ? 'Download Completato con Successo!' : 'Download Completed Successfully!'}
            </span>
            <p className="text-xs text-slate-300">
              {lang === 'it'
                ? `Tutti i ${totalSegments} segmenti sono stati scaricati e assemblati (${(downloadedBytes / (1024 * 1024)).toFixed(1)} MB).`
                : `All ${totalSegments} chunks assembled (${(downloadedBytes / (1024 * 1024)).toFixed(1)} MB).`}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {savedBlobUrl && (
              <a
                href={savedBlobUrl}
                download={`${config.saveName || 'stream_video'}.${config.muxFormat || 'mp4'}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-slate-950 transition shadow-md"
              >
                <FolderCheck className="w-4 h-4" />
                <span>{lang === 'it' ? 'Salva File nel Dispositivo' : 'Save File to Storage'}</span>
              </a>
            )}

            <button
              onClick={() => setStatus('idle')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
            >
              {lang === 'it' ? 'Nuovo Download' : 'New Download'}
            </button>
          </div>
        </div>
      )}

      {/* Error View */}
      {status === 'error' && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-center space-y-2 animate-fadeIn">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <span className="text-xs font-bold text-rose-200 block">{errorMessage}</span>
          <button
            onClick={() => setStatus('idle')}
            className="px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-900 text-xs text-rose-200 font-semibold transition"
          >
            {lang === 'it' ? 'Riprova' : 'Retry'}
          </button>
        </div>
      )}
    </div>
  );
};
