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
// 音源のループ始点・終点（秒）を変更する場合は下記の定数を編集してください。
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

// Web Audio BGM のマスターゲインスケール（vol=1.0 時のゲイン）
const WEB_AUDIO_BGM_MAX_GAIN = 0.53;

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
  // ライブ反映
  if (bgmEl) bgmEl.volume = _bgmVol;
  if (_bgmGain) {
    const ac = getACtx();
    if (ac) {
      const target = _bgmVol > 0 ? _bgmVol * WEB_AUDIO_BGM_MAX_GAIN : 0.001;
      _bgmGain.gain.setValueAtTime(target, ac.currentTime);
    }
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

// BGM 状態
let bgmEl: HTMLAudioElement | null = null;
let bgmFileReady = false;  // canplaythrough 済み
let bgmShouldPlay = false; // startBGM() が呼ばれた後 true になる

// ── Web Audio API（フォールバック） ──────────────────────────────────────────

let _actx: AudioContext | null = null;
let _bgmGain: GainNode | null = null;

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
    // SFX 音量を適用
    const scaledVol = vol * _sfxVol;
    gain.gain.setValueAtTime(scaledVol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.start(t);
    osc.stop(t + dur + 0.01);
  } catch {
    // ignore
  }
}

// ── Web Audio BGM の停止ヘルパー ──────────────────────────────────────────────

function _stopWebAudioBGM(): void {
  try {
    if (_bgmGain) {
      const ac = getACtx();
      if (ac) {
        _bgmGain.gain.exponentialRampToValueAtTime(
          0.001,
          ac.currentTime + 0.3
        );
      }
      setTimeout(() => {
        _bgmGain = null;
      }, 400);
    }
  } catch {
    // ignore
  }
}

// ── MP3 プリロード ────────────────────────────────────────────────────────────

let _initialized = false;

export function initDungeonAudio(): void {
  if (typeof window === "undefined" || _initialized) return;
  _initialized = true;

  // localStorage から音量を復元
  _loadVolumes();

  // SFX をプリロード
  for (const key of SFX_KEYS) {
    const el = new Audio(`${AUDIO_BASE}${key}.mp3`);
    el.preload = "auto";
    el.addEventListener(
      "canplaythrough",
      () => { sfxReady.set(key, el); },
      { once: true }
    );
    el.load();
  }

  // BGM をプリロード
  const bgm = new Audio(`${AUDIO_BASE}bgm.mp3`);
  bgm.volume = _bgmVol;
  bgm.preload = "auto";

  // カスタムループ（timeupdate でループポイントを制御）
  bgm.addEventListener("timeupdate", () => {
    if (bgm.currentTime >= BGM_LOOP_END) {
      bgm.currentTime = BGM_LOOP_START;
    }
  });

  bgm.addEventListener(
    "canplaythrough",
    () => {
      bgmFileReady = true;
      bgmEl = bgm;
      // startBGM() がすでに呼ばれていたら Web Audio から MP3 に切り替える
      if (bgmShouldPlay) {
        _stopWebAudioBGM();
        bgm.currentTime = 0;
        bgm.play().catch(() => {
          // 自動再生ポリシーでブロックされた場合は何もしない（ユーザー操作後に再試行）
        });
      }
    },
    { once: true }
  );

  bgm.addEventListener(
    "error",
    () => {
      // ファイルが存在しない → Web Audio フォールバックのまま
      bgmEl = null;
    },
    { once: true }
  );

  bgm.load();
  bgmEl = bgm; // ロード中は保持しておく（error 時に null へ上書き）
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

// ── BGM ───────────────────────────────────────────────────────────────────────

export function startBGM(): void {
  bgmShouldPlay = true;

  if (bgmFileReady && bgmEl) {
    // MP3 ロード済み → すぐに再生
    bgmEl.currentTime = 0;
    bgmEl.play().catch(() => {
      // 自動再生ポリシーでブロック → Web Audio にフォールバック
      _startWebAudioBGM();
    });
  } else {
    // MP3 未ロード or ファイルなし → Web Audio を開始
    // MP3 のロードが完了したら canplaythrough リスナーが自動で切り替える
    _startWebAudioBGM();
  }
}

export function stopBGM(): void {
  bgmShouldPlay = false;

  // MP3 BGM を停止
  if (bgmEl && !bgmEl.paused) {
    bgmEl.pause();
    bgmEl.currentTime = 0;
  }

  // Web Audio BGM を停止
  _stopWebAudioBGM();
}

// ── Web Audio BGM（フォールバック） ───────────────────────────────────────────

function _startWebAudioBGM(): void {
  try {
    const ac = getACtx();
    if (!ac) return;
    if (_bgmGain) {
      _bgmGain.gain.setValueAtTime(0.001, ac.currentTime);
      _bgmGain = null;
    }

    _bgmGain = ac.createGain();
    _bgmGain.gain.setValueAtTime(_bgmVol * WEB_AUDIO_BGM_MAX_GAIN, ac.currentTime);
    _bgmGain.connect(ac.destination);

    const bassNotes = [
      110, 110, 98, 110, 110, 98, 110, 123, 98, 110, 98, 87, 98, 110, 123,
      110,
    ];
    const melNotes = [
      220, 262, 220, 196, 220, 262, 294, 220, 196, 220, 196, 175, 196, 220,
      247, 220,
    ];
    const beatLen = 0.22;
    const loopLen = bassNotes.length * beatLen;

    const localGain = _bgmGain;

    const scheduleLoop = (startTime: number) => {
      if (!localGain) return;
      const currentAc = getACtx();
      if (!currentAc) return;
      bassNotes.forEach((f, i) => {
        const t = startTime + i * beatLen;
        const osc = currentAc.createOscillator();
        const g = currentAc.createGain();
        osc.connect(g);
        g.connect(localGain);
        osc.type = "square";
        osc.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(0.6, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + beatLen * 0.7);
        osc.start(t);
        osc.stop(t + beatLen * 0.8);
      });
      melNotes.forEach((f, i) => {
        const t = startTime + i * beatLen + beatLen * 0.5;
        const osc = currentAc.createOscillator();
        const g = currentAc.createGain();
        osc.connect(g);
        g.connect(localGain);
        osc.type = "triangle";
        osc.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(0.4, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + beatLen * 0.6);
        osc.start(t);
        osc.stop(t + beatLen * 0.7);
      });
    };

    let nextLoopTime = ac.currentTime;
    const tick = () => {
      if (!_bgmGain || _bgmGain !== localGain) return;
      const currentAc2 = getACtx();
      if (!currentAc2) return;
      while (nextLoopTime < currentAc2.currentTime + 2.0) {
        scheduleLoop(nextLoopTime);
        nextLoopTime += loopLen;
      }
      setTimeout(tick, 500);
    };
    tick();
  } catch {
    // ignore
  }
}
