import Link from "next/link";

export const QuickLinks = () => {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Link href="/achievements" className="block">
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-3 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
          <div className="text-2xl mb-1 group-hover:scale-110 transition-transform inline-block">🏆</div>
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">実績</h3>
        </div>
      </Link>
      <Link href="/word-list/all" className="block">
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-3 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
          <div className="text-2xl mb-1 group-hover:scale-110 transition-transform inline-block">📖</div>
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">単語帳</h3>
        </div>
      </Link>
      <Link href="/weak-words" className="block">
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-3 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
          <div className="text-2xl mb-1 group-hover:scale-110 transition-transform inline-block">📝</div>
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">苦手単語</h3>
        </div>
      </Link>
    </div>
  );
};
