import type { ItemDef, EnemyDef, TrapType } from "./types";

export const MW = 42;
export const MH = 32;
export const TILE = 30;

export const ITEMS_DEF: ItemDef[] = [
  // ── ワード (Word) — 一人に使い切り ──
  {
    id: "heal_grass",
    name: "ヒールワード", nameEn: "Heal Word",
    icon: "🌿", cat: "grass",
    desc: "HPを15回復する（スタミナ+5）", descEn: "Restore 15 HP (Stamina+5)",
    rarity: 1,
  },
  {
    id: "big_heal",
    name: "メガワード", nameEn: "Mega Word",
    icon: "🌱", cat: "grass",
    desc: "HPを最大まで全回復（スタミナ+5）", descEn: "Fully restore HP (Stamina+5)",
    rarity: 3,
  },
  {
    id: "power_grass",
    name: "パワーワード", nameEn: "Power Word",
    icon: "🌾", cat: "grass",
    desc: "攻撃力を永続+1（スタミナ+5）", descEn: "Permanently +1 ATK (Stamina+5)",
    rarity: 3,
  },
  {
    id: "hp_grass",
    name: "ライフワード", nameEn: "Life Word",
    icon: "🌺", cat: "grass",
    desc: "最大HPを永続+3（スタミナ+5）", descEn: "Permanently +3 Max HP (Stamina+5)",
    rarity: 2,
  },
  {
    id: "swift_grass",
    name: "ヘイストワード", nameEn: "Haste Word",
    icon: "🍀", cat: "grass",
    desc: "10ターン倍速になる（スタミナ+5）", descEn: "Double speed for 10 turns (Stamina+5)",
    rarity: 1,
  },
  {
    id: "sleep_grass",
    name: "スリープワード", nameEn: "Sleep Word",
    icon: "🌙", cat: "grass",
    desc: "飲むと3ターン眠ってしまう（スタミナ+5）", descEn: "Fall asleep for 3 turns (Stamina+5)",
    rarity: 2,
  },
  {
    id: "confuse_grass",
    name: "コンフューズワード", nameEn: "Confuse Word",
    icon: "🌀", cat: "grass",
    desc: "飲むと4ターン混乱してしまう（スタミナ+5）", descEn: "Confused for 4 turns (Stamina+5)",
    rarity: 1,
  },
  {
    id: "warp_grass",
    name: "テレポワード", nameEn: "Teleport Word",
    icon: "🌸", cat: "grass",
    desc: "フロア内のランダムな場所へ瞬間移動（スタミナ+5）", descEn: "Teleport to random spot (Stamina+5)",
    rarity: 2,
  },
  {
    id: "fire_grass",
    name: "ファイアワード", nameEn: "Fire Word",
    icon: "🔥", cat: "grass",
    desc: "飲むと正面に30ダメージ（スタミナ+5）", descEn: "Deal 30 damage ahead (Stamina+5)",
    rarity: 2,
  },
  {
    id: "slow_grass",
    name: "スローワード", nameEn: "Slow Word",
    icon: "🐢", cat: "grass",
    desc: "飲むと5ターン鈍足になる。投げると敵が5ターン鈍足（スタミナ+5）", descEn: "Slowed for 5 turns. Throw to slow enemy (Stamina+5)",
    rarity: 2,
  },

  // ── スペル (Spell) — フロア全体効果 ──
  {
    id: "scroll_vacuum",
    name: "シンクウスペル", nameEn: "Vacuum Spell",
    icon: "📜", cat: "scroll",
    desc: "同室の全敵に20ダメージ（廊下では隣接のみ）", descEn: "Deal 20 damage to all enemies in room (corridor: adjacent only)",
    rarity: 2,
  },
  {
    id: "scroll_sleep",
    name: "スリープスペル", nameEn: "Sleep Spell",
    icon: "📜", cat: "scroll",
    desc: "同室の敵を眠らせる（廊下では隣接のみ）", descEn: "Put enemies in room to sleep (corridor: adjacent only)",
    rarity: 1,
  },
  {
    id: "scroll_escape",
    name: "エスケープスペル", nameEn: "Escape Spell",
    icon: "📜", cat: "scroll",
    desc: "アイテムとゴールドを持ってダンジョンから脱出する", descEn: "Escape the dungeon with your items and gold",
    rarity: 1,
  },
  {
    id: "scroll_map",
    name: "マップスペル", nameEn: "Map Spell",
    icon: "📜", cat: "scroll",
    desc: "フロア内の全アイテム・階段の位置が分かる", descEn: "Reveal all items and stairs on the floor",
    rarity: 2,
  },
  {
    id: "scroll_confuse",
    name: "コンフューズスペル", nameEn: "Confuse Spell",
    icon: "📜", cat: "scroll",
    desc: "フロア全敵を数ターン混乱させる", descEn: "Confuse all enemies on the floor",
    rarity: 2,
  },

  // ── ボルト (Bolt) — 直線上・複数回（チャージ制） ──
  {
    id: "cane_blow",
    name: "ノックバックボルト", nameEn: "Knockback Bolt",
    icon: "⚡", cat: "cane",
    desc: "正面の敵を10マス吹き飛ばす。5ダメージを与える。", descEn: "Knock enemy back 10 tiles. Deal 5 damage.",
    charges: 3, rarity: 2,
  },
  {
    id: "cane_sleep",
    name: "スリープボルト", nameEn: "Sleep Bolt",
    icon: "⚡", cat: "cane",
    desc: "正面の敵を眠らせる", descEn: "Put enemy ahead to sleep",
    charges: 4, rarity: 2,
  },
  {
    id: "cane_swap",
    name: "スワップボルト", nameEn: "Swap Bolt",
    icon: "⚡", cat: "cane",
    desc: "正面の敵と場所を入れ替える", descEn: "Swap positions with enemy ahead",
    charges: 3, rarity: 2,
  },
  {
    id: "cane_warp",
    name: "ワープボルト", nameEn: "Warp Bolt",
    icon: "⚡", cat: "cane",
    desc: "正面の敵を別フロアへワープさせる", descEn: "Warp enemy ahead to another floor",
    charges: 2, rarity: 1,
  },

  // ── フード (Food) ──
  {
    id: "rice",
    name: "ブレッド", nameEn: "Bread",
    icon: "🍙", cat: "food",
    desc: "スタミナを50回復", descEn: "Restore 50 Stamina",
    rarity: 3,
  },
  {
    id: "rice_big",
    name: "ビッグブレッド", nameEn: "Big Bread",
    icon: "🍱", cat: "food",
    desc: "スタミナを100回復", descEn: "Restore 100 Stamina",
    rarity: 2,
  },

  // ── ポット (Pot) ──
  {
    id: "jar_store",
    name: "ストレージポット", nameEn: "Storage Pot",
    icon: "🫙", cat: "jar",
    desc: "壺の中にアイテムを保存できる", descEn: "Store items inside the pot",
    rarity: 2,
  },

  // ── スペシャル (Special) ──
  {
    id: "lucky_gold",
    name: "ラッキーコイン", nameEn: "Lucky Coin",
    icon: "🪙", cat: "special",
    desc: "次の攻撃を必中＋会心にする", descEn: "Next attack: sure hit + critical",
    rarity: 1,
  },
  {
    id: "arrow",
    name: "アロー", nameEn: "Arrow",
    icon: "🏹", cat: "special" as const,
    desc: "弓で矢を放つ。直線上の最初の敵に10ダメージ。", descEn: "Shoot an arrow. 10 damage to first enemy in line.",
    rarity: 2, charges: 10,
  },
];

export const DUNGEON_MODE_KEY = "dungeon_mode_pref";
export const DUNGEON_DIAG_KEY = "dungeon_diag_move";

// Shop prices for items
export const SHOP_PRICES: Record<string, number> = {
  heal_grass: 10,
  big_heal: 40,
  power_grass: 50,
  hp_grass: 60,
  swift_grass: 20,
  sleep_grass: 20,
  confuse_grass: 15,
  warp_grass: 15,
  fire_grass: 25,
  scroll_vacuum: 40,
  scroll_sleep: 35,
  scroll_escape: 50,
  rice: 25,
  rice_big: 60,
  jar_store: 20,
  slow_grass: 20,
  lucky_gold: 80,
};

// Trap icon display
export const TRAP_ICONS: Record<TrapType, string> = {
  damage: "⚡",
  sleep: "💤",
  warp: "🌀",
  hunger: "🍂",
};

// Easy mode trap pool (milder effects — 睡眠は初学者に厳しいので除外)
export const EASY_TRAP_TYPES: TrapType[] = ["damage", "hunger"];
// Hard mode trap pool (all types)
export const HARD_TRAP_TYPES: TrapType[] = ["damage", "sleep", "warp", "hunger"];

// ショップキーパー（超高ステータスで倒すのはほぼ不可能）
export const SHOPKEEPER_DEF = {
  name: "ショップキーパー",
  icon: "🧔",
  mhp: 200,
  atk: 50,
  exp: 0,      // 倒しても経験値なし
} as const;

// 泥棒時に出現するガーディアン（高ステータス・脱出チャレンジ用）
// B細胞調整: ATKを下げて「即死級→逃走困難」に。逃げる余地を残す設計
export const GUARDIAN_DEFS: EnemyDef[] = [
  { name: "ガーディアン", icon: "🛡️", mhp: 70, atk: 15, exp: 0, floor: 99, sleepChance: 0 },
  { name: "センチネル", icon: "⚔️", mhp: 90, atk: 18, exp: 0, floor: 99, sleepChance: 0 },
];

export const ENEMIES_DEF: EnemyDef[] = [
  // B1F — 弱い敵（初心者向け）
  { name: "Gremlin", icon: "👾", mhp: 5, atk: 2, exp: 5, floor: 1, sleepChance: 0.5 },
  { name: "Slime", icon: "🫧", mhp: 7, atk: 2, exp: 6, floor: 1, sleepChance: 0.4 },
  { name: "Bat", icon: "🦇", mhp: 6, atk: 3, exp: 7, floor: 1, sleepChance: 0.2 },
  // B2F
  { name: "Skeleton", icon: "💀", mhp: 12, atk: 4, exp: 14, floor: 2, sleepChance: 0.3 },
  { name: "Orc", icon: "👹", mhp: 16, atk: 5, exp: 18, floor: 2, sleepChance: 0.2 },
  { name: "Ghost", icon: "👻", mhp: 10, atk: 4, exp: 12, floor: 2, sleepChance: 0.3 },
  // B3F
  { name: "Golem", icon: "🗿", mhp: 22, atk: 7, exp: 28, floor: 3, sleepChance: 0.1 },
  { name: "Wizard", icon: "🧙", mhp: 14, atk: 6, exp: 22, floor: 3, sleepChance: 0.2 },
  // B4F
  { name: "Devil", icon: "😈", mhp: 20, atk: 8, exp: 32, floor: 4, sleepChance: 0.1 },
  { name: "Minotaur", icon: "🐂", mhp: 28, atk: 9, exp: 38, floor: 4, sleepChance: 0.1 },
  // B5F
  { name: "Dragon", icon: "🐉", mhp: 35, atk: 11, exp: 55, floor: 5, sleepChance: 0.05 },
  { name: "Lich", icon: "☠️", mhp: 25, atk: 10, exp: 48, floor: 5, sleepChance: 0.1 },
];
