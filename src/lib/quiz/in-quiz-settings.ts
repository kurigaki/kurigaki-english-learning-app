export type SpeakingDifficulty = "strict" | "normal" | "easy";
export type DictationDifficulty = "strict" | "normal" | "easy";

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
  dictationDifficulty: DictationDifficulty; // 書き取り問題のファジーマッチ難易度
  dictationAudioPlayLimit: number | null;   // null=無制限、1〜3=再生回数上限（書き取り）
  listeningAudioPlayLimit: number | null;   // null=無制限、1〜3=再生回数上限（リスニング）
  hintMode: HintMode;                 // スピーキング問題のヒント表示モード
  listeningTranslationMode: TranslationMode; // リスニング問題の例文和訳表示モード
  writingTranslationMode: TranslationMode;   // 書き取り問題の例文和訳表示モード
  readingAudioMode: AudioMode;        // 音声再生モード（リーディング）
  writingAudioMode: AudioMode;        // 音声再生モード（ライティング）
  speakingAudioMode: AudioMode;       // 音声再生モード（スピーキング）
  listeningAudioMode: AudioMode;      // 音声再生モード（リスニング）
  autoAdvanceMode: AutoAdvanceMode;
  autoAdvanceMs: number;              // timedモード時の遅延（ms）
};

export const defaultInQuizSettings: InQuizSettings = {
  speakingDifficulty: "normal",
  dictationDifficulty: "normal",
  dictationAudioPlayLimit: null,
  listeningAudioPlayLimit: null,
  hintMode: "none",
  listeningTranslationMode: "reveal",
  writingTranslationMode: "always",
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

    // 旧 translationMode からの移行（新フィールドが未設定の場合にフォールバック）
    let legacyTranslationMode: TranslationMode | null = null;
    if (p.translationMode === "none" || p.translationMode === "reveal" || p.translationMode === "always") {
      legacyTranslationMode = p.translationMode;
    } else if (typeof p.showTranslation === "boolean") {
      legacyTranslationMode = p.showTranslation ? "always" : "none";
    }

    let listeningTranslationMode: TranslationMode = defaultInQuizSettings.listeningTranslationMode;
    if (p.listeningTranslationMode === "none" || p.listeningTranslationMode === "reveal" || p.listeningTranslationMode === "always") {
      listeningTranslationMode = p.listeningTranslationMode;
    } else if (legacyTranslationMode !== null) {
      listeningTranslationMode = legacyTranslationMode;
    }

    let writingTranslationMode: TranslationMode = defaultInQuizSettings.writingTranslationMode;
    if (p.writingTranslationMode === "none" || p.writingTranslationMode === "reveal" || p.writingTranslationMode === "always") {
      writingTranslationMode = p.writingTranslationMode;
    } else if (legacyTranslationMode !== null) {
      writingTranslationMode = legacyTranslationMode;
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
      dictationDifficulty:
        p.dictationDifficulty === "strict" || p.dictationDifficulty === "easy"
          ? p.dictationDifficulty
          : "normal",
      dictationAudioPlayLimit:
        p.dictationAudioPlayLimit === null
          ? null
          : typeof p.dictationAudioPlayLimit === "number" && p.dictationAudioPlayLimit >= 1 && p.dictationAudioPlayLimit <= 5
            ? p.dictationAudioPlayLimit
            : null,
      listeningAudioPlayLimit:
        p.listeningAudioPlayLimit === null
          ? null
          : typeof p.listeningAudioPlayLimit === "number" && p.listeningAudioPlayLimit >= 1 && p.listeningAudioPlayLimit <= 5
            ? p.listeningAudioPlayLimit
            : null,
      hintMode,
      listeningTranslationMode,
      writingTranslationMode,
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

const MY_SETTINGS_KEY = "english-app-my-quiz-settings";

export function loadMyQuizSettings(): InQuizSettings | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(MY_SETTINGS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as InQuizSettings;
  } catch {
    return null;
  }
}

export function saveMyQuizSettings(settings: InQuizSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MY_SETTINGS_KEY, JSON.stringify(settings));
  } catch { /* ignore */ }
}
