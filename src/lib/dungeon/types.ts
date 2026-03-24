export const W = 0 as const;
export const R = 1 as const;
export const C = 2 as const;
export type TileType = 0 | 1 | 2;

export type DungeonMode = "easy" | "hard";

export type TrapType = "damage" | "sleep" | "warp" | "hunger";

export type Trap = {
  id: number;
  x: number;
  y: number;
  type: TrapType;
  visible: boolean;
};

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
  justWoke?: boolean; // 起床したターンは行動しない
  slowTurns?: number;   // 鈍足残りターン
  swiftTurns?: number;  // 倍速残りターン
  slowSkip?: boolean;   // 鈍足スキップフラグ
  slowed?: boolean;    // 永続鈍足
  justSlowed?: boolean; // 鈍足付与ターンは行動しない
};

export type ItemDef = {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  cat: "grass" | "scroll" | "cane" | "food" | "jar" | "special";
  desc: string;
  descEn: string;
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
  contents?: InventoryItem[]; // 壷の中身（jar_storeのみ使用）
};

export type ItemTile = { x: number; y: number; id: string; contents?: InventoryItem[] };

export type ShopItem = { x: number; y: number; itemId: string; price: number };

export type Shopkeeper = {
  x: number;
  y: number;
  hp: number;
  mhp: number;
  atk: number;
  hostile: boolean;       // 敵化フラグ（攻撃 or 泥棒で true）
  homeX: number;          // 初期位置X（通常時の待機場所）
  homeY: number;          // 初期位置Y
  entranceX: number;      // 廊下入口の部屋側タイルX（泥棒時に塞ぐ位置）
  entranceY: number;      // 廊下入口の部屋側タイルY
};

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
  explored: boolean[][]; // 探索済みタイル（fog of war）
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
  answeredQuestions: AnsweredQuestion[];
  powerUp: boolean;
  sureHit: boolean;
  onStairs: boolean;
  swiftTurns: number;
  blindTurns: number;
  cane_blow_charges: number;
  cane_sleep_charges: number;
  cane_seal_charges: number;
  cane_warp_charges: number;
  // New roguelike mechanics
  hunger: number;
  maxHunger: number;
  gold: number;
  traps: Trap[];
  shopItems: ShopItem[];
  shopkeeper: Shopkeeper | null;
  shopRoomIdx: number | null;
  stolenItems: string[];    // 未払いで持ち出したアイテムID（泥棒判定用）
  theftTriggered: boolean;  // 泥棒イベント発動済みフラグ（ガーディアン出現済み）
  dungeonMode: DungeonMode;
  monsterHouseRoomIdx: number | null;
  playerDir: { dx: number; dy: number }; // 最後の移動方向（投げる用）
  playerSleepTurns: number;    // プレイヤー眠り残りターン
  playerConfusedTurns: number; // プレイヤー混乱残りターン
  playerSlowTurns: number;     // プレイヤー鈍足残りターン
  diagMove: boolean;           // ナナメ移動の有効/無効
};

export type DungeonQuestion = { wordId: number; word: string; ans: string; ch: string[]; stage?: string };
export type AnsweredQuestion = { question: DungeonQuestion; correct: boolean };

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
  newRecords: string[];
  answeredQuestions: AnsweredQuestion[];
  score?: number;
  rank?: number;
};

export type DungeonRanking = {
  score: number;
  floor: number;
  lv: number;
  kills: number;
  correct: number;
  wrong: number;
  turns: number;
  cleared: boolean;
  cause: string;
  date: string;
  mode: string;
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

export type ScreenFlashKind =
  | "recv"
  | "miss"
  | "correct"
  | "levelup"
  | "trap_damage"
  | "trap_sleep"
  | "trap_warp"
  | "trap_hunger";

export type ScreenEffect = {
  flash: ScreenFlashKind | null;
  shake: boolean;
  id: number;
};

export type EventOverlayKind = "trap" | "monster_house" | "shopkeeper_rage";

export type EventOverlay = {
  kind: EventOverlayKind;
  title: string;
  body: string;
  color: string;
  icon: string;
  autoClose?: number;
};

export type FootAction =
  | { kind: "stairs" }
  | { kind: "item"; itemId: string; itemName: string; itemIcon: string; itemDesc: string }
  | { kind: "shopItem"; itemId: string; itemName: string; itemIcon: string; itemDesc: string; price: number };
