"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Card, Button } from "@/components/ui";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { unifiedStorage } from "@/lib/unified-storage";
import { words, Word, categoryLabels, difficultyLabels } from "@/data/words";

type SortOption = "added" | "name" | "difficulty";

export default function BookmarksPage() {
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const [bookmarkedWords, setBookmarkedWords] = useState<Word[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("added");
  const [isMounted, setIsMounted] = useState(false);

  const loadBookmarks = useCallback(async () => {
    const bookmarkedIds = await unifiedStorage.getBookmarkedWordIds();
    const bookmarked: Word[] = [];

    // IDの順序を保持するためにmapを使用（登録順）
    bookmarkedIds.forEach((id) => {
      const word = words.find((w) => w.id === id);
      if (word) {
        bookmarked.push(word);
      }
    });

    // ソート
    if (sortBy === "name") {
      bookmarked.sort((a, b) => a.word.localeCompare(b.word));
    } else if (sortBy === "difficulty") {
      bookmarked.sort((a, b) => a.difficulty - b.difficulty);
    }
    // "added" の場合はそのまま（登録順）

    setBookmarkedWords(bookmarked);
  }, [sortBy]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 認証初期化完了後、または認証状態・ソート順が変わったらデータを再取得
  // loadBookmarksはsortByに依存しているため、sortBy変更時も自動で再実行される
  useEffect(() => {
    if (isAuthLoading || !isMounted) return;
    loadBookmarks();
  }, [isAuthLoading, isAuthenticated, isMounted, loadBookmarks]);

  const handleRemoveBookmark = async (wordId: number, e: React.MouseEvent) => {
    e.preventDefault(); // Linkのナビゲーションを防ぐ
    e.stopPropagation();
    await unifiedStorage.removeBookmark(wordId);
    loadBookmarks();
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty === 1) return "text-green-600 bg-green-100";
    if (difficulty === 2) return "text-blue-600 bg-blue-100";
    if (difficulty === 3) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  if (!isMounted) {
    return (
      <div className="h-[calc(100vh-64px)] px-4 py-3 flex items-center justify-center">
        <p className="text-slate-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] px-4 py-3 flex flex-col">
      <div className="max-w-2xl w-full mx-auto flex flex-col h-full">
        {/* 上部固定: ヘッダー */}
        <div className="flex-shrink-0 mb-2">
          <Link
            href="/"
            className="flex items-center gap-1 text-slate-500 hover:text-slate-700 mb-2 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>戻る</span>
          </Link>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="text-2xl emoji-icon">🔖</span>
            <span>ブックマーク</span>
          </h1>
          <p className="text-slate-500 text-sm">
            {bookmarkedWords.length}語を保存中
          </p>
        </div>

        {/* 上部固定: ソートオプション */}
        {bookmarkedWords.length > 0 && (
          <div className="flex-shrink-0 flex gap-1.5 mb-2">
            <button
              onClick={() => setSortBy("added")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                sortBy === "added"
                  ? "bg-primary-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              登録順
            </button>
            <button
              onClick={() => setSortBy("name")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                sortBy === "name"
                  ? "bg-primary-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              名前順
            </button>
            <button
              onClick={() => setSortBy("difficulty")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                sortBy === "difficulty"
                  ? "bg-primary-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              難易度順
            </button>
          </div>
        )}

        {/* 中央スクロール: 単語リスト */}
        {bookmarkedWords.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <Card className="text-center py-8">
              <span className="text-5xl mb-3 block emoji-icon">📚</span>
              <h2 className="text-lg font-bold text-slate-800 mb-2">
                ブックマークがありません
              </h2>
              <p className="text-slate-500 text-sm mb-4">
                単語詳細画面や単語帳から<br />
                お気に入りの単語をブックマークしましょう。
              </p>
              <Link href="/word-list">
                <Button>単語帳を見る</Button>
              </Link>
            </Card>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto min-h-0 space-y-2">
              {bookmarkedWords.map((word) => (
                <Link key={word.id} href={`/word/${word.id}?from=bookmarks`}>
                  <Card
                    hover
                    className="flex items-center gap-3 group !p-3"
                  >
                    {/* 難易度バッジ */}
                    <div
                      className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center ${getDifficultyColor(
                        word.difficulty
                      )}`}
                    >
                      <span className="text-xs font-medium">Lv.{word.difficulty}</span>
                      <span className="text-[10px] opacity-70">
                        {difficultyLabels[word.difficulty]}
                      </span>
                    </div>

                    {/* 単語情報 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-800 group-hover:text-primary-600 transition-colors">
                          {word.word}
                        </h3>
                        <SpeakButton text={word.word} size="sm" />
                      </div>
                      <p className="text-slate-500 text-xs truncate">{word.meaning}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                        <span>{categoryLabels[word.category]}</span>
                      </div>
                    </div>

                    {/* ブックマーク解除ボタン */}
                    <button
                      onClick={(e) => handleRemoveBookmark(word.id, e)}
                      className="p-2 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                      title="ブックマークを解除"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                      </svg>
                    </button>

                    {/* 矢印 */}
                    <div className="text-slate-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* 下部固定: クイズ誘導 */}
            <div className="flex-shrink-0 pt-2">
              <Card className="!p-3 bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-100">
                <div className="text-center">
                  <Link href="/quiz">
                    <Button fullWidth size="sm">
                      ブックマーク単語でクイズ
                    </Button>
                  </Link>
                  <p className="text-xs text-slate-400 mt-1">
                    クイズ設定で「ブックマークのみ」を選択できます
                  </p>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
