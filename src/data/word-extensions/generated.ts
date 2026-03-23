/**
 * 単語拡張データの自動補完エンジン
 * 手書きデータがない単語に対して、品詞・意味・コースから自動生成する
 */
import type { WordExtension } from "@/types";
import type { Word } from "../words/types";
import { allWords } from "../words";

export type ExtensionSourceWord = Pick<
  Word,
  "id" | "word" | "meaning" | "partOfSpeech" | "course" | "stage" | "example" | "exampleJa"
>;


const ALL_SOURCE_WORDS: ExtensionSourceWord[] = allWords;

const COURSE_CONTEXT_LABEL: Record<ExtensionSourceWord["course"], string> = {
  junior: "中学英語",
  senior: "高校英語",
  toeic: "ビジネス",
  eiken: "英検",
  conversation: "会話",
  general: "一般",
  business: "ビジネス",
};

const PART_OF_SPEECH_LABEL: Record<ExtensionSourceWord["partOfSpeech"], string> = {
  noun: "名",
  verb: "動",
  adjective: "形",
  adverb: "副",
  other: "他",
};

const wordsBySurface = new Map<string, ExtensionSourceWord[]>();
const wordsByPrimaryMeaning = new Map<string, ExtensionSourceWord[]>();
const wordBySurface = new Map<string, ExtensionSourceWord>();

for (const w of ALL_SOURCE_WORDS) {
  const key = w.word.toLowerCase();
  const meaningKey = pickPrimaryMeaning(w.meaning).toLowerCase();
  if (!wordsBySurface.has(key)) wordsBySurface.set(key, []);
  wordsBySurface.get(key)!.push(w);
  if (!wordsByPrimaryMeaning.has(meaningKey)) wordsByPrimaryMeaning.set(meaningKey, []);
  wordsByPrimaryMeaning.get(meaningKey)!.push(w);
  if (!wordBySurface.has(key)) wordBySurface.set(key, w);
}

function pickPrimaryMeaning(meaning: string): string {
  const primary = meaning
    .split(/[;；、,\/]/)
    .map((s) => s.trim())
    .find(Boolean);
  return primary || meaning.trim();
}

function buildCoreImage(word: ExtensionSourceWord): string {
  const m = pickPrimaryMeaning(word.meaning);
  switch (word.partOfSpeech) {
    case "noun":
      return `「${m}」という概念・対象をひとまとまりで捉えるのがコアイメージ。文脈によって具体物にも抽象概念にも広がる。`;
    case "verb":
      return `「${m}する」という動き・変化を起こすのがコアイメージ。誰が何にどう作用するかを意識すると定着しやすい。`;
    case "adjective":
      return `名詞の性質を「${m}な状態」として描写するのがコアイメージ。対象の特徴・評価を短く示せる。`;
    case "adverb":
      return `動詞・形容詞・文全体にかかって「${m}に」という様子や程度を補うのがコアイメージ。`;
    default:
      return `文脈に応じて「${m}」の機能を担う語。定型表現の中で意味をまとめて覚えると使いやすい。`;
  }
}

function buildUsage(word: ExtensionSourceWord): string {
  const m = pickPrimaryMeaning(word.meaning);
  switch (word.partOfSpeech) {
    case "noun":
      return `「a/the ${word.word}」「${word.word} + of ...」の形で使われることが多い。意味は「${m}」で、可算・不可算や前置詞との相性を例文で確認すると実用性が上がる。`;
    case "verb":
      return `「${word.word} + 名詞」「${word.word} + to do / that ...」などで使う。意味「${m}する」が誰に何を及ぼすかを例文単位で覚えるのが効果的。`;
    case "adjective":
      return `「${word.word} + 名詞」「be動詞 + ${word.word}」で使う。意味「${m}な」を、対象や場面とセットで覚えると定着しやすい。`;
    case "adverb":
      return `主に「動詞 + ${word.word}」「${word.word}, 文」の形で使う。意味「${m}に」がどの語を修飾するかを意識すると誤用を防げる。`;
    default:
      return `会話・定型表現の中で使われることが多い語。意味「${m}」を単体ではなくフレーズごと覚えると運用しやすい。`;
  }
}

function buildSynonymDifference(word: ExtensionSourceWord): string {
  const m = pickPrimaryMeaning(word.meaning);
  return `${word.word} は「${m}」を表すが、似た語との違いは「語調（フォーマル/カジュアル）」「適用場面」「文型」で現れる。例文で置換比較し、自然に言える組み合わせを優先して覚える。`;
}

function buildEnglishDefinition(word: ExtensionSourceWord): string {
  const m = pickPrimaryMeaning(word.meaning);
  switch (word.partOfSpeech) {
    case "noun":
      return `A noun used to refer to “${m}”, depending on context.`;
    case "verb":
      return `A verb meaning “to ${m}” in context.`;
    case "adjective":
      return `An adjective used to describe something as “${m}”.`;
    case "adverb":
      return `An adverb that modifies verbs/adjectives with the sense of “${m}”.`;
    default:
      return `A word or expression used with the sense of “${m}”, depending on context.`;
  }
}

function buildEtymology(word: ExtensionSourceWord): string {
  return `語源は辞書によって説明が異なるため、主要英英辞典（OED, Merriam-Webster, Collins など）で ${word.word} の語形成（接頭辞・接尾辞・語根）を照合して確認するのが確実。`;
}

function buildGeneratedExtension(word: ExtensionSourceWord): WordExtension {
  return {
    coreImage: buildCoreImage(word),
    usage: buildUsage(word),
    synonymDifference: buildSynonymDifference(word),
    englishDefinition: buildEnglishDefinition(word),
    etymology: buildEtymology(word),
  };
}

function buildGeneratedExamples(word: ExtensionSourceWord): NonNullable<WordExtension["examples"]> {
  const examples: NonNullable<WordExtension["examples"]> = [];

  const seen = new Set<string>();
  const push = (en: string | undefined, ja: string | undefined, context: string) => {
    if (!en) return;
    const normalized = en.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    examples.push({
      en,
      ja: ja ?? "",
      context,
    });
  };

  const sameSurface = wordsBySurface.get(word.word.toLowerCase()) ?? [];
  for (const candidate of sameSurface) {
    if (examples.length >= 3) break;
    push(
      candidate.example,
      candidate.exampleJa,
      COURSE_CONTEXT_LABEL[candidate.course]
    );
  }

  if (examples.length < 3 && word.example) {
    push(word.example, word.exampleJa, COURSE_CONTEXT_LABEL[word.course]);
  }

  const m = pickPrimaryMeaning(word.meaning);
  const fallbackByPos: Array<{ en: string; ja: string; context: string }> =
    word.partOfSpeech === "verb"
      ? [
          {
            en: `I try to ${word.word} every day.`,
            ja: `私は毎日${m}ようにしています。`,
            context: "学習",
          },
          {
            en: `She can ${word.word} this task well.`,
            ja: `彼女はこの課題をうまく${m}ことができます。`,
            context: "実践",
          },
        ]
      : word.partOfSpeech === "adjective"
        ? [
            {
              en: `The result was ${word.word}.`,
              ja: `その結果は${m}状態でした。`,
              context: "説明",
            },
            {
              en: `It seems ${word.word} to me.`,
              ja: `私にはそれが${m}ように見えます。`,
              context: "判断",
            },
          ]
        : word.partOfSpeech === "adverb"
          ? [
              {
                en: `He answered ${word.word} in class.`,
                ja: `彼は授業で${m}答えました。`,
                context: "授業",
              },
              {
                en: `We moved ${word.word} to finish on time.`,
                ja: `私たちは時間内に終えるため${m}動きました。`,
                context: "行動",
              },
            ]
          : word.partOfSpeech === "noun"
            ? [
                {
                  en: `This ${word.word} is important for daily communication.`,
                  ja: `この${m}は日常のコミュニケーションで重要です。`,
                  context: "日常",
                },
                {
                  en: `We discussed the ${word.word} in today's lesson.`,
                  ja: `私たちは今日の授業でこの${m}について話し合いました。`,
                  context: "授業",
                },
              ]
            : [
                {
                  en: `We often use "${word.word}" in conversation.`,
                  ja: `私たちは会話で「${word.word}」をよく使います。`,
                  context: "会話",
                },
                {
                  en: `Please learn how to use "${word.word}" naturally.`,
                  ja: `「${word.word}」を自然に使えるように学習してください。`,
                  context: "学習",
                },
              ];

  for (const f of fallbackByPos) {
    if (examples.length >= 3) break;
    push(f.en, f.ja, f.context);
  }

  return examples.slice(0, 3);
}

function buildGeneratedRelatedWordEntries(
  word: ExtensionSourceWord
): NonNullable<WordExtension["relatedWordEntries"]> {
  const entries: NonNullable<WordExtension["relatedWordEntries"]> = [];
  const seen = new Set<string>([word.word.toLowerCase()]);
  const push = (candidate: ExtensionSourceWord, isAntonym = false) => {
    const key = candidate.word.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    entries.push({
      word: candidate.word,
      partOfSpeech: PART_OF_SPEECH_LABEL[candidate.partOfSpeech],
      meaning: pickPrimaryMeaning(candidate.meaning),
      isAntonym,
    });
  };

  const meaningKey = pickPrimaryMeaning(word.meaning).toLowerCase();
  const sameMeaning = wordsByPrimaryMeaning.get(meaningKey) ?? [];
  for (const candidate of sameMeaning) {
    if (entries.length >= 4) break;
    push(candidate);
  }

  if (entries.length < 4) {
    const sameCoursePos = ALL_SOURCE_WORDS.filter(
      (w) =>
        w.course === word.course &&
        w.partOfSpeech === word.partOfSpeech &&
        w.id !== word.id
    );
    for (const candidate of sameCoursePos) {
      if (entries.length >= 4) break;
      push(candidate);
    }
  }

  return entries.slice(0, 4);
}

function buildGeneratedSynonymDifferenceEntries(
  word: ExtensionSourceWord,
  relatedEntries: NonNullable<WordExtension["relatedWordEntries"]>
): NonNullable<WordExtension["synonymDifferenceEntries"]> {
  return relatedEntries
    .filter((e) => !e.isAntonym)
    .slice(0, 3)
    .map((e) => ({
      word: e.word,
      description:
        `${e.word} は ${word.word} と近い意味で使われるが、文脈・語調・一緒に使う語の組み合わせが異なる。` +
        `例文で置き換えて自然さを確認するのが効果的。`,
    }));
}

function buildGeneratedColumn(
  word: ExtensionSourceWord,
  generated: WordExtension
): NonNullable<WordExtension["column"]> {
  return {
    title: `${word.word} の使い分けメモ`,
    content:
      `${generated.coreImage}\n\n` +
      `${generated.usage}\n\n` +
      `学習のポイント: ${word.word} は品詞と文型を固定して反復すると定着しやすい。` +
      `関連語との違いは例文単位で比較して確認する。`,
  };
}

// 以下の関数はindex.tsのgetWordExtension()から呼ばれる
export {
  buildGeneratedExtension,
  buildGeneratedExamples,
  buildGeneratedRelatedWordEntries,
  buildGeneratedSynonymDifferenceEntries,
  buildGeneratedColumn,
  pickPrimaryMeaning,
  wordBySurface,
  PART_OF_SPEECH_LABEL,
};

