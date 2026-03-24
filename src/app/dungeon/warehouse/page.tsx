"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    setItems(storage.getWarehouse());
    setGold(storage.getGoldBank());
    setLang(getDungeonLang());
  }, []);

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

        {/* Gold */}
        <div style={{
          background: DC.bg3, border: `1px solid ${DC.border}`,
          borderRadius: 8, padding: "12px 16px", marginBottom: 16,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: DC.text2 }}>
            GOLD
          </span>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 16, color: DC.gold }}>
            💰 {gold.toLocaleString()}G
          </span>
        </div>

        {/* Item count */}
        <div style={{
          fontFamily: "'Press Start 2P', monospace", fontSize: 9,
          color: DC.text3, marginBottom: 8,
        }}>
          ITEMS: {totalItems}
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
                : "ダンジョンクリアか脱出スペルでアイテムを持ち帰ろう"}
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
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(isSelected ? null : item)}
                  style={{
                    background: isSelected ? DC.bg4 : DC.bg3,
                    border: `1px solid ${isSelected ? DC.accent : DC.border}`,
                    borderRadius: 6, padding: "8px 6px",
                    cursor: "pointer", textAlign: "center",
                    transition: "border-color 0.15s",
                  }}
                >
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

        {/* Item Detail */}
        {selectedItem && (() => {
          const def = ITEMS_DEF.find((d) => d.id === selectedItem.id);
          return (
            <div style={{
              background: DC.bg4, border: `1px solid ${DC.accent}40`,
              borderRadius: 8, padding: "12px 14px", marginTop: 12,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 24 }}>{selectedItem.icon}</span>
                <div>
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
              </div>
              <div style={{ fontSize: 11, color: DC.text2, lineHeight: 1.5 }}>
                {def ? itemDesc(def, lang) : selectedItem.desc}
              </div>
            </div>
          );
        })()}

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
              <div>• Stored items are automatically brought into your next adventure</div>
              <div>• If you die, all items and gold are lost</div>
            </>
          ) : (
            <>
              <div>• ダンジョンクリア時にアイテムとゴールドが保存されます</div>
              <div>• エスケープスペルで安全にアイテムを持ち帰れます</div>
              <div>• 保存したアイテムは次の冒険に自動で持ち込まれます</div>
              <div>• 倒れた場合、アイテムとゴールドは全て失われます</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
