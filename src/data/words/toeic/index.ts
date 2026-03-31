import { enrichWords } from "../enrich";
import { words as stage500 } from "./stage500";
import { words as stage600 } from "./stage600";
import { words as stage700 } from "./stage700";
import { words as stage800 } from "./stage800";
import { words as stage900 } from "./stage900";

export const toeicWords = [
  ...enrichWords(stage500, "toeic", "500"),
  ...enrichWords(stage600, "toeic", "600"),
  ...enrichWords(stage700, "toeic", "700"),
  ...enrichWords(stage800, "toeic", "800"),
  ...enrichWords(stage900, "toeic", "900"),
];
