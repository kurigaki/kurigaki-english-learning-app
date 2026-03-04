import type { UserProgress } from "@/lib/hooks/useHomeData";

type StatusHeaderProps = {
  userProgress: UserProgress;
};

export const StatusHeader = ({ userProgress }: StatusHeaderProps) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-7 h-7 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm">
              {userProgress.level}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Lv.</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm emoji-icon">🔥</span>
            <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{userProgress.streak}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">日</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm emoji-icon">{userProgress.dailyProgress.completed ? "✅" : "🎯"}</span>
            <span className={`text-sm font-bold ${userProgress.dailyProgress.completed ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"}`}>
              {userProgress.dailyProgress.current}/{userProgress.dailyProgress.goal}
            </span>
          </div>
        </div>
      </div>
      {/* XPバー */}
      <div>
        <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mb-0.5">
          <span>Lv.{userProgress.level} → Lv.{userProgress.level + 1}</span>
          <span>{userProgress.xpProgress.current}/{userProgress.xpProgress.required} XP</span>
        </div>
        <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-500" style={{ width: `${userProgress.xpProgress.percentage}%` }} />
        </div>
      </div>
    </div>
  );
};