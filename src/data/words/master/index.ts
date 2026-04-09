import type { MasterWord } from "../types";
import { words as a1 } from "./level-a1";
import { words as a2 } from "./level-a2";
import { words as b1 } from "./level-b1";
import { words as b2 } from "./level-b2";
import { words as c1 } from "./level-c1";
import { words as c2 } from "./level-c2";

export const masterWords: MasterWord[] = [
  ...a1,
  ...a2,
  ...b1,
  ...b2,
  ...c1,
  ...c2,
];
