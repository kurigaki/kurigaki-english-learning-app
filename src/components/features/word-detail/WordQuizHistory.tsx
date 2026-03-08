import { useState } from "react";
import type { LearningRecord, QuestionType } from "@/types";

type WordQuizHistoryProps = {
  history: LearningRecord[];
};

const questionTypeLabels: Record<QuestionType, string> = {
  "en-to-ja": "英→日",
  "ja-to-en": "日→英",
  listening: "リスニング",
  dictation: "書き取り",
  speaking: "スピーキング",
};

export const WordQuizHistory = ({ history }: WordQuizHistoryProps) => {
  const [showAll, setShowAll] = useState(false);

  // 履歴を新しい順に並び替え
  const sortedHistory = [...history].reverse();
  // 表示する履歴を決定
  const displayHistory = showAll ? sortedHistory : sortedHistory.slice(0, 5);

  return (
    <div className="py-3 border-b border-slate-100 dark:border-slate-700">
      <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">最近のクイズ履歴</h3>
      {history.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-slate-500">この単語のクイズ履歴はまだありません。</p>
      ) : (
        <>
          <div className="space-y-2">
            {displayHistory.map((record, index) => (
            <div
              key={`${record.studiedAt}-${index}`}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    record.correct
                      ? "bg-success-100 dark:bg-success-900/40 text-success-600 dark:text-success-300"
                      : "bg-error-100 dark:bg-error-900/40 text-error-600 dark:text-error-300"
                  }`}
                >
                  {record.correct ? "✓" : "✗"}
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    {questionTypeLabels[record.questionType] || record.questionType}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {new Date(record.studiedAt).toLocaleDateString('ja-JP')}
              </p>
            </div>
          ))}
          </div>
          {history.length > 5 && !showAll && (
            <div className="text-center mt-2">
              <button
                onClick={() => setShowAll(true)}
                className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                もっと見る ({history.length - 5}件)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};