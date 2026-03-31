import { enrichWords } from "../enrich";
import { words as stage1 } from "./stage1";
import { words as stage2 } from "./stage2";
import { words as stage3 } from "./stage3";
import { words as stage4 } from "./stage4";
import { words as stage5 } from "./stage5";

export const conversationWords = [
  ...enrichWords(stage1, "conversation", "1"),
  ...enrichWords(stage2, "conversation", "2"),
  ...enrichWords(stage3, "conversation", "3"),
  ...enrichWords(stage4, "conversation", "4"),
  ...enrichWords(stage5, "conversation", "5"),
];
