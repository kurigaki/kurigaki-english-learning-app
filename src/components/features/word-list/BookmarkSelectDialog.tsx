"use client";

import { useState } from "react";
import type { MyVocabBook } from "@/lib/vocabulary-books";

type BookmarkSelectDialogProps = {
  wordId: number;
  wordText: string;
  books: MyVocabBook[];
  /** この wordId が登録されているブック ID 一覧 */
  registeredBookIds: string[];
  onToggle: (bookId: string, wordId: number) => void;
  onCreateBook: (name: string) => void;
  onClose: () => void;
  canCreate?: boolean;
  maxCount?: number;
};

export default function BookmarkSelectDialog({
  wordId,
  wordText,
  books,
  registeredBookIds,
  onToggle,
  onCreateBook,
  onClose,
  canCreate = true,
  maxCount,
}: BookmarkSelectDialogProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed || !canCreate) return;
    onCreateBook(trimmed);
    setNewName("");
    setShowCreate(false);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* バックドロップ */}
      <div className="absolute inset-0 bg-black/40" />

      {/* ダイアログ */}
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-xl px-4 pt-4 pb-6 mx-0 sm:mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">単語帳に追加</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[240px]">{wordText}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 単語帳リスト */}
        <div className="space-y-1 max-h-60 overflow-y-auto mb-3">
          {books.length === 0 && (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">
              まだ単語帳がありません
            </p>
          )}
          {books.map((book) => {
            const isRegistered = registeredBookIds.includes(book.id);
            return (
              <button
                key={book.id}
                onClick={() => onToggle(book.id, wordId)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                  isRegistered
                    ? "bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700"
                    : "bg-slate-50 dark:bg-slate-700/50 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                {/* チェックボックス */}
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    isRegistered
                      ? "bg-primary-500 border-primary-500"
                      : "border-slate-300 dark:border-slate-500"
                  }`}
                >
                  {isRegistered && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{book.name}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{book.wordIds.length}語</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* 新しい単語帳を作成 */}
        {showCreate ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="単語帳の名前"
              maxLength={30}
              autoFocus
              className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
            <button
              onClick={handleCreate}
              disabled={!newName.trim() || !canCreate}
              className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-xl disabled:opacity-50 hover:bg-primary-600 transition-colors"
            >
              作成
            </button>
            <button
              onClick={() => { setShowCreate(false); setNewName(""); }}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              キャンセル
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowCreate(true)}
            disabled={!canCreate}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-primary-400 hover:text-primary-500 transition-colors text-sm disabled:opacity-60"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新しいリストを作成
          </button>
        )}
        {!canCreate && (
          <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-2">
            My単語帳は最大{maxCount ?? ""}冊まで作成できます。
          </p>
        )}
      </div>
    </div>
  );
}
