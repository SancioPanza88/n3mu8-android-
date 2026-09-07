import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { StreamProbeCard } from './components/StreamProbeCard';
import { CliConfigurator } from './components/CliConfigurator';
import { TermuxBridge } from './components/TermuxBridge';
import { InAppDownloader } from './components/InAppDownloader';
import { AndroidGuideModal } from './components/AndroidGuideModal';
import { BottomNavBar, ActiveScreen } from './components/BottomNavBar';
import { NReConfig, StreamProbeResult, PresetDemo } from './types';
import { generateCliCommand } from './utils/commandGenerator';
import { Copy, Check, Terminal, WifiOff } from 'lucide-react';

const INITIAL_CONFIG: NReConfig = {
  url: '',
  saveName: '',
  saveDir: '/sdcard/Download',
  savePattern: '',
  tmpDir: '',

  threadCount: 16,
  downloadSpeedLimit: '',
  binarySelect: 'auto-best',
  selectedVideoResolution: '',
  selectedAudioLanguage: '',
  selectedSubtitleLanguage: '',
  autoMerge: true,
  muxFormat: 'mp4',
  muxTool: 'ffmpeg',
  autoResume: true,

  headers: [],
  cookies: '',
  proxy: '',
  userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
  maxRetries: 5,
  retryDelay: 1,
  cloudflareBypass: false,

  drmKeys: [],
  decryptionEngine: 'mp4decrypt',
  hlsMethodOverride: '',
  realTimeDecryption: false,

  subtitleFormat: 'srt',
  autoFixSubtitles: true,
  keepOriginalSub: false,
  skipVideo: false,
  skipAudio: false,
  adKeywords: '',
  keepTemporaryFiles: false,

  isLive: false,
  liveRecordLimit: '',
  liveRealTimeMerge: false,
  liveWaitTime: 15,

  logLevel: 'INFO',
  customFlags: '',
};

export default function App() {
  const [config, setConfig] = useState<NReConfig>(() => {
    try {
      const saved = localStorage.getItem('nm3u8dl_config');
      return saved ? { ...INITIAL_CONFIG, ...JSON.parse(saved) } : INITIAL_CONFIG;
    } catch {
      return INITIAL_CONFIG;
    }
  });

  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('stream');
  const [probeResult, setProbeResult] = useState<StreamProbeResult | null>(null);
  const [lang, setLang] = useState<'it' | 'en'>('it');
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [copiedQuickCmd, setCopiedQuickCmd] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('nm3u8dl_config', JSON.stringify(config));
    } catch {
      // ignore
    }
  }, [config]);

  // Online status tracking
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleChangeConfig = (updates: Partial<NReConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const handleLoadPreset = (preset: PresetDemo) => {
    setConfig((prev) => ({
      ...prev,
      url: preset.url,
      ...preset.config,
    }));
    setProbeResult(null);
    setActiveScreen('stream');
  };

  const quickCliCmd = generateCliCommand(config);

  const handleCopyQuickCmd = () => {
    navigator.clipboard.writeText(quickCliCmd);
    setCopiedQuickCmd(true);
    setTimeout(() => setCopiedQuickCmd(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-24 selection:bg-sky-500 selection:text-slate-950">
      {/* Offline Alert */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-bold flex items-center justify-center gap-2 shadow-md">
          <WifiOff className="w-4 h-4" />
          <span>{lang === 'it' ? 'Modalità Offline — Alcune funzioni di rete potrebbero non rispondere' : 'Offline Mode — Network features unavailable'}</span>
        </div>
      )}

      {/* Android App Bar */}
      <Header
        onLoadPreset={handleLoadPreset}
        config={config}
        lang={lang}
        setLang={setLang}
        onOpenGuide={() => setShowGuideModal(true)}
      />

      {/* Main Screen Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-5 space-y-4">
        <AnimatePresence mode="wait">
          {activeScreen === 'stream' && (
            <motion.div
              key="stream"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              <StreamProbeCard
                config={config}
                onChangeConfig={handleChangeConfig}
                probeResult={probeResult}
                setProbeResult={setProbeResult}
                lang={lang}
              />
            </motion.div>
          )}

          {activeScreen === 'config' && (
            <motion.div
              key="config"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <CliConfigurator
                config={config}
                onChangeConfig={handleChangeConfig}
                lang={lang}
              />
            </motion.div>
          )}

          {activeScreen === 'termux' && (
            <motion.div
              key="termux"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <TermuxBridge
                config={config}
                lang={lang}
              />
            </motion.div>
          )}

          {activeScreen === 'web-download' && (
            <motion.div
              key="web-download"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <InAppDownloader
                config={config}
                probeResult={probeResult}
                lang={lang}
              />
            </motion.div>
          )}

          {activeScreen === 'guide' && (
            <motion.div
              key="guide"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-white">
                  {lang === 'it' ? 'Guida Completa N_m3u8DL-RE su Android' : 'Complete N_m3u8DL-RE Android Guide'}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {lang === 'it'
                    ? 'N_m3u8DL-RE è il più avanzato downloader al mondo per flussi streaming DASH (.mpd), HLS (.m3u8) e Smooth Streaming (.ism). Su Android, hai due modi straordinari per utilizzarlo:'
                    : 'N_m3u8DL-RE is the premier DASH/HLS/MSS downloader. On Android, you have two great ways to run it:'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="font-bold text-sky-400 block">Metodo 1: Termux (ARM64 Nativo)</span>
                    <p className="text-slate-400">
                      Installa Termux, copia il comando dalla scheda "Termux" ed eseguilo. Il binario ARM64 elabora il flusso alla massima velocità della tua connessione e FFmpeg unisce video e audio direttamente in /sdcard/Download.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="font-bold text-emerald-400 block">Metodo 2: PWA / Web Downloader</span>
                    <p className="text-slate-400">
                      Analizza e scarica i segmenti direttamente all'interno di questa app installata sulla schermata iniziale di Android.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowGuideModal(true)}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-xs font-bold text-slate-950 transition"
                >
                  {lang === 'it' ? 'Visualizza Dettagli Architettura & Tutorial' : 'View Architecture Details & Tutorial'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Persistent Floating Command Preview Pill on mobile */}
        <div id="quick-command-pill" className="sticky bottom-16 z-30 rounded-2xl bg-slate-900/95 border border-slate-800 p-2.5 sm:p-3 shadow-2xl backdrop-blur-md flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-400 shrink-0">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                <span>{lang === 'it' ? 'Comando N_m3u8DL-RE' : 'CLI Command'}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="text-xs font-mono text-emerald-300 truncate">
                {quickCliCmd}
              </div>
            </div>
          </div>

          <button
            id="btn-copy-quick-cli"
            onClick={handleCopyQuickCmd}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shrink-0 transition active:scale-95 shadow-md shadow-emerald-500/10"
          >
            {copiedQuickCmd ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedQuickCmd ? (lang === 'it' ? 'Copiato!' : 'Copied!') : (lang === 'it' ? 'Copia' : 'Copy')}</span>
          </button>
        </div>
      </main>

      {/* Android Guide Modal */}
      <AndroidGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        lang={lang}
      />

      {/* Android Material Design 3 Bottom Navigation Bar */}
      <BottomNavBar
        activeScreen={activeScreen}
        onSelectScreen={setActiveScreen}
        lang={lang}
      />
    </div>
  );
}
