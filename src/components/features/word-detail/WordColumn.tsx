import { WordColumn as WordColumnType } from "@/types";

type WordColumnProps = {
  column: WordColumnType;
};

export const WordColumn = ({ column }: WordColumnProps) => {
  return (
    <div className="py-4 border-b border-gray-100 dark:border-gray-700">
      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
        <span className="emoji-icon">📚</span>
        <span>コラム：{column.title}</span>
      </h3>
      <p className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
        {column.content}
      </p>
    </div>
  );
};
