import { WordColumn as WordColumnType } from "@/types";
import { WordText } from "./WordText";

type WordColumnProps = {
  column?: WordColumnType;
  currentWord: string;
};

export const WordColumn = ({ column, currentWord }: WordColumnProps) => {
  const hasColumn = !!column;

  return (
    <div className="py-4 border-b border-gray-100 dark:border-gray-700">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <span className="emoji-icon">📚</span>
          <span>{hasColumn ? `コラム：${column.title}` : "コラム"}</span>
        </h3>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full ${
            hasColumn
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
              : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
          }`}
        >
          {hasColumn ? "登録済み" : "準備中"}
        </span>
      </div>
      {hasColumn ? (
        <p className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
          <WordText text={column.content} currentWord={currentWord} />
        </p>
      ) : (
        <p className="text-slate-400 dark:text-slate-500 text-sm italic">
          この単語のコラムは今後追加予定です
        </p>
      )}
    </div>
  );
};
