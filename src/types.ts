/**
 * Types and interfaces for N_m3u8DL-RE Android GUI
 */

export interface VideoVariant {
  bandwidth: number;
  resolution: string;
  codecs?: string;
  frameRate?: string;
  name?: string;
  uri?: string;
  id?: string;
  mime?: string;
}

export interface AudioTrack {
  group?: string;
  name: string;
  language: string;
  uri?: string;
  mime?: string;
}

export interface SubtitleTrack {
  group?: string;
  name: string;
  language: string;
  uri?: string;
  mime?: string;
}

export interface EncryptionInfo {
  method: string;
  format?: string;
  uri?: string;
  raw?: string;
  psshCount?: number;
}

export interface StreamProbeResult {
  type: 'HLS' | 'DASH' | 'DIRECT';
  url: string;
  contentType?: string;
  contentLength?: number;
  rawPreview?: string;
  variants: VideoVariant[];
  audios: AudioTrack[];
  subtitles: SubtitleTrack[];
  encryption: EncryptionInfo[];
  totalSegmentsEstimate?: number;
}

export interface HeaderItem {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface DrmKeyItem {
  id: string;
  kid: string;
  key: string;
  comment?: string;
}

export interface NReConfig {
  // Base
  url: string;
  saveName: string;
  saveDir: string;
  savePattern: string;
  tmpDir: string;

  // Download section
  threadCount: number;
  downloadSpeedLimit: string;
  binarySelect: 'auto-best' | 'video-only' | 'audio-only' | 'custom';
  selectedVideoResolution: string;
  selectedAudioLanguage: string;
  selectedSubtitleLanguage: string;
  autoMerge: boolean;
  muxFormat: 'mp4' | 'mkv' | 'ts' | 'm4a';
  muxTool: 'ffmpeg' | 'mkvmerge';
  autoResume: boolean;

  // Network section
  headers: HeaderItem[];
  cookies: string;
  proxy: string;
  userAgent: string;
  maxRetries: number;
  retryDelay: number;
  cloudflareBypass: boolean;

  // Security / DRM
  drmKeys: DrmKeyItem[];
  decryptionEngine: 'mp4decrypt' | 'shaka-packager' | 'ffmpeg';
  hlsMethodOverride: '' | 'AES-128' | 'SAMPLE-AES' | 'NONE';
  realTimeDecryption: boolean;

  // Media & Mux
  subtitleFormat: 'srt' | 'vtt';
  autoFixSubtitles: boolean;
  keepOriginalSub: boolean;
  skipVideo: boolean;
  skipAudio: boolean;
  adKeywords: string;
  keepTemporaryFiles: boolean;

  // Live
  isLive: boolean;
  liveRecordLimit: string;
  liveRealTimeMerge: boolean;
  liveWaitTime: number;

  // Advanced
  logLevel: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR';
  customFlags: string;
}

export interface PresetDemo {
  name: string;
  description: string;
  type: 'HLS' | 'DASH' | 'DRM';
  url: string;
  config: Partial<NReConfig>;
}
