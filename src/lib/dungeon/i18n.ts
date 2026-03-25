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

// ── UI テキスト辞書 ──
const UI: Record<string, { ja: string; en: string }> = {
  // ── HUD ──
  stamina: { ja: "スタミナ", en: "Stamina" },
  stamina_danger: { ja: "⚠️危険!", en: "⚠️DANGER!" },
  floor: { ja: "フロア", en: "Floor" },
  level: { ja: "Lv", en: "Lv" },

  // ── コントローラー ──
  btn_menu: { ja: "メニュー", en: "Menu" },
  btn_items: { ja: "持ち物", en: "Items" },
  btn_foot: { ja: "足元", en: "Feet" },
  btn_look: { ja: "見渡す", en: "Look" },
  btn_wait: { ja: "足踏み", en: "Wait" },
  btn_dash: { ja: "ダッシュ\n乗る", en: "Dash\nStep" },
  btn_attack: { ja: "攻撃/話す", en: "Atk/Talk" },
  btn_arrow: { ja: "弓矢", en: "Arrow" },

  // ── タイトル画面 ──
  title_subtitle: { ja: "〜英語で戦うローグライク〜", en: "~ A Roguelike English Adventure ~" },
  title_course: { ja: "コース選択", en: "Select Course" },
  title_stage: { ja: "ステージ選択", en: "Select Stage" },
  title_all_stages: { ja: "全体（フロアが深くなるほど難しい単語が出現）", en: "All (harder words on deeper floors)" },
  title_weak_mode: { ja: "苦手単語モード", en: "Weak Words Mode" },
  title_weak_btn: { ja: "😓 苦手単語モード", en: "😓 Weak Words" },
  title_mode_label: { ja: "難易度", en: "Difficulty" },
  mode_easy: { ja: "🌱 英語学習メイン", en: "🌱 Study Mode" },
  mode_hard: { ja: "⚔️ ローグライクを楽しむ", en: "⚔️ Roguelike Mode" },
  mode_easy_desc: {
    ja: "スタミナの減りが緩やか・罠が少ない・エネミーラッシュなし",
    en: "Slow stamina drain · Fewer traps · No enemy rush",
  },
  mode_hard_desc: {
    ja: "スタミナの減りが速い・罠が多い・エネミーラッシュあり",
    en: "Fast stamina drain · More traps · Enemy rush enabled",
  },
  diag_move: { ja: "ナナメ移動", en: "Diagonal Move" },
  lang_label: { ja: "言語 / Language", en: "Language / 言語" },
  start_new: { ja: "新しくはじめる", en: "New Game" },
  start_btn: { ja: "START", en: "START" },
  start_continue: { ja: "続きから", en: "Continue" },
  loading: { ja: "読み込み中…", en: "Loading…" },

  // ── アイテムオーバーレイ ──
  items_title: { ja: "持ち物", en: "Items" },
  items_all: { ja: "全て", en: "All" },
  items_use: { ja: "使う", en: "Use" },
  items_throw: { ja: "投げる", en: "Throw" },
  items_place: { ja: "置く", en: "Drop" },
  items_close: { ja: "閉じる", en: "Close" },
  items_remaining: { ja: "残%s回", en: "%s left" },

  // ── 足元アクション ──
  foot_stairs: { ja: "🪜 階段", en: "🪜 Stairs" },
  foot_stairs_desc: { ja: "次のフロアへ降りますか？", en: "Go down to the next floor?" },
  foot_descend: { ja: "降りる [Enter]", en: "Descend [Enter]" },
  foot_cancel: { ja: "キャンセル [Esc]", en: "Cancel [Esc]" },
  foot_pickup: { ja: "拾う [G]", en: "Pick up [G]" },
  foot_use: { ja: "使う [U]", en: "Use [U]" },
  foot_throw: { ja: "投げる [T]", en: "Throw [T]" },
  foot_shop_pickup: { ja: "手に取る [G]", en: "Take [G]" },
  foot_nothing: { ja: "足元には何もない", en: "Nothing at your feet" },

  // ── ショップ ──
  shop_foot_msg: { ja: "🏪 足元に%s（%sG）— 足元ボタンで拾う", en: "🏪 %s on the ground (%sG) — press Feet to pick up" },
  shop_took: { ja: "🏪 %sを手に取った（%sG）— ショップキーパーに話して会計しよう", en: "🏪 Picked up %s (%sG) — talk to the Shopkeeper to pay" },
  shop_returned: { ja: "🏪 %sを商品棚に戻した", en: "🏪 Returned %s to the shelf" },
  shop_confirm_msg: { ja: "%s個で%sGだよ。買うかい？", en: "That's %sG for %s items. Want to buy?" },
  shop_confirm_buy: { ja: "買う", en: "Buy" },
  shop_confirm_cancel: { ja: "やめる", en: "No thanks" },
  shop_balance: { ja: "所持金: %sG", en: "Gold: %sG" },
  shop_not_enough: { ja: "🧔 ショップキーパー「お金が足りないよ！（合計%sG / 所持%sG）」", en: '🧔 Shopkeeper: "Not enough gold! (Need %sG, have %sG)"' },
  shop_greet: { ja: "🧔 ショップキーパー「いらっしゃい！商品を手に取ってみてくれ」", en: '🧔 Shopkeeper: "Welcome! Feel free to pick up any item."' },
  shop_thanks: { ja: "🧔 ショップキーパー「%sGだな。毎度あり！」", en: '🧔 Shopkeeper: "That\'ll be %sG. Thanks!"' },
  shop_bought: { ja: "🏪 %s個のアイテムを購入！（-%sG）", en: "🏪 Bought %s items! (-%sG)" },
  shop_price_tag: { ja: "🏪 %sG", en: "🏪 %sG" },

  // ── 戦闘 ──
  quiz_correct: { ja: "✅ 正解！", en: "✅ Correct!" },
  quiz_wrong: { ja: "❌ 不正解…", en: "❌ Wrong…" },
  attack_hit: { ja: "%sに%sダメージ！", en: "%s damage to %s!" },
  attack_miss: { ja: "攻撃は外れた！", en: "Attack missed!" },
  attack_crit: { ja: "会心の一撃！%sに%sダメージ！", en: "Critical hit! %s damage to %s!" },
  enemy_defeated: { ja: "⚔️ %sを倒した！ EXP+%s 💰+%sG", en: "⚔️ Defeated %s! EXP+%s 💰+%sG" },
  enemy_attack: { ja: "💥 %sから%sダメージを受けた！（残HP:%s）", en: "💥 %s dealt %s damage! (HP: %s)" },
  levelup: { ja: "🎉 レベルアップ！ Lv%s（HP+5 ATK+1）", en: "🎉 Level Up! Lv%s (HP+5 ATK+1)" },
  no_enemy: { ja: "隣に敵がいない", en: "No enemy nearby" },

  // ── アイテム使用 ──
  item_picked: { ja: "%sを拾った！", en: "Picked up %s!" },
  item_placed: { ja: "%sを足元に置いた", en: "Dropped %s on the ground" },
  dash_no_stamina: { ja: "🍂 お腹が空いてダッシュできない！", en: "🍂 Too hungry to dash!" },
  hunger_warning: { ja: "🍂 お腹が空いてきた…食料を食べよう！", en: "🍂 Getting hungry… eat some food!" },
  hunger_starving: { ja: "🍂 お腹が空いた！HPが減っていく…", en: "🍂 Starving! HP is draining…" },

  // ── 罠 ──
  trap_dodge: { ja: "🦶 罠を回避した！", en: "🦶 Dodged the trap!" },
  trap_damage: { ja: "⚡ ダメージトラップ！ HP-%s！", en: "⚡ Damage trap! HP -%s!" },
  trap_sleep: { ja: "💤 眠りトラップ！ %sターン動けない！", en: "💤 Sleep trap! Can't move for %s turns!" },
  trap_warp: { ja: "🌀 ワープトラップ！ 飛ばされた！", en: "🌀 Warp trap! Teleported!" },
  trap_hunger: { ja: "🍂 空腹トラップ！ スタミナ-%s！", en: "🍂 Hunger trap! Stamina -%s!" },

  // ── 杖 ──
  cane_empty: { ja: "杖の魔力が尽きた", en: "The bolt is out of charges" },
  cane_miss: { ja: "魔力が虚空に消えた（残%s回）", en: "The magic dissipated (%s left)" },

  // ── 脱出 ──
  escape_msg: { ja: "📜 エスケープスペルを読んだ！アイテムとゴールドを持ってダンジョンから脱出！", en: "📜 Used Escape Spell! Escaped the dungeon with all items and gold!" },

  // ── 死亡/クリア画面 ──
  death_cleared: { ja: "🏆 ダンジョンクリア！", en: "🏆 Dungeon Cleared!" },
  death_defeated: { ja: "💀 冒険失敗…", en: "💀 Adventure Failed…" },
  death_floor: { ja: "到達フロア", en: "Floor Reached" },
  death_level: { ja: "レベル", en: "Level" },
  death_kills: { ja: "撃破数", en: "Enemies Defeated" },
  death_correct: { ja: "正答数", en: "Correct Answers" },
  death_wrong: { ja: "誤答数", en: "Wrong Answers" },
  death_turns: { ja: "ターン数", en: "Turns" },
  death_retry: { ja: "再挑戦", en: "Try Again" },
  death_title: { ja: "タイトルへ", en: "To Title" },
  death_score: { ja: "スコア", en: "Score" },
  death_new_record: { ja: "🏅 NEW RECORD", en: "🏅 NEW RECORD" },

  // ── メニュー ──
  menu_title: { ja: "メニュー", en: "Menu" },
  menu_diag: { ja: "ナナメ移動", en: "Diagonal Move" },
  menu_give_up: { ja: "冒険をあきらめる", en: "Give Up" },
  menu_close: { ja: "閉じる", en: "Close" },

  // ── マップ ──
  map_title: { ja: "🗺 ダンジョンマップ", en: "🗺 Dungeon Map" },
  map_close: { ja: "閉じる 【M】", en: "Close [M]" },
  map_player: { ja: "自分", en: "You" },
  map_enemy: { ja: "敵", en: "Enemy" },
  map_item: { ja: "アイテム", en: "Item" },
  map_shop: { ja: "ショップ", en: "Shop" },
  map_stairs: { ja: "階段", en: "Stairs" },

  // ── イベント ──
  enemy_rush_title: { ja: "👹 エネミーラッシュ！", en: "👹 Enemy Rush!" },
  enemy_rush_body: {
    ja: "大量の敵が眠っている部屋に入った！\n静かに通り抜けるか、アイテムで一掃しよう。",
    en: "You entered a room full of sleeping enemies!\nSneak through or wipe them out with items.",
  },
  shopkeeper_rage_title: { ja: "🧔💢 ショップキーパーが怒った！", en: "🧔💢 Shopkeeper Enraged!" },
  shopkeeper_rage_theft: {
    ja: "未払いの商品を持ってショップを出た！\nショップキーパーが追いかけてくる！",
    en: "You left the shop with unpaid items!\nThe Shopkeeper is coming after you!",
  },
  shopkeeper_rage_attack: {
    ja: "ショップキーパーを攻撃してしまった！\nショップキーパーが本気で怒っている！",
    en: "You attacked the Shopkeeper!\nThe Shopkeeper is enraged!",
  },
  shopkeeper_defeated: { ja: "⚔️ ショップキーパーを倒した！", en: "⚔️ Defeated the Shopkeeper!" },

  // ── ストレージポット ──
  storage_pot_title: { ja: "🫙 ストレージポット", en: "🫙 Storage Pot" },

  // ── ガイドページ ──
  guide_title: { ja: "📖 GUIDE", en: "📖 GUIDE" },
  guide_tab_how: { ja: "あそびかた", en: "How to Play" },
  guide_tab_items: { ja: "アイテム図鑑", en: "Item Guide" },
  guide_tab_enemies: { ja: "敵図鑑", en: "Enemy Guide" },

  // ── 倉庫 ──
  warehouse_title: { ja: "📦 WAREHOUSE", en: "📦 WAREHOUSE" },
  warehouse_gold: { ja: "GOLD", en: "GOLD" },
  warehouse_carry_gold: { ja: "持ち込みゴールド:", en: "Carry-in gold:" },
  warehouse_carry_summary: { ja: "持ち込み設定", en: "CARRY-IN" },
  warehouse_carry: { ja: "持込", en: "Take" },
  warehouse_carry_check: { ja: "持込 ✓", en: "Take ✓" },
  warehouse_select_all: { ja: "全選択", en: "All" },
  warehouse_select_none: { ja: "全解除", en: "None" },
  warehouse_empty: { ja: "倉庫は空です", en: "Warehouse is empty" },
  warehouse_empty_desc: { ja: "ダンジョンクリアかエスケープスペルでアイテムを持ち帰ろう", en: "Clear a dungeon or use Escape Spell to store items" },
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
