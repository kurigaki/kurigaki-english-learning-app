"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { storage } from "@/lib/storage";
import { ITEMS_DEF } from "@/lib/dungeon/constants";
import { getDungeonLang, itemName, itemDesc, type DungeonLang } from "@/lib/dungeon/i18n";
import type { InventoryItem } from "@/lib/dungeon/types";

const DC = {
  bg: "#09090f", bg2: "#111118", bg3: "#181825", bg4: "#1f1f30",
  border: "#2a2a45", border2: "#3a3a60",
  accent: "#7c6af7", gold: "#f5c842", green: "#52d47a",
  text: "#ddddf5", text2: "#9090b8", text3: "#606080",
};

export default function WarehousePage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [gold, setGold] = useState(0);
  const [lang, setLang] = useState<DungeonLang>("ja");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  // 持ち込み設定（アイテムID → 個数）
  const [carryItems, setCarryItems] = useState<Record<string, number>>({});
  const [carryGold, setCarryGold] = useState(0);

  useEffect(() => {
    const wh = storage.getWarehouse();
    const gb = storage.getGoldBank();
    setItems(wh);
    setGold(gb);
    setLang(getDungeonLang());
    const cs = storage.getCarrySettings();
    setCarryItems(cs.selectedItems);
    setCarryGold(Math.min(cs.goldAmount, gb));
  }, []);

  const saveSettings = useCallback(() => {
    storage.saveCarrySettings({
      selectedItems: carryItems,
      goldAmount: carryGold,
    });
  }, [carryItems, carryGold]);

  useEffect(() => { saveSettings(); }, [saveSettings]);

  const toggleCarryItem = (id: string, maxCount: number) => {
    setCarryItems((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = maxCount;
      return next;
    });
  };

  const setCarryCount = (id: string, count: number) => {
    setCarryItems((prev) => {
      const next = { ...prev };
      if (count <= 0) delete next[id];
      else next[id] = count;
      return next;
    });
  };

  const selectAll = () => {
    const all: Record<string, number> = {};
    items.forEach((i) => { all[i.id] = i.count; });
    setCarryItems(all);
  };
  const selectNone = () => setCarryItems({});

  const totalItems = items.reduce((sum, i) => sum + i.count, 0);

  return (
    <div style={{
      minHeight: "100vh", background: DC.bg, color: DC.text,
      fontFamily: "'DotGothic16', sans-serif",
      padding: "20px 16px",
    }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <Link href="/dungeon" style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 9,
            color: DC.text2, textDecoration: "none",
          }}>
            ← BACK
          </Link>
          <h1 style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 14,
            color: DC.gold, margin: 0,
          }}>
            📦 WAREHOUSE
          </h1>
          <div style={{ width: 50 }} />
        </div>

        {/* Gold + 持ち込みゴールド設定 */}
        <div style={{
          background: DC.bg3, border: `1px solid ${DC.border}`,
          borderRadius: 8, padding: "12px 16px", marginBottom: 16,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: DC.text2 }}>
              GOLD
            </span>
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 16, color: DC.gold }}>
              💰 {gold.toLocaleString()}G
            </span>
          </div>
          {gold > 0 && (
            <div>
              <div style={{ fontSize: 10, color: DC.text2, marginBottom: 4 }}>
                {lang === "en" ? "Carry-in gold:" : "持ち込みゴールド:"}
                <span style={{ color: DC.gold, marginLeft: 6 }}>{carryGold.toLocaleString()}G</span>
              </div>
              <input
                type="range" min={0} max={gold} step={1}
                value={carryGold}
                onChange={(e) => setCarryGold(Number(e.target.value))}
                style={{ width: "100%", accentColor: DC.gold }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: DC.text3, fontFamily: "'Press Start 2P', monospace" }}>
                <span>0G</span>
                <span>{gold.toLocaleString()}G</span>
              </div>
            </div>
          )}
        </div>

        {/* Item count + 一括選択 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 9,
            color: DC.text3,
          }}>
            ITEMS: {totalItems}
          </div>
          {items.length > 0 && (
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={selectAll} style={{
                fontFamily: "'Press Start 2P', monospace", fontSize: 7,
                color: DC.green, background: DC.bg3, border: `1px solid ${DC.green}`,
                padding: "3px 6px", cursor: "pointer", borderRadius: 3,
              }}>
                {lang === "en" ? "ALL" : "全選択"}
              </button>
              <button onClick={selectNone} style={{
                fontFamily: "'Press Start 2P', monospace", fontSize: 7,
                color: DC.text3, background: DC.bg3, border: `1px solid ${DC.border}`,
                padding: "3px 6px", cursor: "pointer", borderRadius: 3,
              }}>
                {lang === "en" ? "NONE" : "全解除"}
              </button>
            </div>
          )}
        </div>

        {/* Items Grid */}
        {items.length === 0 ? (
          <div style={{
            background: DC.bg3, border: `1px solid ${DC.border}`,
            borderRadius: 8, padding: "40px 16px", textAlign: "center",
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
            <div style={{ color: DC.text3, fontSize: 12 }}>
              {lang === "en" ? "Warehouse is empty" : "倉庫は空です"}
            </div>
            <div style={{ color: DC.text3, fontSize: 10, marginTop: 4 }}>
              {lang === "en"
                ? "Clear a dungeon or use Escape Spell to store items"
                : "ダンジョンクリアかエスケープスペルでアイテムを持ち帰ろう"}
            </div>
          </div>
        ) : (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
            gap: 6,
          }}>
            {items.map((item) => {
              const def = ITEMS_DEF.find((d) => d.id === item.id);
              const displayName = def ? itemName(def, lang) : item.name;
              const isSelected = selectedItem?.id === item.id;
              const isCarry = !!carryItems[item.id];
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(isSelected ? null : item)}
                  style={{
                    background: isCarry ? DC.bg4 : DC.bg3,
                    border: `1px solid ${isCarry ? DC.green : isSelected ? DC.accent : DC.border}`,
                    borderRadius: 6, padding: "8px 6px",
                    cursor: "pointer", textAlign: "center",
                    transition: "border-color 0.15s",
                    position: "relative",
                  }}
                >
                  {isCarry && (
                    <div style={{
                      position: "absolute", top: 2, right: 4,
                      fontFamily: "'Press Start 2P', monospace", fontSize: 7,
                      color: DC.green,
                    }}>✓</div>
                  )}
                  <div style={{ fontSize: 20 }}>{item.icon}</div>
                  <div style={{ fontSize: 9, color: DC.text, marginTop: 2, lineHeight: 1.2 }}>
                    {displayName}
                  </div>
                  <div style={{
                    fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                    color: DC.text2, marginTop: 2,
                  }}>
                    x{item.count}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Item Detail + 持ち込みトグル */}
        {selectedItem && (() => {
          const def = ITEMS_DEF.find((d) => d.id === selectedItem.id);
          const isCarry = !!carryItems[selectedItem.id];
          return (
            <div style={{
              background: DC.bg4, border: `1px solid ${DC.accent}40`,
              borderRadius: 8, padding: "12px 14px", marginTop: 12,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 24 }}>{selectedItem.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: "bold" }}>
                    {def ? itemName(def, lang) : selectedItem.name}
                  </div>
                  <div style={{
                    fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                    color: DC.text2,
                  }}>
                    x{selectedItem.count} | {selectedItem.cat}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleCarryItem(selectedItem.id, selectedItem.count); }}
                  style={{
                    fontFamily: "'Press Start 2P', monospace", fontSize: 8,
                    color: isCarry ? "#000" : DC.green,
                    background: isCarry ? DC.green : DC.bg3,
                    border: `1px solid ${DC.green}`,
                    padding: "5px 10px", cursor: "pointer", borderRadius: 4,
                  }}
                >
                  {isCarry
                    ? (lang === "en" ? "CARRY ✓" : "持込 ✓")
                    : (lang === "en" ? "CARRY" : "持込")}
                </button>
              </div>
              <div style={{ fontSize: 11, color: DC.text2, lineHeight: 1.5 }}>
                {def ? itemDesc(def, lang) : selectedItem.desc}
              </div>
              {isCarry && selectedItem.count > 1 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 10, color: DC.text3, marginBottom: 2 }}>
                    {lang === "en" ? "Carry count:" : "持ち込み数:"} {carryItems[selectedItem.id] ?? 0}/{selectedItem.count}
                  </div>
                  <input
                    type="range" min={1} max={selectedItem.count} step={1}
                    value={carryItems[selectedItem.id] ?? selectedItem.count}
                    onChange={(e2) => setCarryCount(selectedItem.id, Number(e2.target.value))}
                    style={{ width: "100%", accentColor: DC.green }}
                  />
                </div>
              )}
            </div>
          );
        })()}

        {/* 持ち込みサマリー */}
        {(Object.keys(carryItems).length > 0 || carryGold > 0) && (
          <div style={{
            marginTop: 12, padding: "10px 12px",
            background: DC.bg2, border: `1px solid ${DC.green}40`,
            borderRadius: 6, fontSize: 10, color: DC.green, lineHeight: 1.6,
          }}>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, marginBottom: 4 }}>
              {lang === "en" ? "CARRY-IN SUMMARY" : "持ち込み設定"}
            </div>
            {carryGold > 0 && <div>💰 {carryGold.toLocaleString()}G</div>}
            {items.filter((i) => !!carryItems[i.id]).map((i) => (
              <div key={i.id}>{i.icon} {i.name} x{carryItems[i.id]}</div>
            ))}
          </div>
        )}

        {/* Info */}
        <div style={{
          marginTop: 20, padding: "10px 12px",
          background: DC.bg2, borderRadius: 6,
          fontSize: 10, color: DC.text3, lineHeight: 1.6,
        }}>
          {lang === "en" ? (
            <>
              <div>• Items and gold are stored when you clear a dungeon</div>
              <div>• Use Escape Spell to bring items back safely</div>
              <div>• Select items and gold to carry into your next adventure</div>
              <div>• Items left in warehouse are safe even if you die</div>
              <div>• If you die, all carried items and gold are lost</div>
            </>
          ) : (
            <>
              <div>• ダンジョンクリア時にアイテムとゴールドが保存されます</div>
              <div>• エスケープスペルで安全にアイテムを持ち帰れます</div>
              <div>• 持ち込むアイテムとゴールドを選んで冒険に出発できます</div>
              <div>• 倉庫に残したアイテムは倒れても安全です</div>
              <div>• 持ち込んだアイテムは倒れると全て失われます</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
