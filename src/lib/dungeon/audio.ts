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

// モジュールロード時に音量を読み込む（initDungeonAudio より前に BottomNav から呼ばれる場合に対応）
if (typeof window !== "undefined") { _loadVolumes(); }

export function getBgmVolume(): number { return _bgmVol; }
export function getSfxVolume(): number { return _sfxVol; }

export function setBgmVolume(vol: number): void {
  _bgmVol = Math.max(0, Math.min(1, vol));
  if (_gameBgmEl) _gameBgmEl.volume = _bgmVol;
  if (_titleBgmEl) _titleBgmEl.volume = _bgmVol;
  if (_actx) {
    if (_bgmBufferGain) _bgmBufferGain.gain.setValueAtTime(_bgmVol, _actx.currentTime);
    if (_oscBgmGain) _oscBgmGain.gain.setValueAtTime(_bgmVol, _actx.currentTime);
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

// iOS Safari 互換: callback ベースの decodeAudioData ラッパー
// Promise API は iOS Safari 旧版で失敗することがあるため callback API を使用
function _decodeAudioData(ctx: AudioContext, buffer: ArrayBuffer): Promise<AudioBuffer> {
  return new Promise((resolve, reject) => {
    ctx.decodeAudioData(buffer, resolve, reject);
  });
}

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
    _bgmBuffer = await _decodeAudioData(_actx, _bgmRaw.slice(0));
    // AudioContext が実際に running の場合のみ AudioBuffer に切り替える。
    // suspended のまま pause() すると HTMLAudioElement の再生も止まって無音になる。
    if (_bgmShouldPlay && _actx.state === "running") {
      if (_gameBgmEl) _gameBgmEl.pause();
      void _playBgmBuffer();
    }
  } catch { /* ignore */ }
}

async function _playBgmBuffer(): Promise<void> {
  if (!_actx || !_bgmBuffer) return;

  // オシレーター BGM が動いていれば先に止める
  _stopOscBGM();

  if (!_bgmBufferGain) {
    _bgmBufferGain = _actx.createGain();
    _bgmBufferGain.connect(_actx.destination);
  }
  _bgmBufferGain.gain.setValueAtTime(_bgmVol, _actx.currentTime);

  if (_bgmSource) {
    try { _bgmSource.stop(); } catch { /* ignore */ }
    _bgmSource = null;
  }

  // iOS Safari 対策: resume() を await してから src.start(0) を呼ぶ
  if (_actx.state !== "running") {
    try { await _actx.resume(); } catch { /* ignore */ }
  }

  const src = _actx.createBufferSource();
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

// ── HTMLAudioElement BGM ──────────────────────────────────────────────────────
// iOS では Web Audio API の AudioContext が resume() しても再生されないことがある。
// HTMLAudioElement は audio.play() をジェスチャー内で呼ぶだけで動作するため
// iOS 互換性が高い。BGM の primary 再生方式として使用する。

let _titleBgmEl: HTMLAudioElement | null = null;
let _gameBgmEl: HTMLAudioElement | null = null;
// stopTitleBGM() / startBGM() による意図的な一時停止フラグ
// AudioContext resume() による非意図的な中断と区別するために使用
let _titleBgmIntentionalPause = false;

function _getOrCreateTitleBgm(): HTMLAudioElement {
  if (!_titleBgmEl) {
    _titleBgmEl = new Audio(`${AUDIO_BASE}bgm_title.mp3`);
    _titleBgmEl.loop = true;
    _titleBgmEl.preload = "auto";
    // iOS で AudioContext の resume() がタイトル BGM を中断した場合の自動回復
    // unlockAudio() → _actx.resume() がAudioSessionを掌握してHTMLAudioElementを割り込み停止させる
    // 意図しない pause イベントを検知して 300ms 後に再開を試みる
    _titleBgmEl.addEventListener("pause", () => {
      if (_titleBgmIntentionalPause || _bgmShouldPlay) return;
      // ゲームBGM未開始 かつ 意図的停止でない場合は自動回復
      setTimeout(() => {
        if (_titleBgmEl && _titleBgmEl.paused && !_bgmShouldPlay && !_titleBgmIntentionalPause) {
          _titleBgmEl.play().catch(() => {});
        }
      }, 300);
    });
  }
  return _titleBgmEl;
}

function _getOrCreateGameBgm(): HTMLAudioElement {
  if (!_gameBgmEl) {
    _gameBgmEl = new Audio(`${AUDIO_BASE}bgm.mp3`);
    _gameBgmEl.loop = false;
    _gameBgmEl.preload = "auto";
    // Web Audio API の BGM_LOOP_START/END に相当するカスタムループを再現
    _gameBgmEl.addEventListener("timeupdate", () => {
      if (_gameBgmEl && _gameBgmEl.currentTime >= BGM_LOOP_END) {
        _gameBgmEl.currentTime = BGM_LOOP_START;
      }
    });
    _gameBgmEl.addEventListener("ended", () => {
      if (_bgmShouldPlay && _gameBgmEl) {
        _gameBgmEl.currentTime = BGM_LOOP_START;
        _gameBgmEl.play().catch(() => {});
      }
    });
  }
  return _gameBgmEl;
}

// タイトル BGM を開始（ジェスチャー内で呼ぶこと）
export function startTitleBGM(): void {
  if (typeof window === "undefined") return;
  // ゲーム BGM が再生中 or ゲーム開始済みの場合は起動しない
  if (_bgmShouldPlay) return;
  if (_gameBgmEl && !_gameBgmEl.paused) return;
  // 既にタイトル BGM が再生中なら何もしない
  if (_titleBgmEl && !_titleBgmEl.paused) return;
  _titleBgmIntentionalPause = false;
  const el = _getOrCreateTitleBgm();
  el.volume = _bgmVol;
  el.play().catch(() => {});
}

export function stopTitleBGM(): void {
  _titleBgmIntentionalPause = true;
  if (_titleBgmEl && !_titleBgmEl.paused) {
    _titleBgmEl.pause();
    _titleBgmEl.currentTime = 0;
  }
}

// ── オシレーター BGM（MP3 BGM のフォールバック） ────────────────────────────
// HTML プロトタイプ (public/dungeon.html) と同じ音楽データ・ロジックを使用。
// MP3 ファイルのデコード不要なため iOS Safari/Chrome でも確実に鳴る。

let _oscBgmGain: GainNode | null = null;
let _oscBgmTickId: ReturnType<typeof setTimeout> | null = null;
let _oscBgmNextTime = 0;

const _OSC_BGM_BASS  = [110,110,98,110, 110,98,110,123, 98,110,98,87, 98,110,123,110];
const _OSC_BGM_MEL   = [220,262,220,196, 220,262,294,220, 196,220,196,175, 196,220,247,220];
const _OSC_BGM_BEAT  = 0.22; // 1音の長さ（秒）
const _OSC_BGM_LOOP  = _OSC_BGM_BASS.length * _OSC_BGM_BEAT;

function _scheduleOscBgmLoop(startTime: number): void {
  if (!_actx || !_oscBgmGain) return;
  _OSC_BGM_BASS.forEach((f, i) => {
    if (!_actx || !_oscBgmGain) return;
    const t = startTime + i * _OSC_BGM_BEAT;
    const osc = _actx.createOscillator();
    const g = _actx.createGain();
    osc.connect(g); g.connect(_oscBgmGain);
    osc.type = "square"; osc.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.6, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + _OSC_BGM_BEAT * 0.7);
    osc.start(t); osc.stop(t + _OSC_BGM_BEAT * 0.8);
  });
  _OSC_BGM_MEL.forEach((f, i) => {
    if (!_actx || !_oscBgmGain) return;
    const t = startTime + i * _OSC_BGM_BEAT + _OSC_BGM_BEAT * 0.5;
    const osc = _actx.createOscillator();
    const g = _actx.createGain();
    osc.connect(g); g.connect(_oscBgmGain);
    osc.type = "triangle"; osc.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.4, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + _OSC_BGM_BEAT * 0.6);
    osc.start(t); osc.stop(t + _OSC_BGM_BEAT * 0.7);
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- HTMLAudioElement方式移行後は未使用だが、フォールバック用に保持
function _startOscBGM(): void {
  if (!_actx || _oscBgmGain) return; // 既に起動中ならスキップ
  try {
    _oscBgmGain = _actx.createGain();
    // suspended 状態の AudioContext では currentTime が 0 または NaN になることがある
    const ct = (_actx.currentTime > 0 && isFinite(_actx.currentTime)) ? _actx.currentTime : 0;
    _oscBgmGain.gain.setValueAtTime(_bgmVol, ct);
    _oscBgmGain.connect(_actx.destination);

    _oscBgmNextTime = ct;

    const tick = () => {
      if (!_oscBgmGain || !_actx) return;
      const now = (_actx.currentTime > 0 && isFinite(_actx.currentTime)) ? _actx.currentTime : 0;
      while (_oscBgmNextTime < now + 2.0) {
        _scheduleOscBgmLoop(_oscBgmNextTime);
        _oscBgmNextTime += _OSC_BGM_LOOP;
      }
      _oscBgmTickId = setTimeout(tick, 500);
    };
    tick();
  } catch { /* ignore */ }
}

function _stopOscBGM(): void {
  if (_oscBgmTickId !== null) {
    clearTimeout(_oscBgmTickId);
    _oscBgmTickId = null;
  }
  if (_oscBgmGain && _actx) {
    try {
      _oscBgmGain.gain.exponentialRampToValueAtTime(0.001, _actx.currentTime + 0.3);
      const g = _oscBgmGain;
      setTimeout(() => { try { g.disconnect(); } catch { /* ignore */ } }, 400);
    } catch { /* ignore */ }
  }
  _oscBgmGain = null;
}

// ── SFX（Web Audio API: ピーク正規化 + 順番再生キュー） ──────────────────────

// フェーズ1: 生データ
const _sfxRaw = new Map<SfxKey, ArrayBuffer>();
// フェーズ2: デコード済み・正規化済み
const _sfxBuf = new Map<SfxKey, AudioBuffer>();

// 順番再生キュー
const _sfxQueue: SfxKey[] = [];
let _sfxActive = false;
// キューが blocked 中か（context が suspended のとき resume() 待ち）
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
      // AudioContext 解放済み: 即デコード（callback API で iOS 互換性確保）
      const buf = await _decodeAudioData(_actx, raw.slice(0));
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
        const buf = await _decodeAudioData(_actx!, raw.slice(0));
        _sfxBuf.set(key, _normalizePeak(buf));
      } catch { /* ignore */ }
    })
  );
}

// SFX 間の最大待機時間（ms）: この時間を超えたら音が終わる前に次へ進む
const MAX_GAP_MS = 350;

// ── オシレーター SFX（MP3 デコード失敗時のフォールバック） ──────────────────
// HTML プロトタイプ (public/dungeon.html) と同じ方式。
// ファイルのデコード不要なので iOS Safari でも確実に鳴る。

function _playOscTone(
  freq: number, dur: number, vol: number,
  type: OscillatorType = "square",
  freqEnd?: number, delay = 0
): void {
  if (!_actx) return;
  try {
    const osc = _actx.createOscillator();
    const gain = _actx.createGain();
    osc.connect(gain);
    gain.connect(_actx.destination);
    osc.type = type;
    const t = _actx.currentTime + delay;
    osc.frequency.setValueAtTime(freq, t);
    if (freqEnd !== undefined) osc.frequency.exponentialRampToValueAtTime(freqEnd, t + dur * 0.9);
    gain.gain.setValueAtTime(vol * _sfxVol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.start(t);
    osc.stop(t + dur + 0.01);
  } catch { /* ignore */ }
}

function _playOscSfxByKey(key: SfxKey): void {
  switch (key) {
    case "sfx_hit":
      _playOscTone(180, 0.04, 0.3, "square", 80);
      _playOscTone(260, 0.06, 0.2, "square", 120, 0.02);
      break;
    case "sfx_crit":
      _playOscTone(320, 0.04, 0.35, "square", 160);
      _playOscTone(480, 0.08, 0.25, "square", 200, 0.03);
      _playOscTone(240, 0.1, 0.2, "sawtooth", 120, 0.06);
      break;
    case "sfx_miss":
      _playOscTone(120, 0.08, 0.15, "sine", 90);
      break;
    case "sfx_recv":
      _playOscTone(90, 0.05, 0.4, "sawtooth", 60);
      _playOscTone(70, 0.12, 0.25, "square", 50, 0.04);
      break;
    case "sfx_correct":
      _playOscTone(523, 0.07, 0.2, "sine");
      _playOscTone(659, 0.07, 0.2, "sine", undefined, 0.08);
      _playOscTone(784, 0.1, 0.2, "sine", undefined, 0.16);
      break;
    case "sfx_wrong":
      _playOscTone(220, 0.05, 0.2, "sawtooth", 180);
      _playOscTone(160, 0.12, 0.2, "sawtooth", 120, 0.06);
      break;
    case "sfx_levelup":
      [523, 659, 784, 1047].forEach((f, i) => _playOscTone(f, 0.1, 0.18, "sine", undefined, i * 0.09));
      break;
    case "sfx_stairs":
      [440, 370, 310, 260].forEach((f, i) => _playOscTone(f, 0.07, 0.18, "sine", undefined, i * 0.07));
      break;
    case "sfx_warp":
      _playOscTone(300, 0.15, 0.25, "sine", 600);
      _playOscTone(600, 0.1, 0.15, "sine", 300, 0.1);
      break;
    case "sfx_item_get":
      _playOscTone(660, 0.06, 0.18, "sine");
      _playOscTone(880, 0.08, 0.16, "sine", undefined, 0.07);
      break;
    case "sfx_item_use":
      _playOscTone(440, 0.08, 0.15, "sine");
      _playOscTone(523, 0.06, 0.15, "sine", undefined, 0.06);
      break;
    case "sfx_cane":
      _playOscTone(200, 0.05, 0.2, "sawtooth", 400);
      _playOscTone(350, 0.1, 0.15, "sawtooth", 150, 0.04);
      break;
  }
}

// キューを順番に消化する
function _drainSfxQueue(): void {
  if (_sfxQueue.length === 0) {
    _sfxActive = false;
    _sfxWaiting = false;
    return;
  }
  if (!_actx || _actx.state !== "running") {
    // suspended: resume() を Promise ベースで待つ（statechange は iOS で発火しないことがある）
    if (!_sfxWaiting && _actx) {
      _sfxWaiting = true;
      _actx.resume().then(() => {
        _sfxWaiting = false;
        _drainSfxQueue();
      }).catch(() => {
        _sfxWaiting = false;
      });
    }
    return;
  }
  const key = _sfxQueue.shift()!;
  const buf = _sfxBuf.get(key);
  if (!buf) {
    // MP3 未デコード: オシレーターでフォールバック再生（iOS でも確実に鳴る）
    _playOscSfxByKey(key);
    setTimeout(() => _drainSfxQueue(), MAX_GAP_MS);
    return;
  }
  const src = _actx.createBufferSource();
  src.buffer = buf;
  const gain = _actx.createGain();
  gain.gain.setValueAtTime(_sfxVol, _actx.currentTime);
  src.connect(gain);
  gain.connect(_actx.destination);
  // onended または MAX_GAP_MS のどちらか早い方で次の SFX へ進む
  let advanced = false;
  const advance = () => {
    if (advanced) return;
    advanced = true;
    _drainSfxQueue();
  };
  src.onended = advance;
  setTimeout(advance, MAX_GAP_MS);
  src.start(0);
}

// ── HTMLAudioElement SFX（AudioContext suspended 時のフォールバック） ───────────
// iOS で AudioContext が動かない場合、ユーザージェスチャーのコールスタック内で
// HTMLAudioElement.play() を呼ぶことで SFX を再生できる。

const _sfxEls = new Map<SfxKey, HTMLAudioElement>();

function _getOrCreateSfxEl(key: SfxKey): HTMLAudioElement {
  let el = _sfxEls.get(key);
  if (!el) {
    el = new Audio(`${AUDIO_BASE}${key}.mp3`);
    el.preload = "auto";
    _sfxEls.set(key, el);
  }
  return el;
}

function _playSfxHtml(key: SfxKey): void {
  const el = _getOrCreateSfxEl(key);
  el.volume = _sfxVol;
  el.currentTime = 0;
  el.play().catch(() => {});
}

function playSfx(key: SfxKey): void {
  // AudioContext が running なら Web Audio API で高品質再生（キュー管理付き）
  if (_actx && _actx.state === "running") {
    _sfxQueue.push(key);
    if (!_sfxActive) {
      _sfxActive = true;
      _drainSfxQueue();
    }
    return;
  }
  // AudioContext が未準備 / suspended（iOS など）: HTMLAudioElement で直接再生
  // ダンジョンの操作はすべてユーザージェスチャー起点なので iOS 制限に引っかからない
  _playSfxHtml(key);
}

// ── MP3 プリロード ────────────────────────────────────────────────────────────

let _initialized = false;

export function initDungeonAudio(): void {
  if (typeof window === "undefined" || _initialized) return;
  _initialized = true;

  _loadVolumes();

  // BGM フェッチ（AudioContext不要、デコードはunlockAudio後）
  _fetchBgm();

  // HTMLAudioElement を事前作成して preload="auto" でブラウザにフェッチを開始させる
  // ──初回アクセス時に play() を呼ぶ前にファイルがキャッシュされるようにする──
  const titleEl = _getOrCreateTitleBgm();
  titleEl.load();
  const gameEl = _getOrCreateGameBgm();
  gameEl.load();
  for (const key of SFX_KEYS) {
    _getOrCreateSfxEl(key).load();
  }

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
  // iOS: ユーザージェスチャーのコールスタック内で resume() を呼ぶ。
  // startBGM() も同じハンドラから直接呼ぶことで、suspended 状態での
  // oscillator start() → resume() 解決後に即再生、という流れが成立する。
  _actx.resume().catch(() => {});
  // フェッチ済みの SFX 生データをデコード、BGM もデコード
  _decodePendingSfx().catch(() => {});
  _decodeBgm().catch(() => {});
}

export function startBGM(): void {
  _bgmShouldPlay = true;
  stopTitleBGM();
  // 既存のストリームを全て止めてから再生（二重起動防止）
  _stopBgmBuffer();
  _stopOscBGM();
  if (_gameBgmEl) _gameBgmEl.pause();
  // AudioBuffer + running AudioContext → 高品質ループ（PC / Web Audio API 対応環境）
  if (_bgmBuffer && _actx && _actx.state === "running") {
    void _playBgmBuffer();
    return;
  }
  // HTMLAudioElement で再生（iOS 対応・AudioContext が suspended / 非対応の場合）
  const el = _getOrCreateGameBgm();
  el.volume = _bgmVol;
  el.currentTime = 0;
  el.play().catch(() => {});
}

export function stopBGM(): void {
  _bgmShouldPlay = false;
  if (_gameBgmEl) _gameBgmEl.pause();
  _stopBgmBuffer();
  _stopOscBGM();
}

/** タイトルBGM・ゲームBGMをまとめて停止（ページ離脱時など） */
export function stopAllDungeonBGM(): void {
  stopTitleBGM();
  stopBGM();
}
