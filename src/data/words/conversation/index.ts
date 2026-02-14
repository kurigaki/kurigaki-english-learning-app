import { convBeginnerWords } from "./beginner";
import { convElementaryWords } from "./elementary";
import { convIntermediateWords } from "./intermediate";
import { convAdvancedWords } from "./advanced";
import { convNativeWords } from "./native";
import { Word } from "../types";

// 英会話コース全単語
export const conversationWords: Word[] = [
  ...convBeginnerWords,
  ...convElementaryWords,
  ...convIntermediateWords,
  ...convAdvancedWords,
  ...convNativeWords,
];

// レベル別エクスポート
export {
  convBeginnerWords,
  convElementaryWords,
  convIntermediateWords,
  convAdvancedWords,
  convNativeWords,
};

// レベル別単語数
export const conversationWordCounts = {
  convBeginner: convBeginnerWords.length,
  convElementary: convElementaryWords.length,
  convIntermediate: convIntermediateWords.length,
  convAdvanced: convAdvancedWords.length,
  convNative: convNativeWords.length,
  total: conversationWords.length,
};
