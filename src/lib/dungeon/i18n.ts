/**
 * WORD DUNGEON 多言語対応 (日本語 / English)
 * タイトル画面の設定から切り替え可能
 */

export type DungeonLang = "ja" | "en";

const DUNGEON_LANG_KEY = "dungeon_lang";

export function getDungeonLang(): DungeonLang {
  if (typeof window === "undefined") return "ja";
  return (localStorage.getItem(DUNGEON_LANG_KEY) as DungeonLang) ?? "ja";
}

export function setDungeonLang(lang: DungeonLang): void {
  localStorage.setItem(DUNGEON_LANG_KEY, lang);
}

/** ItemDef / InventoryItem の表示名を言語に応じて返す */
export function itemName(item: { name: string; nameEn?: string }, lang: DungeonLang): string {
  return lang === "en" && item.nameEn ? item.nameEn : item.name;
}

/** ItemDef の説明文を言語に応じて返す */
export function itemDesc(item: { desc: string; descEn?: string }, lang: DungeonLang): string {
  return lang === "en" && item.descEn ? item.descEn : item.desc;
}

// ── アイテムカテゴリ表示名 ──
const CAT_LABELS: Record<string, { ja: string; en: string }> = {
  grass: { ja: "ワード", en: "Word" },
  scroll: { ja: "スペル", en: "Spell" },
  cane: { ja: "ボルト", en: "Bolt" },
  food: { ja: "フード", en: "Food" },
  jar: { ja: "ポット", en: "Pot" },
  special: { ja: "スペシャル", en: "Special" },
};

export function catLabel(cat: string, lang: DungeonLang): string {
  return CAT_LABELS[cat]?.[lang] ?? cat;
}

// ── UI テキスト ──
const UI: Record<string, { ja: string; en: string }> = {
  // HUD
  stamina: { ja: "スタミナ", en: "Stamina" },
  floor: { ja: "フロア", en: "Floor" },
  level: { ja: "Lv", en: "Lv" },

  // イベント
  enemy_rush_title: { ja: "👹 エネミーラッシュ！", en: "👹 Enemy Rush!" },
  enemy_rush_body: {
    ja: "大量の敵が眠っている部屋に入った！\n静かに通り抜けるか、アイテムで一掃しよう。",
    en: "You entered a room full of sleeping enemies!\nSneak through or wipe them out with items.",
  },
  shopkeeper_rage_title: { ja: "🧔💢 ショップキーパーが怒った！", en: "🧔💢 Shopkeeper is furious!" },
  shopkeeper_rage_theft: {
    ja: "未払いの商品を持ってショップを出た！\nショップキーパーが追いかけてくる！",
    en: "You left the shop with unpaid items!\nThe Shopkeeper is chasing you!",
  },
  shopkeeper_rage_attack: {
    ja: "ショップキーパーを攻撃してしまった！\nショップキーパーが本気で怒っている！",
    en: "You attacked the Shopkeeper!\nThe Shopkeeper is enraged!",
  },
  shopkeeper_greet: {
    ja: "🧔 ショップキーパー「いらっしゃい！商品を手に取ってみてくれ」",
    en: '🧔 Shopkeeper: "Welcome! Feel free to pick up any item."',
  },
  shopkeeper_thanks: {
    ja: "🧔 ショップキーパー「%sGだな。毎度あり！」",
    en: '🧔 Shopkeeper: "That\'ll be %sG. Thanks!"',
  },
  shopkeeper_defeated: {
    ja: "⚔️ ショップキーパーを倒した！",
    en: "⚔️ Defeated the Shopkeeper!",
  },
  shop_pickup: {
    ja: "🏪 %s — ショップキーパーに話して会計しよう",
    en: "🏪 %s — Talk to the Shopkeeper to pay.",
  },
  shop_bought: {
    ja: "🏪 %s個のアイテムを購入！（-%sG）",
    en: "🏪 Bought %s items! (-%sG)",
  },

  // 食料
  bread_heal: { ja: "🍙 スタミナが50回復！", en: "🍙 Stamina restored by 50!" },
  big_bread_heal: { ja: "🍱 スタミナが全回復！", en: "🍱 Stamina fully restored!" },

  // ワード (草) 効果通知
  word_heal: { ja: "💚 HPが%s回復！（スタミナ+5）", en: "💚 HP restored by %s! (Stamina+5)" },
  word_full_heal: { ja: "💚 HPが全回復！（スタミナ+5）", en: "💚 HP fully restored! (Stamina+5)" },
  word_clear: { ja: "✨ HP+5！（スタミナ+5）", en: "✨ HP+5! (Stamina+5)" },
  word_power: { ja: "⚔️ 攻撃力が%sになった！（スタミナ+5）", en: "⚔️ ATK is now %s! (Stamina+5)" },
  word_life: { ja: "❤️ 最大HPが%sになった！（スタミナ+5）", en: "❤️ Max HP is now %s! (Stamina+5)" },
  word_haste: { ja: "💨 倍速になった！（5ターン・スタミナ+5）", en: "💨 Double speed! (5 turns, Stamina+5)" },
  word_slow: { ja: "🐢 鈍足になった！（5ターン・スタミナ+5）", en: "🐢 Slowed! (5 turns, Stamina+5)" },
  word_sleep: { ja: "💤 眠ってしまった！3ターン動けない（スタミナ+5）", en: "💤 Fell asleep! Can't move for 3 turns (Stamina+5)" },
  word_confuse: { ja: "🌀 混乱した！4ターン方向が乱れる（スタミナ+5）", en: "🌀 Confused! Random movement for 4 turns (Stamina+5)" },
  word_warp: { ja: "✨ ワープした！（スタミナ+5）", en: "✨ Warped! (Stamina+5)" },
  word_fire_hit: { ja: "🔥 %sに%sダメージ！（スタミナ+5）", en: "🔥 %s damage to %s! (Stamina+5)" },
  word_fire_miss: { ja: "🔥 火炎が空を切った（スタミナ+5）", en: "🔥 Flames missed! (Stamina+5)" },

  // タイトル画面
  mode_easy: { ja: "🌱 英語学習メイン", en: "🌱 English Study" },
  mode_hard: { ja: "⚔️ ローグライクを楽しむ", en: "⚔️ Roguelike Mode" },
  mode_easy_desc: {
    ja: "スタミナの減りが緩やか・罠が少ない・エネミーラッシュなし",
    en: "Slow stamina drain, fewer traps, no enemy rush",
  },
  mode_hard_desc: {
    ja: "スタミナの減りが速い・罠が多い・エネミーラッシュあり",
    en: "Fast stamina drain, more traps, enemy rush enabled",
  },
  diag_move: { ja: "ナナメ移動", en: "Diagonal Move" },
  lang_label: { ja: "言語 / Language", en: "Language / 言語" },
  start_new: { ja: "新しく始める", en: "New Game" },
  start_continue: { ja: "続きから", en: "Continue" },

  // ストレージポット
  storage_pot_title: { ja: "🫙 ストレージポット", en: "🫙 Storage Pot" },
};

/** テキスト取得。%s でプレースホルダを順に置換 */
export function t(key: string, lang: DungeonLang, ...args: (string | number)[]): string {
  const entry = UI[key];
  if (!entry) return key;
  let text = entry[lang];
  for (const arg of args) {
    text = text.replace("%s", String(arg));
  }
  return text;
}
