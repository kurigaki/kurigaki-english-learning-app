"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { COURSE_DEFINITIONS } from "@/data/words/courses";
import { RECOMMENDED_BOOKS } from "@/data/recommended-books";
import { vocabularyBooks, type MyVocabBook, type RecentlyViewedBook } from "@/lib/vocabulary-books";
import { resolveBookMeta, COURSE_EMOJI, COURSE_GRADIENT, MASTERY_META, ACCURACY_META } from "@/lib/vocab-book-meta";
import { memoryLevelBadgeClass, memoryLevelSurfaceClass } from "@/lib/memory-level";
import VocabBookCard from "@/components/features/word-list/VocabBookCard";
import CreateBookDialog from "@/components/features/word-list/CreateBookDialog";
import type { Course } from "@/data/words/types";

// 正答率単語帳の表示順（"100" が integer key として先頭に来るのを防ぐ）
const ACCURACY_ORDER = ["0-25", "25-50", "50-75", "75-100", "100"] as const;

type SectionProps = {
  title: string;
  seeAllHref?: string;
  children: React.ReactNode;
};

function Section({ title, seeAllHref, children }: SectionProps) {
  return (
    <section className="mb-5">
      <div className="flex items-center justify-between mb-2 px-0.5">
        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">{title}</h2>
        {seeAllHref && (
          <Link href={seeAllHref} className="text-xs text-primary-500 hover:underline flex items-center gap-0.5">
            すべて見る
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {children}
      </div>
    </section>
  );
}

export default function WordListHubPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [myBooks, setMyBooks] = useState<MyVocabBook[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedBook[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [canCreateBook, setCanCreateBook] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    setMyBooks(vocabularyBooks.getMyVocabBooks());
    setFavoriteIds(vocabularyBooks.getFavoriteBookIds());
    setRecentlyViewed(vocabularyBooks.getRecentlyViewedBooks());
    setCanCreateBook(vocabularyBooks.canCreateMyVocabBook());
  }, []);

  const handleCreateBook = useCallback((name: string) => {
    const created = vocabularyBooks.createMyVocabBook(name);
    if (!created) {
      alert(`My単語帳は最大${vocabularyBooks.getMyVocabBookLimit()}冊まで作成できます。`);
      setCanCreateBook(false);
      return;
    }
    setMyBooks(vocabularyBooks.getMyVocabBooks());
    setCanCreateBook(vocabularyBooks.canCreateMyVocabBook());
  }, []);

  // コース別セクション定義
  const courseGroups: { sectionTitle: string; course: Course }[] = [
    { sectionTitle: "中学英語の単語帳", course: "junior" },
    { sectionTitle: "高校英語の単語帳", course: "senior" },
    { sectionTitle: "英検®の単語帳",   course: "eiken" },
    { sectionTitle: "TOEICの単語帳",   course: "toeic" },
    { sectionTitle: "英会話力向上の単語帳", course: "conversation" },
  ];

  return (
    <div className="main-content-scroll px-4 py-3 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* 検索バー */}
        <div className="mb-4">
          <button
            onClick={() => router.push("/word-list/all")}
            className="w-full flex items-center gap-2 px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 dark:text-slate-500 text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-left"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            全単語を検索する
          </button>
        </div>

        {!isMounted ? null : (
          <>
          {/* お気に入り */}
          <section className="mb-5">
            <div className="flex items-center justify-between mb-2 px-0.5">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                <span className="emoji-icon">⭐</span> お気に入り
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </h2>
            </div>
            {favoriteIds.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-5 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  単語帳ページ上部のアイコン（<span className="emoji-icon">⭐</span>）から、<br />
                  お気に入り登録できます
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {favoriteIds.map((bookId) => {
                  const meta = resolveBookMeta(bookId, myBooks);
                  if (!meta) return null;
                  return (
                    <VocabBookCard
                      key={bookId}
                      bookId={bookId}
                      name={meta.name}
                      emoji={meta.emoji}
                      gradientClass={meta.gradientClass}
                    />
                  );
                })}
              </div>
            )}
          </section>

          {/* 最近見た単語帳 */}
          {recentlyViewed.length > 0 && (
            <Section title="最近見た単語帳">
              {recentlyViewed.slice(0, 10).map(({ bookId }) => {
                const meta = resolveBookMeta(bookId, myBooks);
                if (!meta) return null;
                return (
                  <VocabBookCard
                    key={bookId}
                    bookId={bookId}
                    name={meta.name}
                    emoji={meta.emoji}
                    gradientClass={meta.gradientClass}
                  />
                );
              })}
            </Section>
          )}

          {/* My単語帳 */}
          <section className="mb-5">
            <div className="flex items-center justify-between mb-2 px-0.5">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">My単語帳</h2>
            </div>
            {myBooks.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-5 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  オリジナルの単語帳を作れます
                </p>
                <button
                  onClick={() => setShowCreateDialog(true)}
                  disabled={!canCreateBook}
                  className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-xl hover:bg-primary-600 transition-colors"
                >
                  + 最初の単語帳を作成
                </button>
                {!canCreateBook && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                    My単語帳は最大{vocabularyBooks.getMyVocabBookLimit()}冊まで作成できます。
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {myBooks.map((book) => (
                  <VocabBookCard
                    key={book.id}
                    bookId={`my:${book.id}`}
                    name={book.name}
                    emoji="📌"
                    gradientClass="from-primary-400 to-primary-600"
                    wordCount={book.wordIds.length}
                  />
                ))}
                {canCreateBook ? (
                  <button
                    onClick={() => setShowCreateDialog(true)}
                    className="rounded-2xl border-2 border-dashed border-primary-300 dark:border-primary-700 flex flex-col items-center justify-center min-h-[128px] text-primary-400 dark:text-primary-600 hover:border-primary-400 dark:hover:border-primary-500 hover:text-primary-500 dark:hover:text-primary-400 transition-colors gap-1.5"
                  >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-xs font-medium">新規作成</span>
                  </button>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center min-h-[128px] text-[11px] text-slate-400 dark:text-slate-500 text-center px-3">
                    My単語帳は最大{vocabularyBooks.getMyVocabBookLimit()}冊まで
                  </div>
                )}
              </div>
            )}
          </section>

          {/* 記憶度ごとの単語帳 */}
          <Section title="記憶度ごとの単語帳">
            {(Object.entries(MASTERY_META) as [string, typeof MASTERY_META[keyof typeof MASTERY_META]][]).map(([level, m]) => (
              <VocabBookCard
                key={level}
                bookId={`mastery:${level}`}
                name={m.name}
                emoji={m.emoji}
                gradientClass={m.gradient}
                cardClassName={memoryLevelBadgeClass[level as keyof typeof memoryLevelBadgeClass]}
                bodyClassName={memoryLevelSurfaceClass[level as keyof typeof memoryLevelSurfaceClass]}
              />
            ))}
          </Section>

          {/* 正答率ごとの単語帳（明示的な順序で「100%達成」を末尾に） */}
          <Section title="正答率ごとの単語帳">
            {ACCURACY_ORDER.map((range) => {
              const m = ACCURACY_META[range];
              return (
                <VocabBookCard
                  key={range}
                  bookId={`accuracy:${range}`}
                  name={m.name}
                  emoji={m.emoji}
                  gradientClass={m.gradient}
                />
              );
            })}
          </Section>

          {/* オススメ単語帳 */}
          <Section title="オススメ単語帳">
            {RECOMMENDED_BOOKS.map((book) => (
              <VocabBookCard
                key={book.id}
                bookId={`recommended:${book.id}`}
                name={book.name}
                emoji={book.emoji}
                gradientClass={book.gradientClass}
              />
            ))}
          </Section>

          {/* コース別セクション */}
          {courseGroups.map(({ sectionTitle, course }) => {
            const def = COURSE_DEFINITIONS[course];
            if (!def || def.stages.length === 0) return null;
            return (
              <Section key={course} title={sectionTitle}>
                {def.stages.map((stg) => (
                  <VocabBookCard
                    key={stg.stage}
                    bookId={`course:${course}:${stg.stage}`}
                    name={stg.displayName}
                    emoji={COURSE_EMOJI[course] ?? "📖"}
                    gradientClass={COURSE_GRADIENT[course] ?? "from-slate-400 to-slate-600"}
                  />
                ))}
              </Section>
            );
          })}
          </>
        )}

        {/* My単語帳 作成ダイアログ */}
        {showCreateDialog && (
          <CreateBookDialog
            onCreate={handleCreateBook}
            onClose={() => setShowCreateDialog(false)}
            isDisabled={!canCreateBook}
            maxCount={vocabularyBooks.getMyVocabBookLimit()}
          />
        )}
      </div>
    </div>
  );
}
