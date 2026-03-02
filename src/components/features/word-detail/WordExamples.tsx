"use client";

import { SpeakButton } from "@/components/ui/SpeakButton";
import { WordExample } from "@/types";
import { WordText } from "./WordText";

type WordExamplesProps = {
  examples: WordExample[];
  currentWord: string;
};

export const WordExamples = ({ examples, currentWord }: WordExamplesProps) => {
  if (examples.length === 0) {
    return null;
  }

  return (
    <div className="py-6 border-b border-slate-100 dark:border-slate-700">
      <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
        <span className="emoji-icon">📝</span>
        <span>例文</span>
      </h2>
      <div className="space-y-4">
        {examples.map((example, index) => (
          <div
            key={index}
            className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700 p-4 rounded-xl border border-slate-100 dark:border-slate-700"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                {/* 英語例文 */}
                <p className="text-lg text-slate-800 dark:text-slate-100 leading-relaxed mb-2">
                  <WordText text={example.en} currentWord={currentWord} />
                </p>
                {/* 日本語訳 */}
                <p className="text-slate-500 dark:text-slate-400">{example.ja}</p>
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
