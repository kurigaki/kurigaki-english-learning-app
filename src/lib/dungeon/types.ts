export const W = 0 as const;
export const R = 1 as const;
export const C = 2 as const;
export type TileType = 0 | 1 | 2;

export type Room = { x: number; y: number; w: number; h: number };

export type EnemyDef = {
  name: string;
  icon: string;
  mhp: number;
  atk: number;
  exp: number;
  floor: number;
  sleepChance: number;
};

export type Enemy = {
  id: number;
  name: string;
  icon: string;
  hp: number;
  mhp: number;
  atk: number;
  exp: number;
  floor: number;
  sleepChance: number;
  x: number;
  y: number;
  alert: boolean;
  sleeping: boolean;
  confused: number;
  sealed: number;
  wanderTarget: { x: number; y: number } | null;
  lastDx: number | undefined;
  lastDy: number | undefined;
  stuckCount: number;
};

export type ItemDef = {
  id: string;
  name: string;
  icon: string;
  cat: "grass" | "scroll" | "cane" | "food" | "jar" | "special";
  desc: string;
  rarity: number;
  charges?: number;
};

export type InventoryItem = {
  id: string;
  name: string;
  icon: string;
  cat: string;
  desc: string;
  count: number;
};

export type ItemTile = { x: number; y: number; id: string };

export type PlayerState = {
  hp: number;
  mhp: number;
  lv: number;
  exp: number;
  enext: number;
  atk: number;
};

export type GameState = {
  floor: number;
  p: PlayerState;
  items: InventoryItem[];
  map: TileType[][];
  rooms: Room[];
  px: number;
  py: number;
  enemies: Enemy[];
  itemTiles: ItemTile[];
  stairsPos: { x: number; y: number } | null;
  turn: number;
  kills: number;
  correct: number;
  wrong: number;
  missedWords: string[];
  powerUp: boolean;
  sureHit: boolean;
  onStairs: boolean;
  swiftTurns: number;
  blindTurns: number;
  cane_blow_charges: number;
  cane_sleep_charges: number;
  cane_seal_charges: number;
  cane_warp_charges: number;
};

export type DungeonQuestion = { wordId: number; word: string; ans: string; ch: string[] };

export type QuizState = {
  enemy: Enemy;
  question: DungeonQuestion;
  choiceOrder: string[];
};

export type QuizResult = {
  correct: boolean;
  damage: number;
  miss: boolean;
  crit: boolean;
};

export type DeathState = {
  floor: number;
  lv: number;
  kills: number;
  correct: number;
  wrong: number;
  turns: number;
  missedWords: DungeonQuestion[];
  isCleared: boolean;
};

export type DmgPop = {
  id: number;
  gx: number;
  gy: number;
  type: "hit" | "crit" | "miss" | "recv" | "wake";
  value: number;
};

export type SfxName =
  | "hit"
  | "crit"
  | "miss"
  | "recv"
  | "correct"
  | "wrong"
  | "levelup"
  | "stairs"
  | "item";
