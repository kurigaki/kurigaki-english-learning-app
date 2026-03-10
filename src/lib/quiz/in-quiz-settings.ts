export type SpeakingDifficulty = "strict" | "normal" | "easy";

/** ヒント表示モード */
export type HintMode = "none" | "reveal" | "always";

/** 例文和訳表示モード */
export type TranslationMode = "none" | "reveal" | "always";

/** 音声モード: off=なし / button=ボタン表示 / auto=自動再生+ボタン */
export type AudioMode = "off" | "button" | "auto";

/** 回答後の自動次へモード */
export type AutoAdvanceMode = "off" | "timed" | "instant";

export type InQuizSettings = {
  speakingDifficulty: SpeakingDifficulty;
  hintMode: HintMode;           // スピーキング問題のヒント表示モード
  translationMode: TranslationMode; // 例文和訳の表示モード
  readingAudioMode: AudioMode;  // 音声再生モード（リーディング）
  writingAudioMode: AudioMode;  // 音声再生モード（ライティング）
  speakingAudioMode: AudioMode; // 音声再生モード（スピーキング）
  listeningAudioMode: AudioMode; // 音声再生モード（リスニング）
  autoAdvanceMode: AutoAdvanceMode;
  autoAdvanceMs: number;        // timedモード時の遅延（ms）
};

export const defaultInQuizSettings: InQuizSettings = {
  speakingDifficulty: "normal",
  hintMode: "none",
  translationMode: "always",
  readingAudioMode: "button",
  writingAudioMode: "button",
  speakingAudioMode: "off",
  listeningAudioMode: "auto",
  autoAdvanceMode: "off",
  autoAdvanceMs: 1500,
};

const KEY = "english-app-in-quiz-settings";

export function loadInQuizSettings(): InQuizSettings {
  if (typeof window === "undefined") return { ...defaultInQuizSettings };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaultInQuizSettings };
    const p = JSON.parse(raw) as Record<string, unknown>;

    // hintMode: showHint(boolean) からの移行も考慮
    let hintMode: HintMode = defaultInQuizSettings.hintMode;
    if (p.hintMode === "reveal" || p.hintMode === "always") {
      hintMode = p.hintMode;
    } else if (p.hintMode === "none") {
      hintMode = "none";
    } else if (typeof p.showHint === "boolean") {
      hintMode = p.showHint ? "always" : "none"; // 旧フォーマット移行
    }

    // audioMode: autoPlay(boolean) からの移行も考慮（旧フォーマット）
    let legacyAudioMode: AudioMode | null = null;
    if (p.audioMode === "off" || p.audioMode === "button" || p.audioMode === "auto") {
      legacyAudioMode = p.audioMode;
    } else if (typeof p.autoPlay === "boolean") {
      legacyAudioMode = p.autoPlay ? "auto" : "off"; // 旧フォーマット移行
    }

    let readingAudioMode: AudioMode = defaultInQuizSettings.readingAudioMode;
    if (p.readingAudioMode === "off" || p.readingAudioMode === "button" || p.readingAudioMode === "auto") {
      readingAudioMode = p.readingAudioMode;
    } else if (legacyAudioMode) {
      readingAudioMode = legacyAudioMode;
    }

    let writingAudioMode: AudioMode = defaultInQuizSettings.writingAudioMode;
    if (p.writingAudioMode === "off" || p.writingAudioMode === "button" || p.writingAudioMode === "auto") {
      writingAudioMode = p.writingAudioMode;
    } else if (legacyAudioMode) {
      writingAudioMode = legacyAudioMode;
    }

    let speakingAudioMode: AudioMode = defaultInQuizSettings.speakingAudioMode;
    if (p.speakingAudioMode === "off" || p.speakingAudioMode === "button" || p.speakingAudioMode === "auto") {
      speakingAudioMode = p.speakingAudioMode;
    }

    // listeningAudioMode: 旧フォーマットからの移行（未設定はデフォルトでON）
    let listeningAudioMode: AudioMode = defaultInQuizSettings.listeningAudioMode;
    if (p.listeningAudioMode === "off" || p.listeningAudioMode === "button" || p.listeningAudioMode === "auto") {
      listeningAudioMode = p.listeningAudioMode;
    } else if (legacyAudioMode === "auto") {
      listeningAudioMode = "auto";
    }

    // translationMode: showTranslation(boolean) からの移行も考慮
    let translationMode: TranslationMode = defaultInQuizSettings.translationMode;
    if (p.translationMode === "none" || p.translationMode === "reveal" || p.translationMode === "always") {
      translationMode = p.translationMode;
    } else if (typeof p.showTranslation === "boolean") {
      translationMode = p.showTranslation ? "always" : "none";
    }

    // autoAdvanceMode: autoAdvanceMs(number) からの移行も考慮
    let autoAdvanceMode: AutoAdvanceMode = defaultInQuizSettings.autoAdvanceMode;
    if (p.autoAdvanceMode === "timed" || p.autoAdvanceMode === "instant") {
      autoAdvanceMode = p.autoAdvanceMode;
    } else if (p.autoAdvanceMode === "off") {
      autoAdvanceMode = "off";
    } else if (typeof p.autoAdvanceMs === "number" && p.autoAdvanceMs > 0) {
      autoAdvanceMode = "timed"; // 旧フォーマット移行
    }

    const autoAdvanceMs =
      typeof p.autoAdvanceMs === "number" && p.autoAdvanceMs >= 500 && p.autoAdvanceMs <= 5000
        ? (p.autoAdvanceMs as number)
        : defaultInQuizSettings.autoAdvanceMs;

    return {
      speakingDifficulty:
        p.speakingDifficulty === "strict" || p.speakingDifficulty === "easy"
          ? p.speakingDifficulty
          : "normal",
      hintMode,
      translationMode,
      readingAudioMode,
      writingAudioMode,
      speakingAudioMode,
      listeningAudioMode,
      autoAdvanceMode,
      autoAdvanceMs,
    };
  } catch {
    return { ...defaultInQuizSettings };
  }
}

export function saveInQuizSettings(settings: InQuizSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch { /* ignore */ }
}
