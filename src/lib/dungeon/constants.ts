import type { ItemDef, EnemyDef, TrapType } from "./types";

export const MW = 42;
export const MH = 32;
export const TILE = 30;

export const ITEMS_DEF: ItemDef[] = [
  // ── 草（即時） ──
  {
    id: "heal_grass",
    name: "薬草",
    icon: "🌿",
    cat: "grass",
    desc: "HPを15回復する",
    rarity: 1,
  },
  {
    id: "big_heal",
    name: "特薬草",
    icon: "🌱",
    cat: "grass",
    desc: "HPを最大まで全回復",
    rarity: 3,
  },
  {
    id: "poison_grass",
    name: "毒消し草",
    icon: "🍃",
    cat: "grass",
    desc: "毒状態を解除し、HPを5回復",
    rarity: 2,
  },
  {
    id: "power_grass",
    name: "力の草",
    icon: "🌾",
    cat: "grass",
    desc: "攻撃力を永続+1",
    rarity: 3,
  },
  {
    id: "hp_grass",
    name: "命の草",
    icon: "🌺",
    cat: "grass",
    desc: "最大HPを永続+3",
    rarity: 2,
  },
  {
    id: "swift_grass",
    name: "倍速の草",
    icon: "🍀",
    cat: "grass",
    desc: "倍速状態になる",
    rarity: 1,
  },
  {
    id: "sleep_grass",
    name: "眠り草",
    icon: "🌙",
    cat: "grass",
    desc: "飲むと数ターン眠ってしまう",
    rarity: 2,
  },
  {
    id: "confuse_grass",
    name: "混乱草",
    icon: "🌀",
    cat: "grass",
    desc: "飲むと数ターン混乱してしまう",
    rarity: 1,
  },
  {
    id: "warp_grass",
    name: "ワープ草",
    icon: "🌸",
    cat: "grass",
    desc: "フロア内のランダムな場所へ瞬間移動",
    rarity: 2,
  },
  {
    id: "fire_grass",
    name: "火炎草",
    icon: "🔥",
    cat: "grass",
    desc: "飲むと正面に15ダメージ",
    rarity: 2,
  },

  // ── 巻物 ──
  {
    id: "scroll_hp",
    name: "回復の巻物",
    icon: "📜",
    cat: "scroll",
    desc: "HPを20回復する",
    rarity: 3,
  },
  {
    id: "scroll_power",
    name: "命中の巻物",
    icon: "📜",
    cat: "scroll",
    desc: "次の攻撃を必中にする",
    rarity: 3,
  },
  {
    id: "scroll_attack",
    name: "強化の巻物",
    icon: "📜",
    cat: "scroll",
    desc: "次の攻撃ダメージ×2（会心効果）",
    rarity: 3,
  },
  {
    id: "scroll_sleep",
    name: "睡眠の巻物",
    icon: "📜",
    cat: "scroll",
    desc: "フロア全敵を数ターン眠らせる",
    rarity: 1,
  },
  {
    id: "scroll_escape",
    name: "脱出の巻物",
    icon: "📜",
    cat: "scroll",
    desc: "ダンジョンから脱出する",
    rarity: 1,
  },
  {
    id: "scroll_monster",
    name: "魔物部屋の巻物",
    icon: "📜",
    cat: "scroll",
    desc: "周囲に敵が3体現れる",
    rarity: 2,
  },
  {
    id: "scroll_map",
    name: "地図の巻物",
    icon: "📜",
    cat: "scroll",
    desc: "フロア内の全アイテム・階段の位置が分かる",
    rarity: 2,
  },
  {
    id: "scroll_confuse",
    name: "盲目の巻物",
    icon: "📜",
    cat: "scroll",
    desc: "フロア全敵を数ターン混乱させる",
    rarity: 2,
  },

  // ── 杖 ──
  {
    id: "cane_blow",
    name: "吹き飛ばしの杖",
    icon: "🪄",
    cat: "cane",
    desc: "正面の敵を10マス吹き飛ばす。5ダメージを与える。",
    charges: 3,
    rarity: 2,
  },
  {
    id: "cane_sleep",
    name: "睡眠の杖",
    icon: "🪄",
    cat: "cane",
    desc: "正面の敵を眠らせる",
    charges: 4,
    rarity: 2,
  },
  {
    id: "cane_seal",
    name: "封印の杖",
    icon: "🪄",
    cat: "cane",
    desc: "正面の敵を封印し、数ターン動けなくする",
    charges: 4,
    rarity: 1,
  },
  {
    id: "cane_warp",
    name: "転びの杖",
    icon: "🪄",
    cat: "cane",
    desc: "正面の敵を別フロアへワープさせる",
    charges: 2,
    rarity: 1,
  },

  {
    id: "slow_grass",
    name: "鈍足草",
    icon: "🐢",
    cat: "grass",
    desc: "飲むと5ターン鈍足になる。投げると敵が5ターン鈍足になる",
    rarity: 2,
  },

  // ── 食料 ──
  {
    id: "rice",
    name: "おにぎり",
    icon: "🍙",
    cat: "food",
    desc: "満腹度を50回復",
    rarity: 1,
  },
  {
    id: "rice_big",
    name: "大きいおにぎり",
    icon: "🍱",
    cat: "food",
    desc: "満腹度を100回復",
    rarity: 1,
  },

  // ── 壷 ──
  {
    id: "jar_store",
    name: "保存の壷",
    icon: "🫙",
    cat: "jar",
    desc: "壺の中にアイテムを保存できる",
    rarity: 2,
  },

  // ── 特殊 ──
  {
    id: "lucky_gold",
    name: "幸運のコイン",
    icon: "🪙",
    cat: "special",
    desc: "次の攻撃を必中＋会心にする",
    rarity: 1,
  },
];

export const DUNGEON_MODE_KEY = "dungeon_mode_pref";

// Shop prices for items
export const SHOP_PRICES: Record<string, number> = {
  heal_grass: 10,
  big_heal: 40,
  poison_grass: 15,
  power_grass: 50,
  hp_grass: 60,
  swift_grass: 20,
  sleep_grass: 20,
  confuse_grass: 15,
  warp_grass: 15,
  fire_grass: 25,
  scroll_hp: 20,
  scroll_power: 20,
  scroll_attack: 30,
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

// Easy mode trap pool (milder effects)
export const EASY_TRAP_TYPES: TrapType[] = ["damage", "sleep"];
// Hard mode trap pool (all types)
export const HARD_TRAP_TYPES: TrapType[] = ["damage", "sleep", "warp", "hunger"];

export const ENEMIES_DEF: EnemyDef[] = [
  { name: "グレムリン", icon: "👾", mhp: 4, atk: 1, exp: 4, floor: 1, sleepChance: 0.5 },
  { name: "スライム", icon: "🟢", mhp: 6, atk: 2, exp: 6, floor: 1, sleepChance: 0.4 },
  { name: "コウモリ", icon: "🦇", mhp: 5, atk: 2, exp: 6, floor: 1, sleepChance: 0.2 },
  { name: "スケルトン", icon: "💀", mhp: 10, atk: 3, exp: 12, floor: 2, sleepChance: 0.3 },
  { name: "オーク", icon: "👹", mhp: 14, atk: 4, exp: 16, floor: 2, sleepChance: 0.2 },
  { name: "ゴーレム", icon: "🗿", mhp: 20, atk: 6, exp: 26, floor: 3, sleepChance: 0.1 },
  { name: "デビル", icon: "😈", mhp: 18, atk: 7, exp: 30, floor: 4, sleepChance: 0.1 },
];
