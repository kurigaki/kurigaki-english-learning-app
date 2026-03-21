"use client";

// ─────────────────────────────────────────────────────────────────────────────
// ダンジョン音声モジュール
//
// 【MP3ファイルの配置方法】
// 以下のファイルを public/audio/dungeon/ に置くと自動で使用されます。
// ファイルがない場合は Web Audio API によるピクセルサウンドにフォールバックします。
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
//     sfx_stairs.mp3    - 階段・ワープ
//     sfx_item.mp3      - アイテム取得・使用
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
const BGM_DEFAULT_VOL = 0.15;
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
  // ライブ反映: AudioBuffer BGM
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

// SFX キー一覧
const SFX_KEYS = [
  "sfx_hit",
  "sfx_crit",
  "sfx_miss",
  "sfx_recv",
  "sfx_correct",
  "sfx_wrong",
  "sfx_levelup",
  "sfx_stairs",
  "sfx_item",
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

let _bgmBuffer: AudioBuffer | null = null;       // デコード済みの PCM データ
let _bgmSource: AudioBufferSourceNode | null = null; // 再生中のソース
let _bgmBufferGain: GainNode | null = null;      // 音量制御ノード
let _bgmShouldPlay = false;                      // startBGM() が呼ばれた後 true

// MP3 を fetch → decodeAudioData でロード（非同期・initDungeonAudio から呼ぶ）
async function _loadBgmBuffer(): Promise<void> {
  try {
    const res = await fetch(`${AUDIO_BASE}bgm.mp3`);
    if (!res.ok) return; // ファイルなし → Web Audio フォールバックのまま
    const arrayBuf = await res.arrayBuffer();
    const ac = getACtx();
    if (!ac) return;
    _bgmBuffer = await ac.decodeAudioData(arrayBuf);
    // ロード完了時点で startBGM() が呼ばれていたら即再生
    if (_bgmShouldPlay) {
      _playBgmBuffer();
    }
  } catch {
    // ファイルなし・デコードエラー → フォールバックのまま
  }
}

function _playBgmBuffer(): void {
  const ac = getACtx();
  if (!ac || !_bgmBuffer) return;

  // ゲインノードを一度だけ生成（音量制御用）
  if (!_bgmBufferGain) {
    _bgmBufferGain = ac.createGain();
    _bgmBufferGain.gain.setValueAtTime(_bgmVol, ac.currentTime);
    _bgmBufferGain.connect(ac.destination);
  } else {
    _bgmBufferGain.gain.setValueAtTime(_bgmVol, ac.currentTime);
  }

  // 前のソースがあれば停止
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
  // ゲインノードはキープ（setBgmVolume で再利用するため）
}

// Web Audio BGM フォールバックは削除済み（bgm.mp3 を使用）

// ── SFX Web Audio フォールバック ─────────────────────────────────────────────

export function playTone(
  freq: number,
  dur: number,
  vol: number,
  type: OscillatorType = "square",
  freqEnd: number | null = null,
  delay = 0
): void {
  try {
    const ac = getACtx();
    if (!ac) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = type;
    const t = ac.currentTime + delay;
    osc.frequency.setValueAtTime(freq, t);
    if (freqEnd !== null)
      osc.frequency.exponentialRampToValueAtTime(freqEnd, t + dur * 0.9);
    const scaledVol = vol * _sfxVol;
    gain.gain.setValueAtTime(scaledVol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.start(t);
    osc.stop(t + dur + 0.01);
  } catch { /* ignore */ }
}

// ── MP3 プリロード ────────────────────────────────────────────────────────────

let _initialized = false;

export function initDungeonAudio(): void {
  if (typeof window === "undefined" || _initialized) return;
  _initialized = true;

  // localStorage から音量を復元
  _loadVolumes();

  // SFX を HTMLAudioElement でプリロード
  for (const key of SFX_KEYS) {
    const el = new Audio(`${AUDIO_BASE}${key}.mp3`);
    el.preload = "auto";
    el.addEventListener("canplaythrough", () => { sfxReady.set(key, el); }, { once: true });
    el.load();
  }

  // BGM を Web Audio API でロード（サンプル単位の正確なループのため）
  _loadBgmBuffer();
}

// ── SFX 再生ヘルパー ──────────────────────────────────────────────────────────

function playSfx(key: SfxKey, fallback: () => void): void {
  const el = sfxReady.get(key);
  if (el) {
    const clone = el.cloneNode() as HTMLAudioElement;
    clone.volume = _sfxVol;
    clone.play().catch(() => fallback());
  } else {
    fallback();
  }
}

// ── 効果音 API ────────────────────────────────────────────────────────────────

export function sfxHit(): void {
  playSfx("sfx_hit", () => {
    playTone(180, 0.04, 0.3, "square", 80);
    playTone(260, 0.06, 0.2, "square", 120, 0.02);
  });
}

export function sfxCrit(): void {
  playSfx("sfx_crit", () => {
    playTone(320, 0.04, 0.35, "square", 160);
    playTone(480, 0.08, 0.25, "square", 200, 0.03);
    playTone(240, 0.1, 0.2, "sawtooth", 120, 0.06);
  });
}

export function sfxMiss(): void {
  playSfx("sfx_miss", () => {
    playTone(120, 0.08, 0.15, "sine", 90);
  });
}

export function sfxRecv(): void {
  playSfx("sfx_recv", () => {
    playTone(90, 0.05, 0.4, "sawtooth", 60);
    playTone(70, 0.12, 0.25, "square", 50, 0.04);
  });
}

export function sfxCorrect(): void {
  playSfx("sfx_correct", () => {
    playTone(523, 0.07, 0.2, "sine");
    playTone(659, 0.07, 0.2, "sine", null, 0.08);
    playTone(784, 0.1, 0.2, "sine", null, 0.16);
  });
}

export function sfxWrong(): void {
  playSfx("sfx_wrong", () => {
    playTone(220, 0.05, 0.2, "sawtooth", 180);
    playTone(160, 0.12, 0.2, "sawtooth", 120, 0.06);
  });
}

export function sfxLevelUp(): void {
  playSfx("sfx_levelup", () => {
    [523, 659, 784, 1047].forEach((f, i) =>
      playTone(f, 0.1, 0.18, "sine", null, i * 0.09)
    );
  });
}

export function sfxStairs(): void {
  playSfx("sfx_stairs", () => {
    [440, 370, 310, 260].forEach((f, i) =>
      playTone(f, 0.07, 0.18, "sine", null, i * 0.07)
    );
  });
}

export function sfxItem(): void {
  playSfx("sfx_item", () => {
    playTone(660, 0.06, 0.18, "sine");
    playTone(880, 0.08, 0.16, "sine", null, 0.07);
  });
}

// ── BGM 公開 API ──────────────────────────────────────────────────────────────

export function startBGM(): void {
  _bgmShouldPlay = true;

  if (_bgmBuffer) {
    // AudioBuffer ロード済み → すぐに再生
    _playBgmBuffer();
  }
  // ロード中の場合は _loadBgmBuffer() 完了時に自動再生される
}

export function stopBGM(): void {
  _bgmShouldPlay = false;
  _stopBgmBuffer();
}
