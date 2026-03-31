"use client";

import { useState } from "react";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { PartOfSpeech, PronunciationData, PronunciationVariant } from "@/types";
import { WordMeaningByPos, getPosLabel } from "@/lib/word-lookup";

type WordHeaderProps = {
  word: string;
  meaning: string;
  pronunciation?: string | PronunciationData;
  partOfSpeech?: PartOfSpeech;
  /** 他品詞のmeaning一覧（単語詳細画面で複数品詞を表示するため） */
  otherMeanings?: WordMeaningByPos[];
};

const partOfSpeechLabels: Record<PartOfSpeech, string> = {
  noun: "名詞",
  verb: "動詞",
  adjective: "形容詞",
  adverb: "副詞",
  other: "その他",
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
  otherMeanings,
}: WordHeaderProps) => {
  const [variant, setVariant] = useState<PronunciationVariant>("us");
  const showVariantToggle = hasUkPronunciation(pronunciation);
  const pronunciationText = getPronunciationText(pronunciation, variant);

  return (
    <div className="text-center pb-6 border-b border-slate-100 dark:border-slate-700">
      {/* 単語 */}
      <div className="flex items-center justify-center gap-3 mb-2">
        <h1 className="text-4xl font-bold text-gradient">{word}</h1>
      </div>

      {/* UK/US切り替えトグルと発音ボタン */}
      <div className="flex items-center justify-center gap-3 mb-4">
        {showVariantToggle && (
          <div className="flex rounded-full bg-slate-100 dark:bg-slate-700 p-1">
            <button
              onClick={() => setVariant("us")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                variant === "us"
                  ? "bg-primary-500 text-white"
                  : "text-slate-600 hover:text-slate-800 dark:text-slate-100"
              }`}
            >
              US
            </button>
            <button
              onClick={() => setVariant("uk")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                variant === "uk"
                  ? "bg-primary-500 text-white"
                  : "text-slate-600 hover:text-slate-800 dark:text-slate-100"
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
      <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 mb-4">
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
      <div className="space-y-1">
        <p className="text-2xl font-medium text-slate-800 dark:text-slate-100">
          {partOfSpeech && <span className="text-base text-slate-400 dark:text-slate-500 mr-1">({getPosLabel(partOfSpeech)})</span>}
          {meaning}
        </p>
        {otherMeanings && otherMeanings.length > 0 && (
          <div className="space-y-0.5">
            {otherMeanings.map((m) => (
              <p key={m.partOfSpeech} className="text-base text-slate-500 dark:text-slate-400">
                <span className="text-slate-400 dark:text-slate-500">({getPosLabel(m.partOfSpeech)})</span>
                {m.meaning}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
