import React from 'react';
import { Search, Sliders, Terminal, DownloadCloud, HelpCircle } from 'lucide-react';

export type ActiveScreen = 'stream' | 'config' | 'termux' | 'web-download' | 'guide';

interface BottomNavBarProps {
  activeScreen: ActiveScreen;
  onSelectScreen: (screen: ActiveScreen) => void;
  lang: 'it' | 'en';
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeScreen,
  onSelectScreen,
  lang,
}) => {
  const navItems: Array<{ id: ActiveScreen; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'stream', label: lang === 'it' ? 'Flusso' : 'Stream', icon: Search },
    { id: 'config', label: lang === 'it' ? 'Opzioni' : 'Config', icon: Sliders },
    { id: 'termux', label: lang === 'it' ? 'Termux' : 'Termux', icon: Terminal },
    { id: 'web-download', label: lang === 'it' ? 'Download' : 'Download', icon: DownloadCloud },
    { id: 'guide', label: lang === 'it' ? 'Guida' : 'Guide', icon: HelpCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-md border-t border-slate-800/80 px-2 py-1.5 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => onSelectScreen(item.id)}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl transition ${
                isActive
                  ? 'text-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition ${
                  isActive ? 'bg-sky-500/15 text-sky-400' : 'text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
