"use client";

import { SpeakButton } from "@/components/ui/SpeakButton";
import { WordExample } from "@/types";

type WordExamplesProps = {
  examples: WordExample[];
  targetWord: string;
};

export const WordExamples = ({ examples, targetWord }: WordExamplesProps) => {
  if (examples.length === 0) {
    return null;
  }

  // 対象単語をハイライトする
  const highlightWord = (sentence: string, word: string) => {
    const regex = new RegExp(`\\b(${word})\\b`, "gi");
    const parts = sentence.split(regex);

    return parts.map((part, index) => {
      if (part.toLowerCase() === word.toLowerCase()) {
        return (
          <span key={index} className="font-bold text-primary-600 bg-primary-50 px-1 rounded">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="py-6 border-b border-gray-100">
      <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
        <span>📝</span> 例文
      </h2>
      <div className="space-y-4">
        {examples.map((example, index) => (
          <div
            key={index}
            className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-100"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                {/* 英語例文 */}
                <p className="text-lg text-slate-800 leading-relaxed mb-2">
                  {highlightWord(example.en, targetWord)}
                </p>
                {/* 日本語訳 */}
                <p className="text-slate-500">{example.ja}</p>
                {/* 使用シーン */}
                {example.context && (
                  <span className="inline-block mt-2 text-xs bg-accent-100 text-accent-700 px-2 py-0.5 rounded-full">
                    {example.context}
                  </span>
                )}
              </div>
              {/* 音声再生ボタン */}
              <SpeakButton text={example.en} type="sentence" size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
