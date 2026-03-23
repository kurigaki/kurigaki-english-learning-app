/**
 * 単語拡張データ — 統合エントリポイント
 *
 * 手書きデータ(manual.ts) を Map に統合し、
 * 自動補完エンジン(generated.ts) でフォールバックを提供する。
 */
import type { WordExtension } from "@/types";
import { handwrittenExtensions } from "./manual";
import {
  buildGeneratedExtension,
  buildGeneratedExamples,
  buildGeneratedRelatedWordEntries,
  buildGeneratedSynonymDifferenceEntries,
  buildGeneratedColumn,
  pickPrimaryMeaning,
  wordBySurface,
  PART_OF_SPEECH_LABEL,
  type ExtensionSourceWord,
} from "./generated";

export const wordExtensions: Map<number, WordExtension> = new Map([
  ...handwrittenExtensions,
]);

/**
 * 既存の手動拡張を優先し、不足フィールドのみ自動補完する。
 * 単語詳細画面で全語に5セクションを表示できるようにするための統一アクセサ。
 */
export function getWordExtension(word: ExtensionSourceWord): WordExtension {
  const manual = wordExtensions.get(word.id);
  const generated = buildGeneratedExtension(word);
  const generatedExamples = buildGeneratedExamples(word);
  const generatedRelatedEntries = buildGeneratedRelatedWordEntries(word);
  const generatedSynonymEntries = buildGeneratedSynonymDifferenceEntries(
    word,
    generatedRelatedEntries
  );
  const generatedColumn = buildGeneratedColumn(word, generated);

  const manualRelatedEntries =
    manual?.relatedWordEntries ??
    (manual?.relatedWords?.map((rw) => {
      const matched = wordBySurface.get(rw.toLowerCase());
      return {
        word: rw,
        partOfSpeech: matched
          ? PART_OF_SPEECH_LABEL[matched.partOfSpeech]
          : "他",
        meaning: matched ? pickPrimaryMeaning(matched.meaning) : "関連語",
      };
    }) ?? []);

  const mergedRelatedEntries =
    manualRelatedEntries.length > 0
      ? manualRelatedEntries
      : generatedRelatedEntries;

  return {
    coreImage: manual?.coreImage ?? generated.coreImage,
    usage: manual?.usage ?? generated.usage,
    synonymDifference:
      manual?.synonymDifference ?? generated.synonymDifference,
    englishDefinition:
      manual?.englishDefinition ?? generated.englishDefinition,
    etymology: manual?.etymology ?? generated.etymology,
    examples: manual?.examples ?? generatedExamples,
    relatedWords:
      manual?.relatedWords ?? mergedRelatedEntries.map((entry) => entry.word),
    relatedWordEntries: mergedRelatedEntries,
    pronunciation: manual?.pronunciation,
    synonyms:
      manual?.synonyms ??
      (manual?.synonymDifferenceEntries?.map((entry) => entry.word) ??
        generatedSynonymEntries.map((entry) => entry.word)),
    antonyms: manual?.antonyms,
    column: manual?.column ?? generatedColumn,
    synonymDifferenceEntries:
      manual?.synonymDifferenceEntries ?? generatedSynonymEntries,
  };
}

export type { ExtensionSourceWord };
