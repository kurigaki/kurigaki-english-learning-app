export const getAccuracyBadgeClass = (accuracy: number | null | undefined): string => {
  if (accuracy === null || accuracy === undefined) {
    return "text-slate-600 bg-slate-100 border border-slate-200 dark:text-slate-300 dark:bg-slate-800/70 dark:border-slate-700";
  }
  if (accuracy < 25) {
    return "text-rose-700 bg-rose-100 border border-rose-200 dark:text-rose-200 dark:bg-rose-900/40 dark:border-rose-800/50";
  }
  if (accuracy < 50) {
    return "text-orange-700 bg-orange-100 border border-orange-200 dark:text-orange-200 dark:bg-orange-900/40 dark:border-orange-800/50";
  }
  if (accuracy < 75) {
    return "text-amber-700 bg-amber-100 border border-amber-200 dark:text-amber-200 dark:bg-amber-900/40 dark:border-amber-800/50";
  }
  // 75~99% は 100 未満にまとめる（99.5% もここ）
  if (accuracy < 100) {
    return "text-sky-700 bg-sky-100 border border-sky-200 dark:text-sky-200 dark:bg-sky-900/40 dark:border-sky-800/50";
  }
  return "text-violet-700 bg-violet-100 border border-violet-200 dark:text-violet-200 dark:bg-violet-900/40 dark:border-violet-800/50";
};
