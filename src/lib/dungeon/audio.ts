"use client";

// ─────────────────────────────────────────────────────────────────────────────
// ダンジョン音声モジュール
//
// 【MP3ファイルの配置方法】
// 以下のファイルを public/audio/dungeon/ に置くと自動で使用されます。
// ファイルがない場合は無音になります（MP3ファイルを必ず用意してください）。
//
//   BGM:
//     bgm.mp3           - ダンジョン探索BGM（ループ再生）
//
//   効果音:
//     sfx_hit.mp3       - 通常攻撃ヒット
//     sfx_crit.mp3      - 会心ヒット
//     sfx_miss.mp3      - 攻撃ミス
//     sfx_recv.mp3      - ダメージを受けた
//     sfx_correct.mp3   - クイズ正解
//     sfx_wrong.mp3     - クイズ不正解
//     sfx_levelup.mp3   - レベルアップ
//     sfx_stairs.mp3    - 階段を降りる
//     sfx_warp.mp3      - ワープ（ワープ草・杖・罠）
//     sfx_item_get.mp3  - アイテム拾う
//     sfx_item_use.mp3  - アイテム使用（草・巻物・食料）
//     sfx_cane.mp3      - 杖を振る
//
// 【BGMループポイント設定】
// AudioBufferSourceNode の loopStart / loopEnd に設定する秒数です。
// Web Audio API はサンプル単位で正確にループするため MP3 のズレが発生しません。
// 曲の尺に合わせて下記を編集してください。
const BGM_LOOP_START = 14.222;        // ループ始点（秒）
const BGM_LOOP_END   = 3 * 60 + 36.888; // ループ終点（秒）= 216.888
//
// ─────────────────────────────────────────────────────────────────────────────

const AUDIO_BASE = "/audio/dungeon/";

// ── 音量設定 ─────────────────────────────────────────────────────────────────

// デフォルト音量（0〜1）
// BGM は英語音声の邪魔にならない程度に控えめ
const BGM_DEFAULT_VOL = 0.08;
const SFX_DEFAULT_VOL = 0.4;

const AUDIO_VOL_KEY = "dungeon_audio_vol";

let _bgmVol = BGM_DEFAULT_VOL;
let _sfxVol = SFX_DEFAULT_VOL;

function _loadVolumes(): void {
  try {
    const raw = localStorage.getItem(AUDIO_VOL_KEY);
    if (!raw) return;
    const v = JSON.parse(raw) as { bgm?: number; sfx?: number };
    if (typeof v.bgm === "number") _bgmVol = Math.max(0, Math.min(1, v.bgm));
    if (typeof v.sfx === "number") _sfxVol = Math.max(0, Math.min(1, v.sfx));
  } catch { /* ignore */ }
}

function _saveVolumes(): void {
  try {
    localStorage.setItem(AUDIO_VOL_KEY, JSON.stringify({ bgm: _bgmVol, sfx: _sfxVol }));
  } catch { /* ignore */ }
}

export function getBgmVolume(): number { return _bgmVol; }
export function getSfxVolume(): number { return _sfxVol; }

export function setBgmVolume(vol: number): void {
  _bgmVol = Math.max(0, Math.min(1, vol));
  if (_bgmBufferGain) {
    const ac = getACtx();
    if (ac) _bgmBufferGain.gain.setValueAtTime(_bgmVol, ac.currentTime);
  }
  _saveVolumes();
}

export function setSfxVolume(vol: number): void {
  _sfxVol = Math.max(0, Math.min(1, vol));
  _saveVolumes();
}

// ── SFX キー一覧 ─────────────────────────────────────────────────────────────

const SFX_KEYS = [
  "sfx_hit",
  "sfx_crit",
  "sfx_miss",
  "sfx_recv",
  "sfx_correct",
  "sfx_wrong",
  "sfx_levelup",
  "sfx_stairs",
  "sfx_warp",
  "sfx_item_get",
  "sfx_item_use",
  "sfx_cane",
] as const;
type SfxKey = (typeof SFX_KEYS)[number];

// ロード済みの SFX 要素
const sfxReady = new Map<SfxKey, HTMLAudioElement>();

// ── Web Audio API ─────────────────────────────────────────────────────────────

let _actx: AudioContext | null = null;

function getACtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!_actx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    _actx = new AC();
  }
  if (_actx.state === "suspended") _actx.resume();
  return _actx;
}

// ── BGM（AudioBuffer 方式: サンプル単位の正確なループ） ────────────────────

let _bgmBuffer: AudioBuffer | null = null;
let _bgmSource: AudioBufferSourceNode | null = null;
let _bgmBufferGain: GainNode | null = null;
let _bgmShouldPlay = false;

async function _loadBgmBuffer(): Promise<void> {
  try {
    const res = await fetch(`${AUDIO_BASE}bgm.mp3`);
    if (!res.ok) return;
    const arrayBuf = await res.arrayBuffer();
    const ac = getACtx();
    if (!ac) return;
    _bgmBuffer = await ac.decodeAudioData(arrayBuf);
    if (_bgmShouldPlay) {
      _playBgmBuffer();
    }
  } catch { /* ignore */ }
}

function _playBgmBuffer(): void {
  const ac = getACtx();
  if (!ac || !_bgmBuffer) return;

  if (!_bgmBufferGain) {
    _bgmBufferGain = ac.createGain();
    _bgmBufferGain.connect(ac.destination);
  }
  _bgmBufferGain.gain.setValueAtTime(_bgmVol, ac.currentTime);

  if (_bgmSource) {
    try { _bgmSource.stop(); } catch { /* ignore */ }
    _bgmSource = null;
  }

  const src = ac.createBufferSource();
  src.buffer = _bgmBuffer;
  src.loop = true;
  src.loopStart = BGM_LOOP_START;
  src.loopEnd = BGM_LOOP_END;
  src.connect(_bgmBufferGain);
  src.start(0);
  _bgmSource = src;
}

function _stopBgmBuffer(): void {
  if (_bgmSource) {
    try { _bgmSource.stop(); } catch { /* ignore */ }
    _bgmSource = null;
  }
}

// ── MP3 プリロード ────────────────────────────────────────────────────────────

let _initialized = false;

export function initDungeonAudio(): void {
  if (typeof window === "undefined" || _initialized) return;
  _initialized = true;

  _loadVolumes();

  for (const key of SFX_KEYS) {
    const el = new Audio(`${AUDIO_BASE}${key}.mp3`);
    el.preload = "auto";
    el.addEventListener("canplaythrough", () => { sfxReady.set(key, el); }, { once: true });
    el.load();
  }

  _loadBgmBuffer();
}

// ── SFX 再生ヘルパー（MP3のみ・フォールバックなし） ────────────────────────

function playSfx(key: SfxKey): void {
  const el = sfxReady.get(key);
  if (!el) return;
  const clone = el.cloneNode() as HTMLAudioElement;
  clone.volume = _sfxVol;
  clone.play().catch(() => { /* ignore */ });
}

// ── 効果音 API ────────────────────────────────────────────────────────────────

export function sfxHit(): void      { playSfx("sfx_hit"); }
export function sfxCrit(): void     { playSfx("sfx_crit"); }
export function sfxMiss(): void     { playSfx("sfx_miss"); }
export function sfxRecv(): void     { playSfx("sfx_recv"); }
export function sfxCorrect(): void  { playSfx("sfx_correct"); }
export function sfxWrong(): void    { playSfx("sfx_wrong"); }
export function sfxLevelUp(): void  { playSfx("sfx_levelup"); }
export function sfxStairs(): void   { playSfx("sfx_stairs"); }
export function sfxWarp(): void     { playSfx("sfx_warp"); }
export function sfxItemGet(): void  { playSfx("sfx_item_get"); }
export function sfxItemUse(): void  { playSfx("sfx_item_use"); }
export function sfxCane(): void     { playSfx("sfx_cane"); }

// ── BGM 公開 API ──────────────────────────────────────────────────────────────

export function startBGM(): void {
  _bgmShouldPlay = true;
  if (_bgmBuffer) {
    _playBgmBuffer();
  }
  // ロード中の場合は _loadBgmBuffer() 完了時に自動再生される
}

export function stopBGM(): void {
  _bgmShouldPlay = false;
  _stopBgmBuffer();
}
