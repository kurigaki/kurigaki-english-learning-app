export type SpeakingDifficulty = "strict" | "normal" | "easy";

export type InQuizSettings = {
  speakingDifficulty: SpeakingDifficulty;
  showHint: boolean;      // スピーキング問題で英単語をヒント表示
  autoPlay: boolean;      // 問題表示時に音声を自動再生
  autoAdvanceMs: number;  // 正解後の自動次へ（0=無効, 1000, 2000 ms）
};

export const defaultInQuizSettings: InQuizSettings = {
  speakingDifficulty: "normal",
  showHint: false,
  autoPlay: true,
  autoAdvanceMs: 0,
};

const KEY = "english-app-in-quiz-settings";

export function loadInQuizSettings(): InQuizSettings {
  if (typeof window === "undefined") return { ...defaultInQuizSettings };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaultInQuizSettings };
    const p = JSON.parse(raw) as Record<string, unknown>;
    return {
      speakingDifficulty:
        p.speakingDifficulty === "strict" || p.speakingDifficulty === "easy"
          ? p.speakingDifficulty
          : "normal",
      showHint: typeof p.showHint === "boolean" ? p.showHint : defaultInQuizSettings.showHint,
      autoPlay: typeof p.autoPlay === "boolean" ? p.autoPlay : defaultInQuizSettings.autoPlay,
      autoAdvanceMs:
        p.autoAdvanceMs === 1000 || p.autoAdvanceMs === 2000
          ? (p.autoAdvanceMs as number)
          : 0,
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
