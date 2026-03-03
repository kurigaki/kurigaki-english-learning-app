"use client";

import Link from "next/link";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { WordExample } from "@/types";
import { findWordId } from "@/lib/word-lookup";

type WordExamplesProps = {
  examples: WordExample[];
  currentWord: string;
};

export const WordExamples = ({ examples, currentWord }: WordExamplesProps) => {
  if (examples.length === 0) {
    return null;
  }

  const escapeRegExp = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const renderSegmentWithLinks = (text: string, keyPrefix: string) => {
    const tokenRegex = /([a-zA-Z]+(?:'[a-zA-Z]+)*)|([^a-zA-Z]+)/g;
    const nodes: React.ReactNode[] = [];
    let m: RegExpExecArray | null;
    let i = 0;
    tokenRegex.lastIndex = 0;

    while ((m = tokenRegex.exec(text)) !== null) {
      const englishToken = m[1];
      const otherToken = m[2];
      if (englishToken !== undefined) {
        const wordId = findWordId(englishToken);
        if (wordId !== null) {
          nodes.push(
            <Link
              key={`${keyPrefix}-link-${i}`}
              href={`/word/${wordId}`}
              className="border-b border-dashed border-slate-500 dark:border-slate-400 hover:opacity-70 transition-opacity"
            >
              {englishToken}
            </Link>
          );
        } else {
          nodes.push(<span key={`${keyPrefix}-text-${i}`}>{englishToken}</span>);
        }
      } else {
        nodes.push(<span key={`${keyPrefix}-sep-${i}`}>{otherToken}</span>);
      }
      i++;
    }
    return nodes;
  };

  // 例文専用: currentWord を強調し、currentWord に含まれる部分語はリンク化しない
  const renderExampleSentence = (sentence: string, targetWord: string) => {
    const normalizedTarget = targetWord.trim();
    if (!normalizedTarget) return sentence;

    const regex = new RegExp(escapeRegExp(normalizedTarget), "gi");
    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let blockIndex = 0;
    regex.lastIndex = 0;

    while ((match = regex.exec(sentence)) !== null) {
      const start = match.index;
      const end = start + match[0].length;

      if (start > lastIndex) {
        const before = sentence.slice(lastIndex, start);
        nodes.push(...renderSegmentWithLinks(before, `before-${blockIndex}`));
      }

      nodes.push(
        <span
          key={`target-${blockIndex}`}
          className="font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 px-1 rounded"
        >
          {sentence.slice(start, end)}
        </span>
      );

      lastIndex = end;
      blockIndex++;
    }

    if (lastIndex < sentence.length) {
      const tail = sentence.slice(lastIndex);
      nodes.push(...renderSegmentWithLinks(tail, "tail"));
    }

    return nodes.length > 0 ? nodes : renderSegmentWithLinks(sentence, "full");
  };

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
                  {renderExampleSentence(example.en, currentWord)}
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
