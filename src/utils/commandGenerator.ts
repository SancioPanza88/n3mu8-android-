import { NReConfig } from '../types';

export function generateCliCommand(config: NReConfig): string {
  const parts: string[] = ['N_m3u8DL-RE'];

  // Stream URL
  if (config.url.trim()) {
    parts.push(`"${config.url.trim()}"`);
  } else {
    parts.push('"<STREAM_URL>"');
  }

  // Save Name & Directory
  if (config.saveName.trim()) {
    parts.push(`--save-name "${config.saveName.trim()}"`);
  }
  if (config.saveDir.trim()) {
    parts.push(`--save-dir "${config.saveDir.trim()}"`);
  }
  if (config.savePattern.trim()) {
    parts.push(`--save-pattern "${config.savePattern.trim()}"`);
  }
  if (config.tmpDir.trim()) {
    parts.push(`--tmp-dir "${config.tmpDir.trim()}"`);
  }

  // Threads & Speed Limit
  if (config.threadCount && config.threadCount !== 16) {
    parts.push(`--thread-count ${config.threadCount}`);
  }
  if (config.downloadSpeedLimit.trim()) {
    parts.push(`--max-speed ${config.downloadSpeedLimit.trim()}`);
  }

  // Stream Selection
  if (config.binarySelect === 'auto-best') {
    parts.push('--auto-select');
  } else if (config.binarySelect === 'video-only') {
    parts.push('--skip-audio');
  } else if (config.binarySelect === 'audio-only') {
    parts.push('--skip-video');
  }

  if (config.selectedVideoResolution.trim()) {
    parts.push(`--select-video res="${config.selectedVideoResolution.trim()}":for="best"`);
  }
  if (config.selectedAudioLanguage.trim()) {
    parts.push(`--select-audio lang="${config.selectedAudioLanguage.trim()}":for="best"`);
  }
  if (config.selectedSubtitleLanguage.trim()) {
    parts.push(`--select-subtitle lang="${config.selectedSubtitleLanguage.trim()}"`);
  }

  // Muxing
  if (config.autoMerge) {
    parts.push(`--mux-after-done format=${config.muxFormat}:muxer=${config.muxTool}`);
  } else {
    parts.push('--no-merge');
  }

  // Subtitles
  if (config.subtitleFormat) {
    parts.push(`--sub-format ${config.subtitleFormat.toUpperCase()}`);
  }
  if (config.autoFixSubtitles) {
    parts.push('--auto-fix-sub');
  }
  if (config.keepOriginalSub) {
    parts.push('--keep-original-sub');
  }

  // Headers
  const activeHeaders = (config.headers || []).filter(h => h.enabled && h.key.trim() && h.value.trim());
  for (const h of activeHeaders) {
    parts.push(`-H "${h.key.trim()}: ${h.value.trim()}"`);
  }

  // Cookies
  if (config.cookies.trim()) {
    parts.push(`-H "Cookie: ${config.cookies.trim()}"`);
  }

  // Proxy
  if (config.proxy.trim()) {
    parts.push(`--proxy "${config.proxy.trim()}"`);
  }

  // User Agent
  if (config.userAgent.trim()) {
    parts.push(`-H "User-Agent: ${config.userAgent.trim()}"`);
  }

  // DRM Keys
  for (const keyItem of config.drmKeys || []) {
    if (keyItem.kid.trim() && keyItem.key.trim()) {
      parts.push(`--key ${keyItem.kid.trim()}:${keyItem.key.trim()}`);
    } else if (keyItem.key.trim() && !keyItem.kid.trim()) {
      parts.push(`--key ${keyItem.key.trim()}`);
    }
  }

  // Decryption engine & HLS override
  if (config.decryptionEngine && config.decryptionEngine !== 'mp4decrypt') {
    if (config.decryptionEngine === 'shaka-packager') {
      parts.push('--use-shaka-packager');
    } else if (config.decryptionEngine === 'ffmpeg') {
      parts.push('--decryption-binary-path ffmpeg');
    }
  }

  if (config.hlsMethodOverride) {
    parts.push(`--hls-method-override ${config.hlsMethodOverride}`);
  }

  if (config.skipVideo) {
    parts.push('--skip-video');
  }
  if (config.skipAudio) {
    parts.push('--skip-audio');
  }

  if (config.adKeywords.trim()) {
    parts.push(`--ad-keyword "${config.adKeywords.trim()}"`);
  }

  if (config.keepTemporaryFiles) {
    parts.push('--no-cleanup');
  }

  // Live Options
  if (config.isLive) {
    if (config.liveRecordLimit.trim()) {
      parts.push(`--live-record-limit ${config.liveRecordLimit.trim()}`);
    }
    if (config.liveRealTimeMerge) {
      parts.push('--live-real-time-merge');
    }
    if (config.liveWaitTime && config.liveWaitTime !== 15) {
      parts.push(`--live-wait-time ${config.liveWaitTime}`);
    }
  }

  // Log Level
  if (config.logLevel && config.logLevel !== 'INFO') {
    parts.push(`--log-level ${config.logLevel}`);
  }

  // Custom Extra Flags
  if (config.customFlags.trim()) {
    parts.push(config.customFlags.trim());
  }

  return parts.join(' ');
}

export function generateTermuxScript(config: NReConfig): string {
  const cliCommand = generateCliCommand(config);
  const saveFolder = config.saveDir || '/sdcard/Download';

  return `#!/data/data/com.termux/files/usr/bin/bash
# ==========================================================
# Script di Download N_m3u8DL-RE per Android Termux
# Generato da N_m3u8DL-RE Android GUI
# ==========================================================

set -e

# Colori per il terminale Android
GREEN='\\033[0;32m'
BLUE='\\033[0;34m'
YELLOW='\\033[1;33m'
RED='\\033[0;31m'
NC='\\033[0m'

echo -e "\${BLUE}==> Controllo ambiente Android / Termux...\${NC}"

# 1. Verifica architettura (arm64, arm, x86_64)
ARCH=$(uname -m)
echo "Architettura rilevata: \$ARCH"

# 2. Controllo e installazione dipendenze essenziali
if ! command -v ffmpeg &> /dev/null; then
    echo -e "\${YELLOW}FFmpeg non trovato. Installazione automatica con pkg...\${NC}"
    pkg update -y && pkg install -y ffmpeg curl tar
fi

# 3. Controllo binario N_m3u8DL-RE in Termux
BIN_PATH="\$PREFIX/bin/N_m3u8DL-RE"
if [ ! -f "\$BIN_PATH" ]; then
    echo -e "\${YELLOW}N_m3u8DL-RE non presente in \$PREFIX/bin.\${NC}"
    echo -e "\${BLUE}Scaricamento automatico dell'ultima versione Linux ARM64...\${NC}"
    
    # URL di rilascio ufficiale N_m3u8DL-RE per Linux ARM64
    TMP_TAR="/data/data/com.termux/files/usr/tmp/nm3u8dl.tar.gz"
    mkdir -p /data/data/com.termux/files/usr/tmp
    
    # Download binary
    curl -L -o "\$TMP_TAR" "https://github.com/nilaoda/N_m3u8DL-RE/releases/latest/download/N_m3u8DL-RE_Beta_linux-arm64.tar.gz"
    
    if [ -f "\$TMP_TAR" ]; then
        tar -xzf "\$TMP_TAR" -C "\$PREFIX/bin/"
        chmod +x "\$BIN_PATH"
        rm -f "\$TMP_TAR"
        echo -e "\${GREEN}N_m3u8DL-RE installato con successo in \$PREFIX/bin!\${NC}"
    else
        echo -e "\${RED}Errore durante il download del binario ARM64. Verifica la connessione.\${NC}"
    fi
fi

# 4. Controllo permessi di archiviazione
mkdir -p "${saveFolder}"

echo -e "\${GREEN}==> Avvio del download in: ${saveFolder}\${NC}"
echo -e "\${BLUE}Comando: ${cliCommand}\${NC}"
echo "--------------------------------------------------------"

# 5. Esecuzione del comando
cd "${saveFolder}"
${cliCommand}

echo "--------------------------------------------------------"
echo -e "\${GREEN} Download completato! File salvato in: ${saveFolder}\${NC}"
`;
}
