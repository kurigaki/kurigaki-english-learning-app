export type KeyMapAction =
  | "moveUp" | "moveDown" | "moveLeft" | "moveRight"
  | "attack" | "wait" | "items" | "map" | "stairs"
  | "diagUL" | "diagUR" | "diagDL" | "diagDR"
  | "facingUp" | "facingDown" | "facingLeft" | "facingRight";

export type KeyMap = Record<KeyMapAction, string[]>;

export const DEFAULT_KEYMAP: KeyMap = {
  moveUp:     ["ArrowUp"],
  moveDown:   ["ArrowDown"],
  moveLeft:   ["ArrowLeft"],
  moveRight:  ["ArrowRight"],
  attack:     [" ", "z", "Z", "Enter"],
  wait:       [".", "x", "X"],
  items:      ["i", "I"],
  map:        ["m", "M"],
  stairs:     [">"],
  diagUL:     [],
  diagUR:     [],
  diagDL:     [],
  diagDR:     [],
  facingUp:   [],
  facingDown: [],
  facingLeft: [],
  facingRight:[],
};

export const ACTION_LABELS: Record<KeyMapAction, string> = {
  moveUp:      "移動: 上",
  moveDown:    "移動: 下",
  moveLeft:    "移動: 左",
  moveRight:   "移動: 右",
  attack:      "攻撃",
  wait:        "待機",
  items:       "道具",
  map:         "マップ",
  stairs:      "階段を降りる",
  diagUL:      "斜め: 左上",
  diagUR:      "斜め: 右上",
  diagDL:      "斜め: 左下",
  diagDR:      "斜め: 右下",
  facingUp:    "向き変更: 上",
  facingDown:  "向き変更: 下",
  facingLeft:  "向き変更: 左",
  facingRight: "向き変更: 右",
};

const KEYMAP_STORAGE_KEY = "dungeon_keymap";
const KEYMAP_VERSION_KEY = "dungeon_keymap_version";
const KEYMAP_VERSION = 2; // WASDを廃止し矢印キーのみに変更したバージョン

export function loadKeyMap(): KeyMap {
  if (typeof window === "undefined") return DEFAULT_KEYMAP;
  try {
    const version = parseInt(localStorage.getItem(KEYMAP_VERSION_KEY) ?? "0", 10);
    if (version < KEYMAP_VERSION) {
      // 古いバージョンのキーマップは破棄してデフォルトに戻す
      localStorage.removeItem(KEYMAP_STORAGE_KEY);
      localStorage.setItem(KEYMAP_VERSION_KEY, String(KEYMAP_VERSION));
      return DEFAULT_KEYMAP;
    }
    const raw = localStorage.getItem(KEYMAP_STORAGE_KEY);
    if (!raw) return DEFAULT_KEYMAP;
    return { ...DEFAULT_KEYMAP, ...JSON.parse(raw) } as KeyMap;
  } catch {
    return DEFAULT_KEYMAP;
  }
}

export function saveKeyMap(km: KeyMap): void {
  localStorage.setItem(KEYMAP_STORAGE_KEY, JSON.stringify(km));
  localStorage.setItem(KEYMAP_VERSION_KEY, String(KEYMAP_VERSION));
}

export function resetKeyMap(): void {
  localStorage.removeItem(KEYMAP_STORAGE_KEY);
  localStorage.setItem(KEYMAP_VERSION_KEY, String(KEYMAP_VERSION));
}
