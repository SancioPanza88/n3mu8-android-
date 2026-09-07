import { PresetDemo } from '../types';

export const PRESET_DEMOS: PresetDemo[] = [
  {
    name: 'Big Buck Bunny (HLS Multi-Quality)',
    description: 'Flusso HLS con risoluzioni da 360p fino a 1080p Full HD, tracce audio AAC e segmentazione TS.',
    type: 'HLS',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    config: {
      saveName: 'BigBuckBunny_1080p',
      threadCount: 16,
      autoMerge: true,
      muxFormat: 'mp4',
      selectedVideoResolution: '1920x1080',
    },
  },
  {
    name: 'Tears of Steel (DASH 4K Multi-Audio)',
    description: 'Flusso MPEG-DASH con risoluzioni 4K UHD, audio surround multilingua e sottotitoli WebVTT.',
    type: 'DASH',
    url: 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd',
    config: {
      saveName: 'TearsOfSteel_DASH',
      threadCount: 24,
      autoMerge: true,
      muxFormat: 'mkv',
      selectedAudioLanguage: 'ita',
    },
  },
  {
    name: 'Sintel (HLS con Sottotitoli & Audio)',
    description: 'Stream open-source con audio stereo limpido, tracce sottotitoli multiple (Italiano, Inglese, Francese, Spagnolo).',
    type: 'HLS',
    url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    config: {
      saveName: 'Sintel_FullHD',
      threadCount: 16,
      autoMerge: true,
      muxFormat: 'mp4',
      selectedSubtitleLanguage: 'ita',
      subtitleFormat: 'srt',
      autoFixSubtitles: true,
    },
  },
  {
    name: 'AES-128 Encrypted HLS Sample',
    description: 'Stream cifrato con chiave AES-128 standard (#EXT-X-KEY) per testare l\'override del metodo di decrittazione.',
    type: 'HLS',
    url: 'https://playertest.longtailvideo.com/adaptive/oceans_aes/oceans_aes.m3u8',
    config: {
      saveName: 'Oceans_Encrypted',
      threadCount: 8,
      hlsMethodOverride: 'AES-128',
      autoMerge: true,
      muxFormat: 'mp4',
    },
  },
];
