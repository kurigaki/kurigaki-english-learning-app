import Link from "next/link";
import { Card } from "@/components/ui";

type ReviewShortcutsProps = {
  srsReviewCount: number;
  weakWordCount: number;
};

export const ReviewShortcuts = ({ srsReviewCount, weakWordCount }: ReviewShortcutsProps) => {
  return (
    <>
      <Card hover className={`group border-2 ${srsReviewCount > 0 ? "border-primary-200 dark:border-primary-800/40 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20" : "border-slate-200 dark:border-slate-700"}`} padding="sm">
        <Link href="/review?mode=srs" className="block">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform ${srsReviewCount > 0 ? "bg-gradient-to-br from-primary-400 to-primary-500" : "bg-slate-200 dark:bg-slate-700"}`}>
              <span className="emoji-icon">🧠</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {srsReviewCount > 0 ? `今日の復習: ${srsReviewCount}語` : "今日の復習: 完了"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {srsReviewCount > 0 ? "最適なタイミングで復習して記憶を定着" : "今日の分はすべて終わっています"}
              </p>
            </div>
            <div className="text-primary-400 group-hover:translate-x-1 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      </Card>

      <Card hover className={`group border-2 ${weakWordCount > 0 ? "border-red-200 dark:border-red-800/40 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20" : "border-slate-200 dark:border-slate-700"}`} padding="sm">
        <Link href="/review?mode=weak" className="block">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform ${weakWordCount > 0 ? "bg-gradient-to-br from-red-400 to-red-500" : "bg-slate-200 dark:bg-slate-700"}`}>
              <span className="emoji-icon">🔄</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {weakWordCount > 0 ? `苦手な${weakWordCount}語を復習しよう` : "苦手な単語はありません"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {weakWordCount > 0 ? "正答率が低い単語を重点的に練習" : "まだ学習記録がないか、全問正解中です"}
              </p>
            </div>
            <div className="text-red-400 group-hover:translate-x-1 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      </Card>
    </>
  );
};