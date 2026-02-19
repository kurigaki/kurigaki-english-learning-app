"use client";

type WordPlaceholderSectionProps = {
  title: string;
  emoji: string;
  content?: string;
  placeholder?: string;
};

export const WordPlaceholderSection = ({
  title,
  emoji,
  content,
  placeholder = "今後追加予定",
}: WordPlaceholderSectionProps) => {
  const hasContent = content && content.trim().length > 0;

  return (
    <div className="py-4 border-b border-gray-100 dark:border-gray-700">
      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
        <span className="emoji-icon">{emoji}</span>
        <span>{title}</span>
      </h3>
      {hasContent ? (
        <p className="text-slate-700 dark:text-slate-200 leading-relaxed">{content}</p>
      ) : (
        <p className="text-slate-400 dark:text-slate-500 text-sm italic">{placeholder}</p>
      )}
    </div>
  );
};
