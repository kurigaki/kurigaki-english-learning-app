import { WordText } from "./WordText";

type WordPlaceholderSectionProps = {
  title: string;
  emoji: string;
  content?: string | string[];
  placeholder?: string;
  currentWord: string;
};

export const WordPlaceholderSection = ({
  title,
  emoji,
  content,
  placeholder = "今後追加予定",
  currentWord,
}: WordPlaceholderSectionProps) => {
  const hasContent = Array.isArray(content)
    ? content.length > 0
    : content && content.trim().length > 0;

  return (
    <div className="py-4 border-b border-gray-100 dark:border-gray-700">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <span className="emoji-icon">{emoji}</span>
          <span>{title}</span>
        </h3>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full ${
            hasContent
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
              : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
          }`}
        >
          {hasContent ? "登録済み" : "準備中"}
        </span>
      </div>
      {hasContent ? (
        Array.isArray(content) ? (
          <ol className="list-decimal list-inside space-y-2">
            {content.map((item, i) => (
              <li key={i} className="text-slate-700 dark:text-slate-200 leading-relaxed">
                <WordText text={item} currentWord={currentWord} />
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
            <WordText text={content as string} currentWord={currentWord} />
          </p>
        )
      ) : (
        <p className="text-slate-400 dark:text-slate-500 text-sm italic">{placeholder}</p>
      )}
    </div>
  );
};
