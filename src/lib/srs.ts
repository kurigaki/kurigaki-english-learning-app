/**
 * SM-2 間隔反復学習アルゴリズム
 *
 * SuperMemo 2 アルゴリズムに基づき、復習間隔・易しさ係数を計算する。
 * 参考: https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method
 */

export type SrsStatus = "new" | "learning" | "review" | "mastered";

export type SrsProgress = {
  wordId: number;
  easeFactor: number; // 易しさ係数（初期値 2.5、下限 1.3）
  intervalDays: number; // 次回復習までの日数
  repetitions: number; // 連続正解回数
  nextReviewDate: string | null; // "YYYY-MM-DD" or null
  status: SrsStatus;
  lastReviewedDate: string | null; // 最終復習日
};

/** 新規単語のデフォルトSRS進捗を返す */
export function getInitialSrsProgress(wordId: number): SrsProgress {
  return {
    wordId,
    easeFactor: 2.5,
    intervalDays: 0,
    repetitions: 0,
    nextReviewDate: null,
    status: "new",
    lastReviewedDate: null,
  };
}

/**
 * SM-2 アルゴリズム本体
 *
 * @param current 現在のSRS進捗
 * @param quality 回答品質 (0-5)
 *   - 5: 完璧（即答）
 *   - 4: 正解（少し考えた）
 *   - 3: 正解だが難しかった
 *   - 2: 不正解（見覚えはあった）
 *   - 1: 不正解（ほぼ忘れていた）
 *   - 0: 完全に忘れていた
 * @returns 更新後のSRS進捗
 */
export function calculateSm2(current: SrsProgress, quality: number): SrsProgress {
  // quality を 0-5 に制限
  const q = Math.max(0, Math.min(5, Math.round(quality)));

  // EFactor 更新: EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
  let newEF =
    current.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (newEF < 1.3) newEF = 1.3;

  let newReps: number;
  let newInterval: number;

  if (q < 3) {
    // 不正解: リセット
    newReps = 0;
    newInterval = 1;
  } else {
    // 正解: repetitions を進める
    newReps = current.repetitions + 1;

    if (newReps === 1) {
      newInterval = 1;
    } else if (newReps === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(current.intervalDays * newEF);
    }
  }

  // ステータス判定
  let newStatus: SrsStatus;
  if (newInterval >= 21) {
    newStatus = "mastered";
  } else if (newReps >= 2) {
    newStatus = "review";
  } else {
    newStatus = "learning";
  }

  // nextReviewDate = today + intervalDays
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextDate = new Date(today);
  nextDate.setDate(nextDate.getDate() + newInterval);
  const nextReviewDate = nextDate.toISOString().split("T")[0];

  const todayStr = today.toISOString().split("T")[0];

  return {
    wordId: current.wordId,
    easeFactor: Math.round(newEF * 100) / 100, // 小数点2桁に丸め
    intervalDays: newInterval,
    repetitions: newReps,
    nextReviewDate,
    status: newStatus,
    lastReviewedDate: todayStr,
  };
}

/**
 * 復習が必要かどうか判定する
 *
 * nextReviewDate が today 以前であれば true
 */
export function isDueForReview(progress: SrsProgress): boolean {
  if (!progress.nextReviewDate) return false;
  if (progress.status === "new") return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  return progress.nextReviewDate <= todayStr;
}

/**
 * 回答結果から SM-2 の quality (0-5) を算出する
 *
 * @param correct 正解かどうか
 * @param responseTimeMs 回答時間（ミリ秒、省略可）
 */
export function answerQualityFromResult(
  correct: boolean,
  responseTimeMs?: number
): number {
  if (correct) {
    // 正解: 3秒以内なら5、それ以上なら4
    if (responseTimeMs !== undefined && responseTimeMs <= 3000) {
      return 5;
    }
    return 4;
  } else {
    // 不正解: 素早く回答（3秒以内）なら2（見覚えあり）、それ以外は1
    if (responseTimeMs !== undefined && responseTimeMs <= 3000) {
      return 2;
    }
    return 1;
  }
}
