import type { SynonymDifferenceEntry } from "@/types";

type WordSynonymDiffProps = {
  entries: SynonymDifferenceEntry[];
};

export const WordSynonymDiff = ({ entries }: WordSynonymDiffProps) => {
  if (entries.length === 0) return null;

  return (
    <div className="py-4 border-b border-gray-100 dark:border-gray-700">
      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
        <span className="emoji-icon">🔍</span>
        <span>類義語との違い</span>
      </h3>
      <ul className="space-y-2">
        {entries.map((entry, index) => (
          <li key={`${entry.word}-${index}`} className="text-sm leading-relaxed">
            <span className="font-medium text-slate-700 dark:text-slate-200">{entry.word}</span>
            <span className="text-slate-400 dark:text-slate-500 mx-1">:</span>
            <span className="text-slate-600 dark:text-slate-300">{entry.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
