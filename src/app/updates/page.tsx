"use client";

import Link from "next/link";
import {
  APP_UPDATES,
  UPDATE_CATEGORY_CONFIG,
  formatUpdateDate,
} from "@/data/updates";

export default function UpdatesPage() {
  return (
    <div className="main-content-scroll px-4 py-6">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6">
          <Link
            href="/"
            className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block"
          >
            ← ホームに戻る
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="emoji-icon">📢</span>
            <span>アップデート情報</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            アプリの新機能や改善点をお知らせします
          </p>
        </div>

        {/* アップデートリスト */}
        <div className="space-y-4">
          {APP_UPDATES.map((update, index) => {
            const categoryConfig = UPDATE_CATEGORY_CONFIG[update.category];
            return (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm"
              >
                {/* ヘッダー行 */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryConfig.bgColor} ${categoryConfig.textColor}`}
                      >
                        {categoryConfig.label}
                      </span>
                      {update.version && (
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          v{update.version}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-bold mt-1">{update.title}</h2>
                  </div>
                  <span className="text-sm text-slate-400 dark:text-slate-500 whitespace-nowrap">
                    {formatUpdateDate(update.date)}
                  </span>
                </div>

                {/* 内容リスト */}
                <ul className="space-y-1.5">
                  {update.content.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"
                    >
                      <span className="text-primary-500 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* フッター */}
        <div className="mt-8 text-center text-sm text-slate-400 dark:text-slate-500">
          <p>ご意見・ご要望があればお気軽にお問い合わせください</p>
        </div>
      </div>
    </div>
  );
}
