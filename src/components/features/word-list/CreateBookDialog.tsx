"use client";

import { useState } from "react";

type CreateBookDialogProps = {
  onCreate: (name: string) => void;
  onClose: () => void;
};

export default function CreateBookDialog({ onCreate, onClose }: CreateBookDialogProps) {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-xl px-4 pt-4 pb-6 mx-0 sm:mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">
          新しい単語帳を作成
        </h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="単語帳の名前を入力"
          autoFocus
          maxLength={30}
          className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-400 mb-4"
        />
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="flex-1 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-xl disabled:opacity-50 hover:bg-primary-600 transition-colors"
          >
            作成
          </button>
        </div>
      </div>
    </div>
  );
}
