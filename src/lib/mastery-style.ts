import type { ManualMasteryLevel } from "@/lib/storage";

export const getMasteryBadgeClass = (level: ManualMasteryLevel): string => {
  switch (level) {
    case "remembered":
      return "text-cyan-700 bg-cyan-100 border border-cyan-200 dark:text-cyan-200 dark:bg-cyan-900/40 dark:border-cyan-800/50";
    case "almost":
      return "text-lime-700 bg-lime-100 border border-lime-200 dark:text-lime-200 dark:bg-lime-900/40 dark:border-lime-800/50";
    case "vague":
      return "text-yellow-700 bg-yellow-100 border border-yellow-200 dark:text-yellow-200 dark:bg-yellow-900/40 dark:border-yellow-800/50";
    case "weak":
      return "text-red-700 bg-red-100 border border-red-200 dark:text-red-200 dark:bg-red-900/40 dark:border-red-800/50";
    case "unlearned":
    default:
      return "text-slate-700 bg-slate-200 border border-slate-300 dark:text-slate-200 dark:bg-slate-800/70 dark:border-slate-700";
  }
};
