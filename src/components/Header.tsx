import React, { useState } from 'react';
import { Layers, HelpCircle, Sparkles, Terminal, ChevronDown } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { PRESET_DEMOS } from '../data/presets';
import { NReConfig, PresetDemo } from '../types';

interface HeaderProps {
  onLoadPreset: (preset: PresetDemo) => void;
  config: NReConfig;
  lang: 'it' | 'en';
  setLang: (lang: 'it' | 'en') => void;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadPreset,
  lang,
  setLang,
  onOpenGuide,
}) => {
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Left: Branding */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-sky-500 via-indigo-500 to-emerald-500 p-[1.5px] shrink-0 shadow-sm shadow-sky-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-white truncate">
                N_m3u8DL-RE
              </h1>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-sky-950/80 border border-sky-500/40 text-sky-300 shrink-0">
                Android GUI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden xs:block truncate">
              {lang === 'it'
                ? 'HLS • DASH • MSS • DRM Downloader'
                : 'HLS • DASH • MSS • DRM Downloader'}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Presets Dropdown */}
          <div className="relative">
            <button
              id="btn-presets-menu"
              onClick={() => setShowPresetsMenu(!showPresetsMenu)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
              title={lang === 'it' ? 'Carica stream di prova' : 'Load sample stream'}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">{lang === 'it' ? 'Esempi' : 'Demos'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showPresetsMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowPresetsMenu(false)}
                />
                <div className="absolute right-0 mt-1.5 w-72 rounded-2xl bg-slate-900 border border-slate-800 p-2 shadow-2xl z-40 space-y-1">
                  <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {lang === 'it' ? 'Flussi multimediali di test' : 'Sample Media Streams'}
                  </div>
                  {PRESET_DEMOS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onLoadPreset(preset);
                        setShowPresetsMenu(false);
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-800/70 transition flex flex-col group"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-sky-300">
                          {preset.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {preset.type}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {preset.description}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Guide / Help button */}
          <button
            id="btn-open-guide"
            onClick={onOpenGuide}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title={lang === 'it' ? 'Guida e Installazione Android' : 'Guide and Android Setup'}
          >
            <HelpCircle className="w-4 h-4 text-sky-400" />
          </button>

          {/* Language Toggle */}
          <button
            id="btn-toggle-lang"
            onClick={() => setLang(lang === 'it' ? 'en' : 'it')}
            className="px-2 py-1 rounded-xl border border-slate-800 bg-slate-900 text-[11px] font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Cambia lingua"
          >
            {lang === 'it' ? 'EN' : 'IT'}
          </button>

          {/* Android PWA Install */}
          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
