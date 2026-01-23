"use client";

import { SpeakButton } from "@/components/ui/SpeakButton";
import { PartOfSpeech } from "@/types";

type WordHeaderProps = {
  word: string;
  meaning: string;
  pronunciation?: string;
  partOfSpeech?: PartOfSpeech;
};

const partOfSpeechLabels: Record<PartOfSpeech, string> = {
  noun: "名詞",
  verb: "動詞",
  adjective: "形容詞",
  adverb: "副詞",
  preposition: "前置詞",
  conjunction: "接続詞",
  pronoun: "代名詞",
  interjection: "間投詞",
};

export const WordHeader = ({
  word,
  meaning,
  pronunciation,
  partOfSpeech,
}: WordHeaderProps) => {
  return (
    <div className="text-center pb-6 border-b border-gray-100">
      {/* 単語 */}
      <div className="flex items-center justify-center gap-3 mb-2">
        <h1 className="text-4xl font-bold text-gradient">{word}</h1>
        <SpeakButton text={word} size="lg" />
      </div>

      {/* 発音記号・品詞 */}
      <div className="flex items-center justify-center gap-2 text-slate-500 mb-4">
        {pronunciation && (
          <span className="text-lg">{pronunciation}</span>
        )}
        {pronunciation && partOfSpeech && <span>·</span>}
        {partOfSpeech && (
          <span className="text-sm bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
            {partOfSpeechLabels[partOfSpeech]}
          </span>
        )}
      </div>

      {/* 意味 */}
      <p className="text-2xl font-medium text-slate-800">{meaning}</p>
    </div>
  );
};
