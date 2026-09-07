import React, { useState } from 'react';
import {
  Terminal,
  Copy,
  Check,
  Download,
  ExternalLink,
  Smartphone,
  ShieldCheck,
  Cpu,
  FolderDown,
  PlayCircle,
  HelpCircle,
} from 'lucide-react';
import { NReConfig } from '../types';
import { generateCliCommand, generateTermuxScript } from '../utils/commandGenerator';

interface TermuxBridgeProps {
  config: NReConfig;
  lang: 'it' | 'en';
}

export const TermuxBridge: React.FC<TermuxBridgeProps> = ({ config, lang }) => {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedSetup, setCopiedSetup] = useState(false);
  const [showFullScript, setShowFullScript] = useState(false);

  const cliCommand = generateCliCommand(config);
  const termuxScript = generateTermuxScript(config);

  const termuxSetupCmd = `pkg update -y && pkg install -y ffmpeg curl tar && termux-setup-storage && curl -L "https://github.com/nilaoda/N_m3u8DL-RE/releases/latest/download/N_m3u8DL-RE_Beta_linux-arm64.tar.gz" -o /data/data/com.termux/files/usr/tmp/nm3u8dl.tar.gz && tar -xzf /data/data/com.termux/files/usr/tmp/nm3u8dl.tar.gz -C $PREFIX/bin/ && chmod +x $PREFIX/bin/N_m3u8DL-RE && echo "N_m3u8DL-RE pronto!"`;

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(cliCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(termuxScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleCopySetup = () => {
    navigator.clipboard.writeText(termuxSetupCmd);
    setCopiedSetup(true);
    setTimeout(() => setCopiedSetup(false), 2000);
  };

  const handleDownloadScript = () => {
    const blob = new Blob([termuxScript], { type: 'text/x-sh' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nm3u8dl_${config.saveName || 'download'}.sh`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="termux-bridge" className="space-y-4">
      {/* Live Command Bar with Quick Copy */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm sm:text-base font-semibold text-white">
              {lang === 'it' ? 'Comando CLI Android / Termux Generato' : 'Generated CLI Command for Android'}
            </h3>
          </div>
          <button
            id="btn-copy-cli"
            onClick={handleCopyCmd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-sm"
          >
            {copiedCmd ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCmd ? (lang === 'it' ? 'Copiato!' : 'Copied!') : (lang === 'it' ? 'Copia Comando' : 'Copy CLI')}</span>
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 break-all leading-relaxed max-h-36 overflow-y-auto">
          {cliCommand}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <span className="text-[11px] text-slate-400">
            {lang === 'it'
              ? 'Pronto per l\'esecuzione immediata nel terminale Termux su Android.'
              : 'Ready for instant execution inside Termux terminal on Android.'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadScript}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>{lang === 'it' ? 'Scarica Script .sh' : 'Download .sh'}</span>
            </button>
            <button
              onClick={handleCopyScript}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
            >
              {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{lang === 'it' ? 'Copia Script Bash' : 'Copy Bash Script'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Complete Step-by-Step Android Setup Card */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Smartphone className="w-5 h-5 text-sky-400" />
          <h3 className="text-sm sm:text-base font-semibold text-white">
            {lang === 'it' ? 'Come eseguire N_m3u8DL-RE su Android a massima velocità' : 'How to run N_m3u8DL-RE on Android at full speed'}
          </h3>
        </div>

        <div className="space-y-3">
          {/* Step 1 */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              1
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-white block">
                {lang === 'it' ? 'Installa Termux sul dispositivo Android' : 'Install Termux on your Android device'}
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'it'
                  ? 'Termux è il terminale Linux gratuito per Android. Scaricalo da F-Droid o GitHub (evita la versione non aggiornata del Play Store).'
                  : 'Termux is a free Linux terminal emulator for Android. Download it from F-Droid or GitHub.'}
              </p>
              <a
                href="https://f-droid.org/packages/com.termux/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-medium mt-1"
              >
                <span>Scarica Termux su F-Droid</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              2
            </div>
            <div className="space-y-1 flex-1">
              <span className="text-xs font-semibold text-white block">
                {lang === 'it' ? 'Inizializzazione Rapida One-Liner (FFmpeg + N_m3u8DL-RE ARM64)' : 'One-Liner Quick Setup (FFmpeg + N_m3u8DL-RE ARM64)'}
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'it'
                  ? 'Apri Termux e incolla questo comando singolo. Configurerà FFmpeg, i permessi di archiviazione nella memoria interna e scaricherà il binario compilato nativo ARM64 di N_m3u8DL-RE:'
                  : 'Open Termux and run this single command to install FFmpeg, storage permissions and ARM64 binary:'}
              </p>

              <div className="mt-2 relative">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-indigo-300 break-all pr-20">
                  {termuxSetupCmd}
                </div>
                <button
                  onClick={handleCopySetup}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold text-white transition flex items-center gap-1"
                >
                  {copiedSetup ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSetup ? 'Copiato!' : 'Copia'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              3
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-white block">
                {lang === 'it' ? 'Esegui il download' : 'Start downloading'}
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'it'
                  ? 'Incolla il comando generato in Termux (o esegui lo script scaricato con `bash nm3u8dl_*.sh`). I file multimediali completi verranno salvati direttamente nella cartella Download del tuo telefono!'
                  : 'Paste the generated command or run the downloaded script in Termux. Finished files are saved in your phone’s Download folder!'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
