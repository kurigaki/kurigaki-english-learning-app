"use client";

import { useState } from "react";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { PartOfSpeech, PronunciationData, PronunciationVariant } from "@/types";

type WordHeaderProps = {
  word: string;
  meaning: string;
  pronunciation?: string | PronunciationData;
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

// 発音記号を取得する関数
function getPronunciationText(
  pronunciation: string | PronunciationData | undefined,
  variant: PronunciationVariant
): string | null {
  if (!pronunciation) return null;

  if (typeof pronunciation === "string") {
    return pronunciation;
  }

  // PronunciationDataオブジェクトの場合
  if (variant === "uk" && pronunciation.uk) {
    return pronunciation.uk;
  }
  return pronunciation.us;
}

// UK発音があるかどうか判定
function hasUkPronunciation(pronunciation: string | PronunciationData | undefined): boolean {
  if (!pronunciation) return false;
  if (typeof pronunciation === "string") return false;
  return !!pronunciation.uk;
}

export const WordHeader = ({
  word,
  meaning,
  pronunciation,
  partOfSpeech,
}: WordHeaderProps) => {
  const [variant, setVariant] = useState<PronunciationVariant>("us");
  const showVariantToggle = hasUkPronunciation(pronunciation);
  const pronunciationText = getPronunciationText(pronunciation, variant);

  return (
    <div className="text-center pb-6 border-b border-gray-100">
      {/* 単語 */}
      <div className="flex items-center justify-center gap-3 mb-2">
        <h1 className="text-4xl font-bold text-gradient">{word}</h1>
      </div>

      {/* UK/US切り替えトグルと発音ボタン */}
      <div className="flex items-center justify-center gap-3 mb-4">
        {showVariantToggle && (
          <div className="flex rounded-full bg-slate-100 p-1">
            <button
              onClick={() => setVariant("us")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                variant === "us"
                  ? "bg-primary-500 text-white"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              US
            </button>
            <button
              onClick={() => setVariant("uk")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                variant === "uk"
                  ? "bg-primary-500 text-white"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              UK
            </button>
          </div>
        )}
        <SpeakButton
          text={word}
          size="lg"
          variant={showVariantToggle ? variant : undefined}
        />
      </div>

      {/* 発音記号・品詞 */}
      <div className="flex items-center justify-center gap-2 text-slate-500 mb-4">
        {pronunciationText && (
          <span className="text-lg">{pronunciationText}</span>
        )}
        {pronunciationText && partOfSpeech && <span>·</span>}
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
