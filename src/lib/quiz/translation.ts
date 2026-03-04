import { words } from "@/data/words/compat";

// 例文の日本語訳と単語の意味を取得
export type TranslationInfo = {
  sentenceJa: string | null; // 例文の日本語訳
  wordMeaning: string;       // 単語の意味
};

const SUBJECT_JA_MAP: Record<string, string> = {
  i: "私は",
  you: "あなたは",
  he: "彼は",
  she: "彼女は",
  we: "私たちは",
  they: "彼らは",
};

const VERB_FORMS_JA_MAP: Record<string, { masu: string; te: string }> = {
  eat: { masu: "食べます", te: "食べて" },
  drink: { masu: "飲みます", te: "飲んで" },
  read: { masu: "読みます", te: "読んで" },
  write: { masu: "書きます", te: "書いて" },
  play: { masu: "します", te: "して" },
  study: { masu: "勉強します", te: "勉強して" },
  use: { masu: "使います", te: "使って" },
  make: { masu: "作ります", te: "作って" },
  go: { masu: "行きます", te: "行って" },
  come: { masu: "来ます", te: "来て" },
  have: { masu: "持っています", te: "持って" },
  know: { masu: "知っています", te: "知って" },
  see: { masu: "見ます", te: "見て" },
  watch: { masu: "見ます", te: "見て" },
  buy: { masu: "買います", te: "買って" },
  carry: { masu: "運びます", te: "運んで" },
  open: { masu: "開けます", te: "開けて" },
  close: { masu: "閉めます", te: "閉めて" },
  help: { masu: "手伝います", te: "手伝って" },
  give: { masu: "くれます", te: "くれて" },
  take: { masu: "取ります", te: "取って" },
  put: { masu: "置きます", te: "置いて" },
  call: { masu: "電話します", te: "電話して" },
  like: { masu: "好きです", te: "好きで" },
};

const FUNCTION_WORD_JA_MAP: Record<string, string> = {
  this: "この",
  that: "その",
  these: "これらの",
  those: "それらの",
  my: "私の",
  your: "あなたの",
  his: "彼の",
  her: "彼女の",
  our: "私たちの",
  their: "彼らの",
  box: "箱",
  book: "本",
  pen: "ペン",
  bag: "かばん",
  room: "部屋",
  door: "ドア",
  window: "窓",
};

function pickPrimaryMeaning(meaning: string): string {
  const primary = meaning
    .split(/[;；、,\/]/)
    .map((s) => s.trim())
    .find(Boolean);
  return primary || meaning.trim();
}

const WORD_MEANING_INDEX: Record<string, string> = {};
for (const w of words) {
  const key = w.word.toLowerCase();
  if (!WORD_MEANING_INDEX[key]) {
    WORD_MEANING_INDEX[key] = pickPrimaryMeaning(w.meaning);
  }
}

const TIME_PHRASE_MAP: Record<string, string> = {
  "every day": "毎日",
  "every morning": "毎朝",
  "every night": "毎晩",
  "every week": "毎週",
  "every sunday": "毎週日曜日",
  "today": "今日",
  "tomorrow": "明日",
  "yesterday": "昨日",
};

function phraseToJapanese(phrase: string, targetWord: string, targetMeaning: string): string {
  const clean = phrase.replace(/[.?!]/g, "").trim();
  if (!clean) return "";
  let normalized = ` ${clean.toLowerCase()} `;
  let timePrefix = "";
  for (const [en, ja] of Object.entries(TIME_PHRASE_MAP)) {
    const needle = ` ${en} `;
    if (normalized.includes(needle)) {
      timePrefix = ja;
      normalized = normalized.replace(needle, " ");
    }
  }
  const compact = normalized.trim();
  if (!compact) return timePrefix;
  return compact
    .split(/\s+/)
    .map((token) => {
      const lower = token.toLowerCase();
      if (lower === "a" || lower === "an" || lower === "the" || lower === "to") return "";
      if (new RegExp(`^${targetWord}$`, "i").test(token)) return pickPrimaryMeaning(targetMeaning);
      const fromFunc = FUNCTION_WORD_JA_MAP[lower];
      if (fromFunc) return fromFunc;
      const fromWord = WORD_MEANING_INDEX[lower];
      return fromWord || "";
    })
    .filter(Boolean)
    .join("")
    .replace(/^を/, "")
    .replace(/^が/, "")
    .replace(/^は/, "")
    .replace(/。。+/g, "。")
    .replace(/\s+/g, "")
    .replace(/^/, timePrefix);
}

function toJapaneseHint(exampleSentence: string, word: string, meaning: string): string | null {
  const src = exampleSentence.trim().replace(/\s+/g, " ");
  const wordJa = pickPrimaryMeaning(meaning);

  // Can you + verb + object ?
  const m0 = src.match(/^Can\s+you\s+([A-Za-z]+)\s+(.+)\?$/i);
  if (m0) {
    const verb = m0[1].toLowerCase();
    const objectEn = m0[2];
    const objectJa = phraseToJapanese(objectEn, word, meaning);
    const form = VERB_FORMS_JA_MAP[verb] ?? { masu: "します", te: "して" };
    if (objectJa) return `${objectJa}を${form.te}もらえますか？`;
    return `${wordJa}を${form.te}もらえますか？`;
  }

  // Could you + verb + object ?
  const m0b = src.match(/^Could\s+you\s+([A-Za-z]+)\s+(.+)\?$/i);
  if (m0b) {
    const verb = m0b[1].toLowerCase();
    const objectEn = m0b[2];
    const objectJa = phraseToJapanese(objectEn, word, meaning);
    const form = VERB_FORMS_JA_MAP[verb] ?? { masu: "します", te: "して" };
    if (objectJa) return `${objectJa}を${form.te}いただけますか？`;
    return `${wordJa}を${form.te}いただけますか？`;
  }

  // Can I + verb + object ?
  const m0c = src.match(/^Can\s+I\s+([A-Za-z]+)\s+(.+)\?$/i);
  if (m0c) {
    const verb = m0c[1].toLowerCase();
    const objectEn = m0c[2];
    const objectJa = phraseToJapanese(objectEn, word, meaning);
    const form = VERB_FORMS_JA_MAP[verb] ?? { masu: "します", te: "して" };
    if (objectJa) return `${objectJa}を${form.te}もいいですか？`;
    return `${wordJa}を${form.te}もいいですか？`;
  }

  // Subject + verb + object .
  const m1 = src.match(/^(I|You|He|She|We|They)\s+([A-Za-z]+)\s+(.+)\.$/i);
  if (m1) {
    const subject = m1[1].toLowerCase();
    const verb = m1[2].toLowerCase();
    const objectEn = m1[3];
    const subjectJa = SUBJECT_JA_MAP[subject] ?? "私は";
    const objectJa = phraseToJapanese(objectEn, word, meaning);
    const form = VERB_FORMS_JA_MAP[verb] ?? { masu: "します", te: "して" };
    if (verb === "like") {
      return `${subjectJa}${objectJa || wordJa}が${form.masu}。`;
    }
    return `${subjectJa}${objectJa || wordJa}を${form.masu}。`;
  }

  // This/That/It is ...
  const m2 = src.match(/^(This|That|It)\s+is\s+(.+)\.$/i);
  if (m2) {
    const objJa = phraseToJapanese(m2[2], word, meaning);
    return `これは${objJa || wordJa}です。`;
  }

  // There is/are ...
  const m3 = src.match(/^There\s+(is|are)\s+(.+)\.$/i);
  if (m3) {
    const objJa = phraseToJapanese(m3[2], word, meaning);
    return `${objJa || wordJa}があります。`;
  }

  // Please <verb> ...
  const m4 = src.match(/^Please\s+([A-Za-z]+)(?:\s+(.+))?\.$/i);
  if (m4) {
    const verb = m4[1].toLowerCase();
    const objectJa = m4[2] ? phraseToJapanese(m4[2], word, meaning) : wordJa;
    const form = VERB_FORMS_JA_MAP[verb] ?? { masu: "します", te: "して" };
    return `${objectJa}を${form.te}ください。`;
  }

  // fallback: 文全体から語を拾って和訳文を生成
  const allJa = phraseToJapanese(src, word, meaning);
  return `「${allJa || wordJa}」という意味です。`;
}

export function getTranslationInfo(wordId: number, exampleSentence?: string): TranslationInfo {
  const fullWordData = words.find((w) => w.id === wordId);
  if (!fullWordData) return { sentenceJa: null, wordMeaning: "" };

  let sentenceJa: string | null = null;

  // 1. examples[]から出題例文に対応する日本語訳を優先（ランダム選択された例文と訳を一致させる）
  if (fullWordData.examples && fullWordData.examples.length > 0 && exampleSentence) {
    const matchingExample = fullWordData.examples.find(
      (ex) => ex.en.toLowerCase() === exampleSentence.toLowerCase()
    );
    if (matchingExample) {
      sentenceJa = matchingExample.ja;
    }
  }
  // 2. examples[]にマッチなし → exampleJa（word.example の訳）にフォールバック
  if (!sentenceJa && fullWordData.exampleJa) {
    sentenceJa = fullWordData.exampleJa;
  }
  // 3. それもなければ日本語のみの簡易ヒントを生成
  if (!sentenceJa && exampleSentence) {
    sentenceJa = toJapaneseHint(
      exampleSentence,
      fullWordData.word,
      fullWordData.meaning
    );
  }

  return {
    sentenceJa,
    wordMeaning: fullWordData.meaning,
  };
}