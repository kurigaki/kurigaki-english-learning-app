// Web Speech API を使用した音声再生ユーティリティ

import type { PronunciationVariant } from "@/types";

// ── 英語音声 音量設定 ─────────────────────────────────────────────────────────

const VOICE_VOLUME_KEY = "voice_volume";
let _voiceVol = 1.0;

function _loadVoiceVolume(): void {
  try {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(VOICE_VOLUME_KEY);
    if (raw !== null) {
      const v = parseFloat(raw);
      if (!isNaN(v)) _voiceVol = Math.max(0, Math.min(1, v));
    }
  } catch { /* ignore */ }
}

function _saveVoiceVolume(): void {
  try {
    localStorage.setItem(VOICE_VOLUME_KEY, String(_voiceVol));
  } catch { /* ignore */ }
}

_loadVoiceVolume();

export function getVoiceVolume(): number { return _voiceVol; }

export function setVoiceVolume(vol: number): void {
  _voiceVol = Math.max(0, Math.min(1, vol));
  _saveVoiceVolume();
}

export type VoiceLanguage = "en-US" | "en-GB" | "ja-JP";

// ブラウザがWeb Speech APIをサポートしているかチェック
export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

// 利用可能な音声を取得
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisSupported()) return [];
  return window.speechSynthesis.getVoices();
}

// 特定の言語の音声を取得
export function getVoicesForLanguage(language: VoiceLanguage): SpeechSynthesisVoice[] {
  const voices = getAvailableVoices();
  return voices.filter((voice) => voice.lang.startsWith(language.split("-")[0]));
}

// 英語音声を取得（優先: ネイティブ音声）
export function getEnglishVoice(): SpeechSynthesisVoice | null {
  const voices = getAvailableVoices();

  // 優先順位: en-US > en-GB > その他の英語
  const usVoice = voices.find((v) => v.lang === "en-US" && !v.localService);
  if (usVoice) return usVoice;

  const gbVoice = voices.find((v) => v.lang === "en-GB" && !v.localService);
  if (gbVoice) return gbVoice;

  // ローカル音声
  const localUsVoice = voices.find((v) => v.lang === "en-US");
  if (localUsVoice) return localUsVoice;

  const localGbVoice = voices.find((v) => v.lang === "en-GB");
  if (localGbVoice) return localGbVoice;

  // その他の英語
  const anyEnglish = voices.find((v) => v.lang.startsWith("en"));
  return anyEnglish || null;
}

// テキストを読み上げる
export function speak(
  text: string,
  options?: {
    rate?: number; // 速度 (0.1 - 10, default: 1)
    pitch?: number; // ピッチ (0 - 2, default: 1)
    volume?: number; // 音量 (0 - 1, default: 1)
    voice?: SpeechSynthesisVoice;
    language?: VoiceLanguage;
    onEnd?: () => void;
    onError?: (error: SpeechSynthesisErrorEvent) => void;
  }
): SpeechSynthesisUtterance | null {
  if (!isSpeechSynthesisSupported()) {
    console.warn("Speech synthesis is not supported in this browser.");
    return null;
  }

  // 既存の読み上げをキャンセル
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  // GC 防止: モジュール変数で参照を保持（Chrome では utterance が GC されると再生が止まる）
  _currentUtterance = utterance;

  // オプション設定
  utterance.rate = options?.rate ?? 1;
  utterance.pitch = options?.pitch ?? 1;
  utterance.volume = options?.volume ?? _voiceVol;

  // 音声を設定（language が指定された場合はその言語の音声を優先探索）
  if (options?.voice) {
    utterance.voice = options.voice;
  } else if (options?.language && options.language !== "en-US") {
    // UK など en-US 以外が指定された場合: 対応 voice を優先し、なければ en-US にフォールバック
    const voices = getAvailableVoices();
    const voice =
      voices.find((v) => v.lang === options.language && !v.localService) ??
      voices.find((v) => v.lang === options.language) ??
      getEnglishVoice();
    if (voice) {
      utterance.voice = voice;
    }
  } else {
    const voice = getEnglishVoice();
    if (voice) {
      utterance.voice = voice;
    }
  }

  // 言語を設定
  if (options?.language) {
    utterance.lang = options.language;
  } else {
    utterance.lang = "en-US";
  }

  // イベントハンドラ
  if (options?.onEnd) {
    utterance.onend = options.onEnd;
  }

  if (options?.onError) {
    utterance.onerror = options.onError;
  }

  // speak() はユーザージェスチャーのコールスタック内で同期的に呼ぶ必要がある。
  // setTimeout(0) でも iOS Safari・Chrome desktop ともに「ユーザー操作なし」と判定され
  // ブロックされることがあるため、cancel() 後は即同期で speak() する。
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
  window.speechSynthesis.speak(utterance);

  return utterance;
}

// 英単語を読み上げる（最適化された設定）
export function speakWord(
  word: string,
  options?: {
    slow?: boolean; // ゆっくり読み上げ
    onEnd?: () => void;
    onError?: () => void;
  }
): void {
  speak(word, {
    rate: options?.slow ? 0.7 : 0.9, // 学習用にやや遅め
    pitch: 1,
    language: "en-US",
    onEnd: options?.onEnd,
    onError: options?.onError ? () => options.onError!() : undefined,
  });
}

// 例文を読み上げる
export function speakSentence(
  sentence: string,
  options?: {
    slow?: boolean;
    onEnd?: () => void;
    onError?: () => void;
  }
): void {
  speak(sentence, {
    rate: options?.slow ? 0.7 : 0.85, // 例文は少しゆっくり
    pitch: 1,
    language: "en-US",
    onEnd: options?.onEnd,
    onError: options?.onError ? () => options.onError!() : undefined,
  });
}

// 読み上げを停止
export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}

// 読み上げ中かどうか
export function isSpeaking(): boolean {
  if (!isSpeechSynthesisSupported()) return false;
  return window.speechSynthesis.speaking;
}

// 音声が読み込まれるのを待つ（初回アクセス時に必要な場合がある）
// timeout: 最大待機時間（ミリ秒）。デフォルト1000ms
export function waitForVoices(timeout = 1000): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!isSpeechSynthesisSupported()) {
      resolve([]);
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    // タイムアウト処理
    const timeoutId = setTimeout(() => {
      resolve([]);
    }, timeout);

    window.speechSynthesis.onvoiceschanged = () => {
      clearTimeout(timeoutId);
      resolve(window.speechSynthesis.getVoices());
    };
  });
}

// utterance をモジュールスコープで保持（Chrome GC バグ対策）
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let _currentUtterance: SpeechSynthesisUtterance | null = null;

// 音声初期化状態を管理
let voicesInitialized = false;
let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;

// 音声が利用可能になるまで待機し、初期化を確認
export async function ensureVoicesLoaded(): Promise<boolean> {
  if (voicesInitialized) return true;
  if (!isSpeechSynthesisSupported()) return false;

  if (!voicesPromise) {
    voicesPromise = waitForVoices();
  }

  const voices = await voicesPromise;
  voicesInitialized = voices.length > 0;
  return voicesInitialized;
}

// UK/US発音を切り替えて英単語を読み上げる
export function speakWordWithVariant(
  word: string,
  variant: PronunciationVariant,
  options?: {
    slow?: boolean;
    onEnd?: () => void;
    onError?: () => void;
  }
): void {
  speak(word, {
    rate: options?.slow ? 0.7 : 0.9,
    pitch: 1,
    language: variant === "uk" ? "en-GB" : "en-US",
    onEnd: options?.onEnd,
    onError: options?.onError ? () => options.onError!() : undefined,
  });
}
