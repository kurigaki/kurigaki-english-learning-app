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
// 【設計方針】
// - AudioContext はユーザージェスチャー内の unlockAudio() でのみ生成（TTS干渉防止）
// - initDungeonAudio() は MP3 を ArrayBuffer としてフェッチするだけ（AudioContext不要）
// - unlockAudio() でフェッチ済みデータをデコード。未フェッチ分はフェッチ完了後に逐次デコード
// - BGM: src.start(0) は suspended でも呼べる（resume時に自動再生）
// - SFX: AudioBuffer + 順番再生キュー。context が running でない間はキューで待機
// ─────────────────────────────────────────────────────────────────────────────

const AUDIO_BASE = "/audio/dungeon/";

// ── 音量設定 ─────────────────────────────────────────────────────────────────

export const BGM_DEFAULT_VOL = 0.10;
export const SFX_DEFAULT_VOL = 0.4;

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
    if (_actx) _bgmBufferGain.gain.setValueAtTime(_bgmVol, _actx.currentTime);
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

// ── AudioContext（ユーザージェスチャー内でのみ生成） ──────────────────────────

// _actx は unlockAudio() が呼ばれるまで null のまま
let _actx: AudioContext | null = null;

// ── BGM ───────────────────────────────────────────────────────────────────────

// フェーズ1: 生データ（fetchのみ、AudioContext不要）
let _bgmRaw: ArrayBuffer | null = null;
// フェーズ2: デコード済みバッファ
let _bgmBuffer: AudioBuffer | null = null;
let _bgmSource: AudioBufferSourceNode | null = null;
let _bgmBufferGain: GainNode | null = null;
let _bgmShouldPlay = false;

async function _fetchBgm(): Promise<void> {
  try {
    const res = await fetch(`${AUDIO_BASE}bgm.mp3`);
    if (!res.ok) return;
    _bgmRaw = await res.arrayBuffer();
    // AudioContext が既に解放済みならデコードを試みる
    if (_actx) await _decodeBgm();
  } catch { /* ignore */ }
}

async function _decodeBgm(): Promise<void> {
  if (_bgmBuffer || !_bgmRaw || !_actx) return;
  try {
    _bgmBuffer = await _actx.decodeAudioData(_bgmRaw.slice(0));
    if (_bgmShouldPlay) _playBgmBuffer();
  } catch { /* ignore */ }
}

function _playBgmBuffer(): void {
  if (!_actx || !_bgmBuffer) return;

  if (!_bgmBufferGain) {
    _bgmBufferGain = _actx.createGain();
    _bgmBufferGain.connect(_actx.destination);
  }
  _bgmBufferGain.gain.setValueAtTime(_bgmVol, _actx.currentTime);

  if (_bgmSource) {
    try { _bgmSource.stop(); } catch { /* ignore */ }
    _bgmSource = null;
  }

  const src = _actx.createBufferSource();
  src.buffer = _bgmBuffer;
  src.loop = true;
  src.loopStart = BGM_LOOP_START;
  src.loopEnd = BGM_LOOP_END;
  src.connect(_bgmBufferGain);
  // suspended でも start(0) を呼ぶ: resume() 後に自動再生される（モバイル対応）
  src.start(0);
  _bgmSource = src;
}

function _stopBgmBuffer(): void {
  if (_bgmSource) {
    try { _bgmSource.stop(); } catch { /* ignore */ }
    _bgmSource = null;
  }
}

// ── SFX（Web Audio API: ピーク正規化 + 順番再生キュー） ──────────────────────

// フェーズ1: 生データ
const _sfxRaw = new Map<SfxKey, ArrayBuffer>();
// フェーズ2: デコード済み・正規化済み
const _sfxBuf = new Map<SfxKey, AudioBuffer>();

// 順番再生キュー
const _sfxQueue: SfxKey[] = [];
let _sfxActive = false;
// キューが blocked 中か（context が suspended のとき statechange 待ち）
let _sfxWaiting = false;

// ピーク正規化（in-place）
function _normalizePeak(buffer: AudioBuffer): AudioBuffer {
  let peak = 0;
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < data.length; i++) {
      const abs = Math.abs(data[i]);
      if (abs > peak) peak = abs;
    }
  }
  if (peak > 0 && peak < 0.98) {
    const scale = 0.98 / peak;
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < data.length; i++) {
        data[i] *= scale;
      }
    }
  }
  return buffer;
}

// SFX 1件をフェッチ→デコード（AudioContext 有無に対応）
async function _loadAndDecodeSfx(key: SfxKey): Promise<void> {
  try {
    const res = await fetch(`${AUDIO_BASE}${key}.mp3`);
    if (!res.ok) return;
    const raw = await res.arrayBuffer();
    if (_actx) {
      // AudioContext 解放済み: 即デコード
      const buf = await _actx.decodeAudioData(raw);
      _sfxBuf.set(key, _normalizePeak(buf));
    } else {
      // AudioContext 未解放: 生データを保存しておき、unlockAudio() でデコード
      _sfxRaw.set(key, raw);
    }
  } catch { /* ignore */ }
}

// unlockAudio() 後: フェッチ済みの生データをまとめてデコード
async function _decodePendingSfx(): Promise<void> {
  if (!_actx) return;
  await Promise.all(
    SFX_KEYS.filter((k) => !_sfxBuf.has(k) && _sfxRaw.has(k)).map(async (key) => {
      const raw = _sfxRaw.get(key)!;
      try {
        const buf = await _actx!.decodeAudioData(raw.slice(0));
        _sfxBuf.set(key, _normalizePeak(buf));
      } catch { /* ignore */ }
    })
  );
}

// キューを順番に消化する
function _drainSfxQueue(): void {
  if (_sfxQueue.length === 0) {
    _sfxActive = false;
    _sfxWaiting = false;
    return;
  }
  if (!_actx || _actx.state !== "running") {
    // suspended: statechange で再トリガー（キューは捨てない）
    if (!_sfxWaiting && _actx) {
      _sfxWaiting = true;
      const onState = () => {
        if (_actx!.state === "running") {
          _actx!.removeEventListener("statechange", onState);
          _sfxWaiting = false;
          _drainSfxQueue();
        }
      };
      _actx.addEventListener("statechange", onState);
    }
    return;
  }
  const key = _sfxQueue.shift()!;
  const buf = _sfxBuf.get(key);
  if (!buf) {
    // 未デコード: スキップして次へ（フェッチが遅かった場合）
    _drainSfxQueue();
    return;
  }
  const src = _actx.createBufferSource();
  src.buffer = buf;
  const gain = _actx.createGain();
  gain.gain.setValueAtTime(_sfxVol, _actx.currentTime);
  src.connect(gain);
  gain.connect(_actx.destination);
  src.onended = () => _drainSfxQueue();
  src.start(0);
}

function playSfx(key: SfxKey): void {
  _sfxQueue.push(key);
  if (!_sfxActive) {
    _sfxActive = true;
    _drainSfxQueue();
  }
}

// ── MP3 プリロード ────────────────────────────────────────────────────────────

let _initialized = false;

export function initDungeonAudio(): void {
  if (typeof window === "undefined" || _initialized) return;
  _initialized = true;

  _loadVolumes();

  // BGM フェッチ（AudioContext不要、デコードはunlockAudio後）
  _fetchBgm();

  // SFX フェッチ + 可能なら即デコード（AudioContext 解放済みなら _loadAndDecodeSfx 内でデコード）
  for (const key of SFX_KEYS) {
    _loadAndDecodeSfx(key);
  }
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

// ユーザーインタラクション時に AudioContext を生成・解放する（スマホ対応）
// startBGM() より先にボタンクリックハンドラで呼ぶこと
export function unlockAudio(): void {
  if (typeof window === "undefined") return;
  if (!_actx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return;
    _actx = new AC();
  }
  if (_actx.state === "suspended") {
    _actx.resume().catch(() => {});
  }
  // フェッチ済みの SFX 生データをデコード、BGM もデコード
  _decodePendingSfx().catch(() => {});
  _decodeBgm().catch(() => {});
}

export function startBGM(): void {
  _bgmShouldPlay = true;
  if (_bgmBuffer) {
    _playBgmBuffer();
  }
  // バッファ未準備の場合: _decodeBgm() または _fetchBgm() 完了後に自動再生
}

export function stopBGM(): void {
  _bgmShouldPlay = false;
  _stopBgmBuffer();
}
