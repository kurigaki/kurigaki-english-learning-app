import { enrichWords } from "../enrich";
import { words as stage5 } from "./stage5";
import { words as stage4 } from "./stage4";
import { words as stage3 } from "./stage3";
import { words as stagePre2 } from "./stagePre2";
import { words as stage2 } from "./stage2";
import { words as stagePre1 } from "./stagePre1";
import { words as stage1 } from "./stage1";

export const eikenWords = [
  ...enrichWords(stage5, "eiken", "5"),
  ...enrichWords(stage4, "eiken", "4"),
  ...enrichWords(stage3, "eiken", "3"),
  ...enrichWords(stagePre2, "eiken", "pre2"),
  ...enrichWords(stage2, "eiken", "2"),
  ...enrichWords(stagePre1, "eiken", "pre1"),
  ...enrichWords(stage1, "eiken", "1"),
];
