import React from 'react';
import {
  X,
  Smartphone,
  Terminal,
  ShieldCheck,
  ExternalLink,
  BookOpen,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';

interface AndroidGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'it' | 'en';
}

export const AndroidGuideModal: React.FC<AndroidGuideModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-2xl space-y-5 text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-slate-950 font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {lang === 'it' ? 'Guida Android: N_m3u8DL-RE Mobile' : 'Android Guide: N_m3u8DL-RE Mobile'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {lang === 'it' ? 'Architettura, installazione e download su smartphone' : 'Architecture, installation & mobile downloading'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-xs leading-relaxed text-slate-300">
          {/* Section 1: Intro */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="font-bold text-sky-400 text-sm block flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              {lang === 'it' ? 'Che cos\'è questa app?' : 'What is this application?'}
            </span>
            <p>
              {lang === 'it'
                ? 'Questa è la trasposizione ufficiale per Android di N_m3u8DL_RE_GUI (creato da naravid19 su Windows), riprogettata con un\'interfaccia mobile Material You ottimizzata per smartphone e tablet Android. Consente di acquisire flussi HLS, DASH, MSS, decrittare contenuti protetti e lanciare download ad altissima velocità.'
                : 'This is the Android mobile edition of N_m3u8DL_RE_GUI, adapted with a modern responsive Material Design 3 interface for Android devices.'}
            </p>
          </div>

          {/* Section 2: Two Execution Modes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Terminal className="w-4 h-4" />
                <span>{lang === 'it' ? '1. Modalità Termux Nativa' : '1. Native Termux Mode'}</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                {lang === 'it'
                  ? 'Il vero binario compilato in C# Linux ARM64 di N_m3u8DL-RE gira direttamente sul processore del tuo telefono tramite Termux. Nessun limite di memoria o browser, supporto completo a FFmpeg e salvataggio in /sdcard/Download.'
                  : 'Runs the real compiled Linux ARM64 C# binary inside Termux with full FFmpeg support and multi-threading.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-bold">
                <Zap className="w-4 h-4" />
                <span>{lang === 'it' ? '2. Modalità Web In-App' : '2. In-App Web Mode'}</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                {lang === 'it'
                  ? 'Permette di analizzare manifest HLS/DASH, estrarre tracce, visualizzare bitrate e scaricare direttamente i segmenti nel browser senza dover configurare Termux.'
                  : 'Probe manifests, inspect audio/video tracks, and test download chunks directly inside the browser.'}
              </p>
            </div>
          </div>

          {/* Section 3: APK / PWA Install */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="font-bold text-amber-400 text-xs block">
              {lang === 'it' ? 'Installazione come App Nativa sul Telefono (APK / PWA)' : 'Installing as Native App (APK / PWA)'}
            </span>
            <p>
              {lang === 'it'
                ? 'L\'app è dotata di Service Worker e Web App Manifest completo per Android. In Google Chrome o Samsung Internet sul tuo smartphone, tocca il menu con i 3 puntini e premi "Aggiungi a schermata Home" o "Installa app". Si aprirà come un\'applicazione indipendente a schermo intero senza barre del browser.'
                : 'This app is a progressive web app with full offline and standalone capability. Tap "Install" or "Add to Home screen" in your browser.'}
            </p>
          </div>

          {/* Section 4: Repositories */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="font-bold text-white text-xs block">
              {lang === 'it' ? 'Riferimenti e Codice Open Source' : 'References & Open Source'}
            </span>
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <a
                href="https://github.com/naravid19/N_m3u8DL_RE_GUI"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500 text-xs text-sky-400 transition"
              >
                <span>N_m3u8DL_RE_GUI (GitHub)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://github.com/nilaoda/N_m3u8DL-RE"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500 text-xs text-emerald-400 transition"
              >
                <span>N_m3u8DL-RE Core CLI (GitHub)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-xs font-bold text-slate-950 transition"
          >
            {lang === 'it' ? 'Chiudi Guida' : 'Close Guide'}
          </button>
        </div>
      </div>
    </div>
  );
};
