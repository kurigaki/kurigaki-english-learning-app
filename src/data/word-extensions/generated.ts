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

// 品詞別の接尾辞重複を防ぐヘルパー
function verbForm(m: string): string {
  // 「走る」「食べる」→ そのまま（既に動詞終止形）
  // 「〜する」「〜を見る」→ そのまま
  if (/[るすくぐむぬぶつう]$/.test(m)) return m;
  // 「管理」「確認」→ 「管理する」
  return `${m}する`;
}

function adjForm(m: string): string {
  // 「幸せな」「大きい」→ そのまま
  if (/[ないいしきくぐすずつづぬぶむるう]$/.test(m)) return m;
  // 「幸せ」「重要」→ 「幸せな」
  return `${m}な`;
}

function advForm(m: string): string {
  if (/に$/.test(m)) return m;
  return `${m}に`;
}

function buildCoreImage(word: ExtensionSourceWord): string {
  const m = pickPrimaryMeaning(word.meaning);
  switch (word.partOfSpeech) {
    case "noun":
      return `「${m}」という概念・対象をひとまとまりで捉えるのがコアイメージ。文脈によって具体物にも抽象概念にも広がる。`;
    case "verb":
      return `「${verbForm(m)}」という動き・変化を起こすのがコアイメージ。誰が何にどう作用するかを意識すると定着しやすい。`;
    case "adjective":
      return `「${adjForm(m)}状態」として名詞の性質を描写するのがコアイメージ。対象の特徴・評価を短く示せる。`;
    case "adverb":
      return `「${advForm(m)}」という様子や程度を補い、動詞・形容詞・文全体にかかるのがコアイメージ。`;
    default:
      return `文脈に応じて「${m}」の機能を担う語。定型表現の中で意味をまとめて覚えると使いやすい。`;
  }
}

/**
 * 同じwordで異なる品詞のmeaningを取得する（他品詞の補足表示用）
 */
function getOtherPosMeanings(word: ExtensionSourceWord): string {
  const others = ALL_SOURCE_WORDS.filter(
    (w) => w.word.toLowerCase() === word.word.toLowerCase() && w.partOfSpeech !== word.partOfSpeech
  );
  if (others.length === 0) return "";
  const seen = new Set<string>();
  const parts: string[] = [];
  for (const o of others) {
    const key = o.partOfSpeech;
    if (seen.has(key)) continue;
    seen.add(key);
    const label = PART_OF_SPEECH_LABEL[o.partOfSpeech] || o.partOfSpeech;
    parts.push(`${label}では「${pickPrimaryMeaning(o.meaning)}」`);
  }
  return parts.length > 0 ? `\n\n※ ${word.word} は${parts.join("、")}の意味もある。` : "";
}

function buildUsage(word: ExtensionSourceWord): string {
  const m = pickPrimaryMeaning(word.meaning);
  const otherPos = getOtherPosMeanings(word);
  let base: string;
  switch (word.partOfSpeech) {
    case "noun":
      base = `「a/the ${word.word}」「${word.word} + of ...」の形で使われることが多い。意味は「${m}」で、可算・不可算や前置詞との相性を例文で確認すると実用性が上がる。`;
      break;
    case "verb":
      base = `「${word.word} + 名詞」「${word.word} + to do / that ...」などで使う。意味「${verbForm(m)}」が誰に何を及ぼすかを例文単位で覚えるのが効果的。`;
      break;
    case "adjective":
      base = `「${word.word} + 名詞」「be動詞 + ${word.word}」で使う。意味「${adjForm(m)}」を、対象や場面とセットで覚えると定着しやすい。`;
      break;
    case "adverb":
      base = `主に「動詞 + ${word.word}」「${word.word}, 文」の形で使う。意味「${advForm(m)}」がどの語を修飾するかを意識すると誤用を防げる。`;
      break;
    default:
      base = `会話・定型表現の中で使われることが多い語。意味「${m}」を単体ではなくフレーズごと覚えると運用しやすい。`;
      break;
  }
  return base + otherPos;
}

function buildSynonymDifference(word: ExtensionSourceWord): string {
  const m = pickPrimaryMeaning(word.meaning);
  return `${word.word} は「${m}」を表すが、似た語との違いは「語調（フォーマル/カジュアル）」「適用場面」「文型」で現れる。例文で置換比較し、自然に言える組み合わせを優先して覚える。`;
}

function buildEnglishDefinition(word: ExtensionSourceWord): string {
  // 英英定義には英単語のみ使用（日本語混入を防止）
  switch (word.partOfSpeech) {
    case "noun":
      return `A thing, concept, or entity referred to as "${word.word}".`;
    case "verb":
      return `To perform the action expressed by "${word.word}".`;
    case "adjective":
      return `Describing a quality or state expressed by "${word.word}".`;
    case "adverb":
      return `In a manner expressed by "${word.word}".`;
    default:
      return `A word or expression: "${word.word}".`;
  }
}

function buildEtymology(word: ExtensionSourceWord): string {
  return `${word.word} の詳しい語源は主要英英辞典（OED, Merriam-Webster 等）で確認できます。接頭辞・接尾辞・語根の分解を意識すると、類似語の意味推測にも役立ちます。`;
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
            ja: `私は毎日${verbForm(m)}ようにしています。`,
            context: "学習",
          },
          {
            en: `She can ${word.word} this task well.`,
            ja: `彼女はこの課題をうまく${verbForm(m)}ことができます。`,
            context: "実践",
          },
        ]
      : word.partOfSpeech === "adjective"
        ? [
            {
              en: `The result was ${word.word}.`,
              ja: `その結果は${adjForm(m)}状態でした。`,
              context: "説明",
            },
            {
              en: `It seems ${word.word} to me.`,
              ja: `私にはそれが${adjForm(m)}ように見えます。`,
              context: "判断",
            },
          ]
        : word.partOfSpeech === "adverb"
          ? [
              {
                en: `He answered ${word.word} in class.`,
                ja: `彼は授業で${advForm(m)}答えました。`,
                context: "授業",
              },
              {
                en: `We moved ${word.word} to finish on time.`,
                ja: `私たちは時間内に終えるため${advForm(m)}動きました。`,
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

