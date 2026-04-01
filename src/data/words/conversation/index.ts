import { enrichWords } from "../enrich";
import { words as stageA1 } from "./stage1";
import { words as stageA2 } from "./stage2";
import { words as stageB1 } from "./stage3";
import { words as stageB2 } from "./stage4";
import { words as stageC1 } from "./stage5";
import { words as stageC2 } from "./stage6";

export const conversationWords = [
  ...enrichWords(stageA1, "conversation", "a1"),
  ...enrichWords(stageA2, "conversation", "a2"),
  ...enrichWords(stageB1, "conversation", "b1"),
  ...enrichWords(stageB2, "conversation", "b2"),
  ...enrichWords(stageC1, "conversation", "c1"),
  ...enrichWords(stageC2, "conversation", "c2"),
];
