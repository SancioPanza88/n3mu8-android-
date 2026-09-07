import React, { useState } from 'react';
import {
  Download,
  Globe,
  Lock,
  Film,
  Radio,
  Sliders,
  Plus,
  Trash2,
  Folder,
  Cpu,
  Gauge,
  Key,
  Shield,
  FileCheck,
  Check,
  Zap,
} from 'lucide-react';
import { NReConfig, HeaderItem, DrmKeyItem } from '../types';

interface CliConfiguratorProps {
  config: NReConfig;
  onChangeConfig: (newConfig: Partial<NReConfig>) => void;
  lang: 'it' | 'en';
}

type TabType = 'download' | 'network' | 'security' | 'media' | 'live' | 'advanced';

export const CliConfigurator: React.FC<CliConfiguratorProps> = ({
  config,
  onChangeConfig,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('download');

  // Header management
  const handleAddHeader = () => {
    const newHeader: HeaderItem = {
      id: Math.random().toString(36).substring(2, 9),
      key: '',
      value: '',
      enabled: true,
    };
    onChangeConfig({ headers: [...(config.headers || []), newHeader] });
  };

  const handleUpdateHeader = (id: string, updates: Partial<HeaderItem>) => {
    const updated = (config.headers || []).map(h => (h.id === id ? { ...h, ...updates } : h));
    onChangeConfig({ headers: updated });
  };

  const handleRemoveHeader = (id: string) => {
    onChangeConfig({ headers: (config.headers || []).filter(h => h.id !== id) });
  };

  // DRM Key management
  const handleAddKey = () => {
    const newKey: DrmKeyItem = {
      id: Math.random().toString(36).substring(2, 9),
      kid: '',
      key: '',
      comment: '',
    };
    onChangeConfig({ drmKeys: [...(config.drmKeys || []), newKey] });
  };

  const handleUpdateKey = (id: string, updates: Partial<DrmKeyItem>) => {
    const updated = (config.drmKeys || []).map(k => (k.id === id ? { ...k, ...updates } : k));
    onChangeConfig({ drmKeys: updated });
  };

  const handleRemoveKey = (id: string) => {
    onChangeConfig({ drmKeys: (config.drmKeys || []).filter(k => k.id !== id) });
  };

  // User-Agent presets
  const UA_PRESETS = [
    { label: 'Android Pixel (Chrome Mobile)', value: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36' },
    { label: 'Samsung Galaxy (Samsung Internet)', value: 'Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/24.0 Chrome/118.0.0.0 Mobile Safari/537.36' },
    { label: 'iPhone (Safari iOS)', value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1' },
    { label: 'Smart TV (Tizen / LG WebOS)', value: 'Mozilla/5.0 (SMART-TV; Linux; Tizen 7.0) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/5.0 Chrome/94.0.4606.31 TV Safari/537.36' },
    { label: 'Desktop Chrome (Windows)', value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' },
  ];

  const tabs: Array<{ id: TabType; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'download', label: lang === 'it' ? 'Download' : 'Download', icon: Download },
    { id: 'network', label: lang === 'it' ? 'Rete & Header' : 'Network', icon: Globe },
    { id: 'security', label: lang === 'it' ? 'DRM & Chiavi' : 'DRM & Keys', icon: Lock },
    { id: 'media', label: lang === 'it' ? 'Media & Mux' : 'Media & Mux', icon: Film },
    { id: 'live', label: lang === 'it' ? 'Diretta / Live' : 'Live Stream', icon: Radio },
    { id: 'advanced', label: lang === 'it' ? 'Avanzate' : 'Advanced', icon: Sliders },
  ];

  return (
    <div id="cli-configurator" className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 shadow-xl space-y-4">
      {/* Category Tabs (Scrollable on small mobile devices) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0 ${
                isActive
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: DOWNLOAD */}
      {activeTab === 'download' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Save Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {lang === 'it' ? 'Nome del file (--save-name)' : 'Output Filename (--save-name)'}
              </label>
              <input
                type="text"
                value={config.saveName}
                onChange={(e) => onChangeConfig({ saveName: e.target.value })}
                placeholder="es. Video_Episodio_01"
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            {/* Save Directory */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>{lang === 'it' ? 'Cartella di salvataggio Android (--save-dir)' : 'Android Save Directory (--save-dir)'}</span>
                <span className="text-[10px] text-sky-400 font-normal">Android Default</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={config.saveDir}
                  onChange={(e) => onChangeConfig({ saveDir: e.target.value })}
                  placeholder="/sdcard/Download"
                  className="w-full h-10 pl-3 pr-24 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                />
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex gap-1">
                  <button
                    onClick={() => onChangeConfig({ saveDir: '/sdcard/Download' })}
                    className="px-2 py-1 rounded bg-slate-800 text-[10px] text-slate-300 hover:text-white"
                    title="Download"
                  >
                    /Download
                  </button>
                  <button
                    onClick={() => onChangeConfig({ saveDir: '/sdcard/Movies' })}
                    className="px-2 py-1 rounded bg-slate-800 text-[10px] text-slate-300 hover:text-white"
                    title="Movies"
                  >
                    /Movies
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Thread Count */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-sky-400" />
                  <span>{lang === 'it' ? 'Thread Concorrenti (--thread-count)' : 'Concurrent Threads (--thread-count)'}</span>
                </label>
                <span className="text-xs font-mono font-bold text-sky-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                  {config.threadCount}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={64}
                step={1}
                value={config.threadCount}
                onChange={(e) => onChangeConfig({ threadCount: parseInt(e.target.value, 10) })}
                className="w-full accent-sky-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>1 (Mobile Eco)</span>
                <span>16 (Consigliato)</span>
                <span>32 (Veloce)</span>
                <span>64 (Max)</span>
              </div>
            </div>

            {/* Speed Limit */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lang === 'it' ? 'Limite Velocità (--max-speed)' : 'Max Speed Limit (--max-speed)'}</span>
              </label>
              <input
                type="text"
                value={config.downloadSpeedLimit}
                onChange={(e) => onChangeConfig({ downloadSpeedLimit: e.target.value })}
                placeholder={lang === 'it' ? 'Vuoto = illimitata (es. 15M, 5M)' : 'Empty = Unlimited (e.g. 15M, 5M)'}
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          {/* Stream Selection Mode */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <label className="block text-xs font-semibold text-slate-300">
              {lang === 'it' ? 'Strategia di Selezione Flussi' : 'Stream Selection Mode'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'auto-best', label: lang === 'it' ? 'Migliore Qualità' : 'Auto Best', flag: '--auto-select' },
                { id: 'video-only', label: lang === 'it' ? 'Solo Video' : 'Video Only', flag: '--skip-audio' },
                { id: 'audio-only', label: lang === 'it' ? 'Solo Audio' : 'Audio Only', flag: '--skip-video' },
                { id: 'custom', label: lang === 'it' ? 'Personalizzato' : 'Custom Select', flag: 'Manuale' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onChangeConfig({ binarySelect: opt.id as any })}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    config.binarySelect === opt.id
                      ? 'bg-sky-950/80 border-sky-500 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xs font-bold block">{opt.label}</span>
                  <span className="text-[10px] font-mono text-slate-500 block mt-0.5">{opt.flag}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Auto-Merge & Mux Format */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  {lang === 'it' ? 'Unione Automatica Tracce (--mux-after-done)' : 'Auto-Merge Streams (--mux-after-done)'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {lang === 'it' ? 'Combina video, audio e sottotitoli in un singolo file finale' : 'Combines video, audio and subtitles into a single container'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={config.autoMerge}
                onChange={(e) => onChangeConfig({ autoMerge: e.target.checked })}
                className="w-5 h-5 accent-sky-500 rounded cursor-pointer"
              />
            </div>

            {config.autoMerge && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    {lang === 'it' ? 'Formato Contenitore Finale' : 'Output Container Format'}
                  </label>
                  <div className="flex gap-1.5">
                    {(['mp4', 'mkv', 'ts', 'm4a'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => onChangeConfig({ muxFormat: fmt })}
                        className={`px-3 py-1 rounded-lg text-xs font-mono uppercase font-bold transition ${
                          config.muxFormat === fmt
                            ? 'bg-sky-500 text-slate-950 shadow-sm'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    {lang === 'it' ? 'Strumento di Muxing (Muxer)' : 'Muxer Tool'}
                  </label>
                  <div className="flex gap-1.5">
                    {(['ffmpeg', 'mkvmerge'] as const).map((tool) => (
                      <button
                        key={tool}
                        onClick={() => onChangeConfig({ muxTool: tool })}
                        className={`px-3 py-1 rounded-lg text-xs font-mono uppercase font-bold transition ${
                          config.muxTool === tool
                            ? 'bg-indigo-500 text-white shadow-sm'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {tool}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: NETWORK & HEADERS */}
      {activeTab === 'network' && (
        <div className="space-y-4 animate-fadeIn">
          {/* User-Agent Preset Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {lang === 'it' ? 'User-Agent (Selettore Rapido Android / Mobile)' : 'User-Agent (Quick Mobile Presets)'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-2">
              {UA_PRESETS.slice(0, 4).map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => onChangeConfig({ userAgent: preset.value })}
                  className={`p-2 rounded-xl text-left border text-xs transition ${
                    config.userAgent === preset.value
                      ? 'bg-sky-950/80 border-sky-500 text-sky-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="font-semibold block">{preset.label}</span>
                </button>
              ))}
            </div>
            <input
              type="text"
              value={config.userAgent}
              onChange={(e) => onChangeConfig({ userAgent: e.target.value })}
              placeholder="Custom User-Agent string..."
              className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Cookies */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {lang === 'it' ? 'Cookie del Browser (Cookie String)' : 'Browser Cookies (Cookie String)'}
            </label>
            <input
              type="text"
              value={config.cookies}
              onChange={(e) => onChangeConfig({ cookies: e.target.value })}
              placeholder="session=xyz; token=abc..."
              className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Custom Headers Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-300 block">
                  {lang === 'it' ? 'Intestazioni HTTP Personalizzate (-H)' : 'Custom HTTP Headers (-H)'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {lang === 'it' ? 'Aggiungi Authorization, Referer, Origin, ecc.' : 'Add Authorization, Referer, Origin, etc.'}
                </span>
              </div>
              <button
                onClick={handleAddHeader}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-xs font-bold text-slate-950 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'it' ? 'Aggiungi Header' : 'Add Header'}</span>
              </button>
            </div>

            {(config.headers || []).length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center text-xs text-slate-500">
                {lang === 'it' ? 'Nessuna intestazione personalizzata aggiunta.' : 'No custom headers configured.'}
              </div>
            ) : (
              <div className="space-y-2">
                {config.headers.map((h) => (
                  <div key={h.id} className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <input
                      type="checkbox"
                      checked={h.enabled}
                      onChange={(e) => handleUpdateHeader(h.id, { enabled: e.target.checked })}
                      className="w-4 h-4 accent-sky-500 rounded"
                    />
                    <input
                      type="text"
                      value={h.key}
                      onChange={(e) => handleUpdateHeader(h.id, { key: e.target.value })}
                      placeholder="Header (es. Referer)"
                      className="w-1/3 h-8 px-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono focus:border-sky-500"
                    />
                    <input
                      type="text"
                      value={h.value}
                      onChange={(e) => handleUpdateHeader(h.id, { value: e.target.value })}
                      placeholder="Value"
                      className="flex-1 h-8 px-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono focus:border-sky-500"
                    />
                    <button
                      onClick={() => handleRemoveHeader(h.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Proxy & Cloudflare bypass */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {lang === 'it' ? 'Proxy HTTP / SOCKS5 (--proxy)' : 'Proxy HTTP / SOCKS5 (--proxy)'}
              </label>
              <input
                type="text"
                value={config.proxy}
                onChange={(e) => onChangeConfig({ proxy: e.target.value })}
                placeholder="http://127.0.0.1:8080 o socks5://..."
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 self-end h-10">
              <span className="text-xs font-semibold text-slate-300">
                {lang === 'it' ? 'Bypass Cloudflare WAF' : 'Cloudflare WAF Bypass'}
              </span>
              <input
                type="checkbox"
                checked={config.cloudflareBypass}
                onChange={(e) => onChangeConfig({ cloudflareBypass: e.target.checked })}
                className="w-4 h-4 accent-sky-500 rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: DRM & SECURITY */}
      {activeTab === 'security' && (
        <div className="space-y-4 animate-fadeIn">
          {/* DRM Notice Banner */}
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-2.5 text-xs text-amber-200">
            <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">
                {lang === 'it' ? 'Gestione Decrittazione DRM (CENC / Widevine & AES-128)' : 'DRM Decryption Management (CENC & AES-128)'}
              </span>
              {lang === 'it'
                ? 'N_m3u8DL-RE supporta la decrittazione automatica con chiavi esadecimali nel formato KID:KEY (tramite mp4decrypt, shaka-packager o ffmpeg) e l\'override HLS.'
                : 'N_m3u8DL-RE supports decryption using hex KID:KEY pairs via mp4decrypt, shaka-packager or ffmpeg.'}
            </div>
          </div>

          {/* Decryption Engine */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {lang === 'it' ? 'Motore di Decrittazione' : 'Decryption Engine'}
              </label>
              <select
                value={config.decryptionEngine}
                onChange={(e) => onChangeConfig({ decryptionEngine: e.target.value as any })}
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-sky-500 font-mono"
              >
                <option value="mp4decrypt">mp4decrypt (Bento4 - Predefinito)</option>
                <option value="shaka-packager">shaka-packager (--use-shaka-packager)</option>
                <option value="ffmpeg">ffmpeg (Direct decrypter)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {lang === 'it' ? 'Override Metodo HLS (--hls-method-override)' : 'HLS Method Override'}
              </label>
              <select
                value={config.hlsMethodOverride}
                onChange={(e) => onChangeConfig({ hlsMethodOverride: e.target.value as any })}
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-sky-500 font-mono"
              >
                <option value="">Nessuno (Usa valore del manifest)</option>
                <option value="AES-128">AES-128</option>
                <option value="SAMPLE-AES">SAMPLE-AES</option>
                <option value="NONE">NONE (Disabilita)</option>
              </select>
            </div>
          </div>

          {/* Keys Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-300 block">
                  {lang === 'it' ? 'Coppie Chiavi DRM (--key KID:KEY)' : 'DRM Key Pairs (--key KID:KEY)'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {lang === 'it' ? 'Inserisci KID (Key ID) e Chiave esadecimale a 32 caratteri' : 'Enter 32-char Hex Key ID and Key'}
                </span>
              </div>
              <button
                onClick={handleAddKey}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'it' ? 'Aggiungi Chiave' : 'Add Key'}</span>
              </button>
            </div>

            {(config.drmKeys || []).length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center text-xs text-slate-500">
                {lang === 'it' ? 'Nessuna chiave DRM configurata. Aggiungine una per flussi protetti CENC.' : 'No DRM keys specified.'}
              </div>
            ) : (
              <div className="space-y-2">
                {config.drmKeys.map((k) => (
                  <div key={k.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex-1 flex items-center gap-2">
                      <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <input
                        type="text"
                        value={k.kid}
                        onChange={(e) => handleUpdateKey(k.id, { kid: e.target.value })}
                        placeholder="KID (es. eb6767069c434813bed773ea6889d80e)"
                        className="w-full h-8 px-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono focus:border-amber-500"
                      />
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-mono">:</span>
                      <input
                        type="text"
                        value={k.key}
                        onChange={(e) => handleUpdateKey(k.id, { key: e.target.value })}
                        placeholder="KEY (es. d6381e4b38d011c750438a2e5d996614)"
                        className="w-full h-8 px-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-amber-300 font-mono focus:border-amber-500"
                      />
                      <button
                        onClick={() => handleRemoveKey(k.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: MEDIA & MUX */}
      {activeTab === 'media' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Subtitles format & autofix */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-slate-200 block">
              {lang === 'it' ? 'Gestione Sottotitoli' : 'Subtitle Controls'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  {lang === 'it' ? 'Formato Sottotitoli (--sub-format)' : 'Subtitle Format'}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => onChangeConfig({ subtitleFormat: 'srt' })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                      config.subtitleFormat === 'srt' ? 'bg-sky-500 text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-400'
                    }`}
                  >
                    SRT
                  </button>
                  <button
                    onClick={() => onChangeConfig({ subtitleFormat: 'vtt' })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                      config.subtitleFormat === 'vtt' ? 'bg-sky-500 text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-400'
                    }`}
                  >
                    VTT
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-300">
                  {lang === 'it' ? 'Auto-correzione (--auto-fix-sub)' : 'Auto-Fix Subtitles'}
                </span>
                <input
                  type="checkbox"
                  checked={config.autoFixSubtitles}
                  onChange={(e) => onChangeConfig({ autoFixSubtitles: e.target.checked })}
                  className="w-4 h-4 accent-sky-500 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-300">
                  {lang === 'it' ? 'Mantieni originale' : 'Keep Original'}
                </span>
                <input
                  type="checkbox"
                  checked={config.keepOriginalSub}
                  onChange={(e) => onChangeConfig({ keepOriginalSub: e.target.checked })}
                  className="w-4 h-4 accent-sky-500 rounded"
                />
              </div>
            </div>
          </div>

          {/* Language filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {lang === 'it' ? 'Filtro Lingua Audio (--select-audio)' : 'Audio Language Filter'}
              </label>
              <input
                type="text"
                value={config.selectedAudioLanguage}
                onChange={(e) => onChangeConfig({ selectedAudioLanguage: e.target.value })}
                placeholder="es. ita, eng, jpn"
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {lang === 'it' ? 'Filtro Lingua Sottotitoli (--select-subtitle)' : 'Subtitle Language Filter'}
              </label>
              <input
                type="text"
                value={config.selectedSubtitleLanguage}
                onChange={(e) => onChangeConfig({ selectedSubtitleLanguage: e.target.value })}
                placeholder="es. ita, eng"
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:border-sky-500"
              />
            </div>
          </div>

          {/* Ad Keywords & Cleanup */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {lang === 'it' ? 'Parole chiave anti-pubblicità (--ad-keyword)' : 'Ad Removal Keywords'}
              </label>
              <input
                type="text"
                value={config.adKeywords}
                onChange={(e) => onChangeConfig({ adKeywords: e.target.value })}
                placeholder="es. promo, advert, bumper"
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:border-sky-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 self-end h-10">
              <span className="text-xs font-semibold text-slate-300">
                {lang === 'it' ? 'Conserva segmenti temporanei (--no-cleanup)' : 'Keep Raw Chunks (--no-cleanup)'}
              </span>
              <input
                type="checkbox"
                checked={config.keepTemporaryFiles}
                onChange={(e) => onChangeConfig({ keepTemporaryFiles: e.target.checked })}
                className="w-4 h-4 accent-sky-500 rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: LIVE STREAM */}
      {activeTab === 'live' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  {lang === 'it' ? 'Modalità Registrazione Live Stream' : 'Live Stream Recording Mode'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {lang === 'it' ? 'Tratta il flusso live come VOD in tempo reale con registrazione continua' : 'Record ongoing live stream in real-time'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={config.isLive}
                onChange={(e) => onChangeConfig({ isLive: e.target.checked })}
                className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
              />
            </div>

            {config.isLive && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    {lang === 'it' ? 'Limite di Durata Registrazione (--live-record-limit)' : 'Recording Duration Limit'}
                  </label>
                  <input
                    type="text"
                    value={config.liveRecordLimit}
                    onChange={(e) => onChangeConfig({ liveRecordLimit: e.target.value })}
                    placeholder="HH:MM:SS (es. 02:00:00 per 2 ore)"
                    className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono focus:border-rose-500"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 self-end h-10">
                  <span className="text-xs text-slate-300">
                    {lang === 'it' ? 'Merge in tempo reale (--live-real-time-merge)' : 'Real-time Pipe Merge'}
                  </span>
                  <input
                    type="checkbox"
                    checked={config.liveRealTimeMerge}
                    onChange={(e) => onChangeConfig({ liveRealTimeMerge: e.target.checked })}
                    className="w-4 h-4 accent-rose-500 rounded"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 6: ADVANCED */}
      {activeTab === 'advanced' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {lang === 'it' ? 'Livello di Log (--log-level)' : 'Log Verbosity (--log-level)'}
              </label>
              <select
                value={config.logLevel}
                onChange={(e) => onChangeConfig({ logLevel: e.target.value as any })}
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:border-sky-500"
              >
                <option value="INFO">INFO (Consigliato)</option>
                <option value="DEBUG">DEBUG (Dettagliato)</option>
                <option value="WARN">WARN (Solo Avvisi)</option>
                <option value="ERROR">ERROR (Solo Errori)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {lang === 'it' ? 'Cartella Temporanea (--tmp-dir)' : 'Temporary Directory (--tmp-dir)'}
              </label>
              <input
                type="text"
                value={config.tmpDir}
                onChange={(e) => onChangeConfig({ tmpDir: e.target.value })}
                placeholder="/sdcard/Download/.tmp"
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {lang === 'it' ? 'Flag CLI Aggiuntivi N_m3u8DL-RE' : 'Additional Custom CLI Flags'}
            </label>
            <input
              type="text"
              value={config.customFlags}
              onChange={(e) => onChangeConfig({ customFlags: e.target.value })}
              placeholder="--write-meta-json false --check-segments-count false"
              className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:border-sky-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
