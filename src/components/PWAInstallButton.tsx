import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showAndroidTip, setShowAndroidTip] = useState(false);

  // If already installed in standalone mode
  if (isInstalled) {
    return (
      <div id="pwa-installed-badge" className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Installata (Android PWA)</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        id="btn-install-pwa"
        onClick={install}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 px-3.5 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-sky-500/20 active:scale-95 transition-all"
        title="Installa questa applicazione direttamente sul tuo dispositivo Android come app nativa"
      >
        <Smartphone className="w-4 h-4 text-slate-950" />
        <span className="whitespace-nowrap">Installa su Android</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="btn-install-ios"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 transition"
        >
          <Download className="w-3.5 h-3.5 text-sky-400" />
          <span>Aggiungi a Home</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-semibold text-white">Installa su iPhone / iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-300">
                1. Tocca l'icona <strong>Condividi</strong> (<span className="text-sky-400">↑</span>) nella barra di Safari.<br />
                2. Scorri verso il basso e tocca <strong>Aggiungi alla schermata Home</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-slate-800 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700"
              >
                Chiudi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Generic fallback if browser hasn't fired beforeinstallprompt yet
  return (
    <>
      <button
        id="btn-install-info"
        onClick={() => setShowAndroidTip(true)}
        className="flex items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-950/40 px-2.5 py-1.5 text-xs font-medium text-sky-300 hover:bg-sky-900/50 transition active:scale-95"
      >
        <Smartphone className="w-3.5 h-3.5 text-sky-400" />
        <span className="hidden xs:inline">Installa su</span> Android
      </button>

      {showAndroidTip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-semibold text-white">Installazione su Android</h3>
              </div>
              <button
                onClick={() => setShowAndroidTip(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-xs leading-relaxed text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="font-semibold text-sky-400 block mb-1">Metodo 1: PWA Standalone (Consigliato)</span>
                In Google Chrome o Edge su Android, tocca il menu con i <strong>3 puntini in alto a destra (⋮)</strong> e seleziona <strong>"Installa app"</strong> o <strong>"Aggiungi a schermata Home"</strong>.
                Funzionerà come un'app APK nativa a schermo intero con icona dedicata!
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="font-semibold text-emerald-400 block mb-1">Metodo 2: Esecuzione Nativa Termux</span>
                Usa la scheda <strong>"Termux & Android"</strong> di questa app per eseguire il vero binario compilato C# Linux ARM64 di <code className="text-sky-300">N_m3u8DL-RE</code> sul tuo smartphone Android a piena velocità con FFmpeg!
              </div>
            </div>
            <button
              onClick={() => setShowAndroidTip(false)}
              className="mt-5 w-full rounded-xl bg-sky-500 py-2.5 text-xs font-semibold text-slate-950 hover:bg-sky-400"
            >
              Ho capito
            </button>
          </div>
        </div>
      )}
    </>
  );
};
