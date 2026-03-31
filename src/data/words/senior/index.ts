import { enrichWords } from "../enrich";
import { words as stage1 } from "./stage1";
import { words as stage2 } from "./stage2";
import { words as stage3 } from "./stage3";

export const seniorWords = [
  ...enrichWords(stage1, "senior", "1"),
  ...enrichWords(stage2, "senior", "2"),
  ...enrichWords(stage3, "senior", "3"),
];
