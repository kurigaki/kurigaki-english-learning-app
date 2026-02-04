"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { unifiedStorage } from "@/lib/unified-storage";
import type { WordStats } from "@/lib/storage";
import { LearningRecord, QuestionType } from "@/types";
import { words } from "@/data/words";
import { Card, StatsCard, Button, SpeakButton } from "@/components/ui";

const questionTypeLabels: Record<QuestionType, string> = {
  "en-to-ja": "英→日",
  "ja-to-en": "日→英",
  "fill-blank": "穴埋め",
};

export default function HistoryPage() {
  // isLoading: 認証初期化中はデータを読み込まない（Supabaseセッションが未準備のため）
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [records, setRecords] = useState<LearningRecord[]>([]);
  const [wordStats, setWordStats] = useState<Map<number, WordStats>>(new Map());
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "weak" | "history">("overview");

  const loadData = useCallback(async () => {
    const data = await unifiedStorage.getRecords();
    setRecords([...data].reverse());
    const stats = await unifiedStorage.getWordStats();
    setWordStats(stats);
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 認証初期化完了後にデータを再取得（認証中はSupabaseセッションが未準備のため待機）
  useEffect(() => {
    if (!isAuthLoading) {
      loadData();
    }
  }, [isAuthLoading, isAuthenticated, loadData]);

  const todayStats = useMemo(() => {
    const today = new Date().toDateString();
    const todayRecords = records.filter(
      (r) => new Date(r.studiedAt).toDateString() === today
    );
    return {
      total: todayRecords.length,
      correct: todayRecords.filter((r) => r.correct).length,
      rate: todayRecords.length > 0
        ? Math.round((todayRecords.filter((r) => r.correct).length / todayRecords.length) * 100)
        : 0,
    };
  }, [records]);

  const overallStats = useMemo(() => ({
    total: records.length,
    correct: records.filter((r) => r.correct).length,
    rate: records.length > 0
      ? Math.round((records.filter((r) => r.correct).length / records.length) * 100)
      : 0,
    uniqueWords: wordStats.size,
    totalWords: words.length,
  }), [records, wordStats]);

  const typeStats = useMemo(() => {
    const stats: Record<QuestionType, { total: number; correct: number }> = {
      "en-to-ja": { total: 0, correct: 0 },
      "ja-to-en": { total: 0, correct: 0 },
      "fill-blank": { total: 0, correct: 0 },
    };

    for (const record of records) {
      const type = record.questionType || "en-to-ja";
      stats[type].total++;
      if (record.correct) stats[type].correct++;
    }

    return stats;
  }, [records]);

  const weakWords = useMemo(() => {
    const weak: { id: number; word: string; meaning: string; accuracy: number; attempts: number }[] = [];
    wordStats.forEach((stats) => {
      if (stats.accuracy < 70 && stats.totalAttempts >= 1) {
        const wordData = words.find((w) => w.id === stats.wordId);
        if (wordData) {
          weak.push({
            id: wordData.id,
            word: wordData.word,
            meaning: wordData.meaning,
            accuracy: stats.accuracy,
            attempts: stats.totalAttempts,
          });
        }
      }
    });
    return weak.sort((a, b) => a.accuracy - b.accuracy);
  }, [wordStats]);

  // 履歴の単語IDを取得するヘルパー関数
  const getWordIdByWord = (wordStr: string): number | null => {
    const found = words.find((w) => w.word === wordStr);
    return found ? found.id : null;
  };

  if (!isMounted) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="animate-pulse text-primary-500">読み込み中...</div>
      </div>
    );
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("ja-JP", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="h-[calc(100vh-64px)] px-4 py-3 flex flex-col">
      <div className="max-w-2xl w-full mx-auto flex flex-col h-full">
        {/* 上部固定: ヘッダー */}
        <div className="flex-shrink-0 mb-2">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="text-2xl emoji-icon">📊</span>
            <span>学習統計</span>
          </h1>
        </div>

        {/* 上部固定: 今日の学習 */}
        <Card className="flex-shrink-0 mb-2 !p-3 bg-gradient-to-r from-primary-50 to-accent-50">
          <h2 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">
            <span className="emoji-icon">🔥</span>
            <span>今日の学習</span>
          </h2>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-xl font-bold text-primary-600">{todayStats.total}</div>
              <div className="text-xs text-slate-500">回答数</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-success-600">{todayStats.correct}</div>
              <div className="text-xs text-slate-500">正解数</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-accent-600">{todayStats.rate}%</div>
              <div className="text-xs text-slate-500">正答率</div>
            </div>
          </div>
          {todayStats.total === 0 && (
            <div className="mt-2 text-center">
              <Link href="/quiz">
                <Button size="sm">今日の学習を始める</Button>
              </Link>
            </div>
          )}
        </Card>

        {/* 上部固定: タブ */}
        <div className="flex-shrink-0 flex gap-1.5 mb-2">
          {[
            { id: "overview" as const, label: "概要", icon: "📈" },
            { id: "weak" as const, label: "苦手単語", icon: "💪" },
            { id: "history" as const, label: "履歴", icon: "📝" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-sm font-medium transition-all inline-flex items-center justify-center gap-1 ${
                activeTab === tab.id
                  ? "bg-primary-500 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-primary-50"
              }`}
            >
              <span className="emoji-icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 中央スクロール: タブコンテンツ */}
        <div className="flex-1 overflow-y-auto min-h-0">

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Overall Stats */}
            <Card>
              <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                <span className="emoji-icon">📊</span>
                <span>全体統計</span>
              </h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <StatsCard label="総回答数" value={overallStats.total} color="primary" />
                <StatsCard label="正解数" value={overallStats.correct} color="success" />
                <StatsCard label="正答率" value={`${overallStats.rate}%`} color="accent" />
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-slate-600 mb-2">
                  <span>学習進捗</span>
                  <span>{overallStats.uniqueWords} / {overallStats.totalWords} 単語</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
                    style={{ width: `${(overallStats.uniqueWords / overallStats.totalWords) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {Math.round((overallStats.uniqueWords / overallStats.totalWords) * 100)}% の単語を学習済み
                </p>
              </div>
            </Card>

            {/* Type Stats */}
            <Card>
              <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                <span className="emoji-icon">🎯</span>
                <span>問題タイプ別</span>
              </h2>
              <div className="space-y-4">
                {(Object.entries(typeStats) as [QuestionType, { total: number; correct: number }][]).map(
                  ([type, stats]) => {
                    const rate = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                    return (
                      <div key={type}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">{questionTypeLabels[type]}</span>
                          <span className="text-slate-500">
                            {stats.correct}/{stats.total} ({rate}%)
                          </span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              rate >= 80 ? "bg-success-500" : rate >= 60 ? "bg-accent-500" : "bg-error-400"
                            }`}
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Weak Words Tab */}
        {activeTab === "weak" && (
          <Card>
            <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
              <span className="emoji-icon">💪</span>
              <span>苦手単語 ({weakWords.length}語)</span>
            </h2>
            {weakWords.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-5xl mb-4 block emoji-icon">🎉</span>
                <p className="text-slate-500">苦手な単語はありません!</p>
                <p className="text-sm text-slate-400 mt-1">この調子で頑張りましょう</p>
              </div>
            ) : (
              <div className="space-y-3">
                {weakWords.map((word) => (
                  <Link
                    key={word.id}
                    href={`/word/${word.id}`}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-primary-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <SpeakButton text={word.word} size="sm" />
                      <div>
                        <p className="font-bold text-slate-800 group-hover:text-primary-600 transition-colors">{word.word}</p>
                        <p className="text-sm text-slate-500">{word.meaning}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={`font-bold ${word.accuracy < 50 ? "text-error-500" : "text-accent-500"}`}>
                          {word.accuracy}%
                        </p>
                        <p className="text-xs text-slate-400">{word.attempts}回挑戦</p>
                      </div>
                      <div className="text-slate-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
                <div className="pt-4 text-center">
                  <Link href="/quiz?weakOnly=true">
                    <Button>苦手単語を復習する</Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>
        )}

          {/* History Tab */}
          {activeTab === "history" && (
            <Card padding="none">
              <div className="p-3 border-b border-primary-100">
                <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <span className="emoji-icon">📝</span>
                  <span>回答履歴</span>
                </h2>
              </div>

              {records.length === 0 ? (
                <div className="p-8 text-center">
                  <span className="text-4xl mb-3 block emoji-icon">📚</span>
                  <p className="text-slate-500 text-sm mb-3">まだ学習履歴がありません</p>
                  <Link href="/quiz">
                    <Button size="sm">クイズを始める</Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-primary-50">
                  {records.slice(0, 50).map((record) => {
                    const wordId = getWordIdByWord(record.word);
                    const content = (
                      <>
                        <div className="flex items-center gap-2">
                          <div
                            className={`
                              w-8 h-8 rounded-lg flex items-center justify-center text-sm
                              ${record.correct
                                ? "bg-success-100 text-success-500"
                                : "bg-error-100 text-error-500"
                              }
                            `}
                          >
                            {record.correct ? "✓" : "✗"}
                          </div>
                          <SpeakButton text={record.word} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-slate-800 group-hover:text-primary-600 transition-colors truncate">{record.word}</p>
                            <p className="text-xs text-slate-500 truncate">{record.meaning}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {record.questionType && (
                            <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                              {questionTypeLabels[record.questionType]}
                            </span>
                          )}
                          <span className="text-xs text-slate-400">
                            {formatDate(record.studiedAt)}
                          </span>
                          {wordId && (
                            <div className="text-slate-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </>
                    );

                    return wordId ? (
                      <Link
                        key={record.id}
                        href={`/word/${wordId}`}
                        className="p-2.5 flex items-center justify-between hover:bg-primary-50/50 transition-colors group"
                      >
                        {content}
                      </Link>
                    ) : (
                      <div
                        key={record.id}
                        className="p-2.5 flex items-center justify-between"
                      >
                        {content}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* 下部固定: クリアボタン */}
        {records.length > 0 && (
          <div className="flex-shrink-0 pt-2 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm("学習履歴をすべて削除しますか？")) {
                  unifiedStorage.clearRecords();
                  setRecords([]);
                  setWordStats(new Map());
                }
              }}
            >
              <span className="flex items-center gap-1 text-error-500 text-xs">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                履歴をクリア
              </span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
