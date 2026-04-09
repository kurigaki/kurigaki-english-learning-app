import type { MasterWord } from "../types";
import a1 from "./level-a1.json";
import a2 from "./level-a2.json";
import b1 from "./level-b1.json";
import b2 from "./level-b2.json";
import c1 from "./level-c1.json";
import c2 from "./level-c2.json";

export const masterWords: MasterWord[] = [
  ...(a1 as MasterWord[]),
  ...(a2 as MasterWord[]),
  ...(b1 as MasterWord[]),
  ...(b2 as MasterWord[]),
  ...(c1 as MasterWord[]),
  ...(c2 as MasterWord[]),
];
