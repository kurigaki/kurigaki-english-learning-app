export type SpeakingDifficulty = "strict" | "normal" | "easy";

/** ヒント表示モード */
export type HintMode = "none" | "reveal" | "always";

/** 音声モード: off=なし / button=ボタン表示 / auto=自動再生+ボタン */
export type AudioMode = "off" | "button" | "auto";

/** 回答後の自動次へモード */
export type AutoAdvanceMode = "off" | "timed" | "instant";

export type InQuizSettings = {
  speakingDifficulty: SpeakingDifficulty;
  hintMode: HintMode;           // スピーキング問題のヒント表示モード
  audioMode: AudioMode;         // 音声再生モード
  autoAdvanceMode: AutoAdvanceMode;
  autoAdvanceMs: number;        // timedモード時の遅延（ms）
};

export const defaultInQuizSettings: InQuizSettings = {
  speakingDifficulty: "normal",
  hintMode: "none",
  audioMode: "auto",
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

    // audioMode: autoPlay(boolean) からの移行も考慮
    let audioMode: AudioMode = defaultInQuizSettings.audioMode;
    if (p.audioMode === "off" || p.audioMode === "button" || p.audioMode === "auto") {
      audioMode = p.audioMode;
    } else if (typeof p.autoPlay === "boolean") {
      audioMode = p.autoPlay ? "auto" : "off"; // 旧フォーマット移行
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
      audioMode,
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
