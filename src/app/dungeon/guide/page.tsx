"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { ITEMS_DEF, ENEMIES_DEF, SHOPKEEPER_DEF } from "@/lib/dungeon/constants";
import { getDungeonLang, itemName as iName, itemDesc as iDesc, type DungeonLang } from "@/lib/dungeon/i18n";
import { drawEnemySpriteForQuiz } from "@/lib/dungeon/renderer";
import type { Enemy } from "@/lib/dungeon/types";

const DC = {
  bg: "#09090f", bg2: "#111118", bg3: "#181825", bg4: "#1f1f30",
  border: "#2a2a45", accent: "#7c6af7", gold: "#f5c842", green: "#52d47a",
  text: "#ddddf5", text2: "#9090b8", text3: "#606080",
};

type Tab = "guide" | "items" | "enemies";

export default function GuidePage() {
  const [tab, setTab] = useState<Tab>("guide");
  const [lang, setLang] = useState<DungeonLang>("ja");
  useEffect(() => { setLang(getDungeonLang()); }, []);
  const en = lang === "en";

  const tabStyle = (t: Tab) => ({
    fontFamily: "'Press Start 2P', monospace", fontSize: 9,
    color: tab === t ? "#000" : DC.text2,
    background: tab === t ? DC.gold : DC.bg3,
    border: `1px solid ${tab === t ? DC.gold : DC.border}`,
    padding: "6px 10px", cursor: "pointer", borderRadius: "4px 4px 0 0",
    flex: 1, textAlign: "center" as const,
  });

  return (
    <div style={{
      minHeight: "100vh", background: DC.bg, color: DC.text,
      fontFamily: "'DotGothic16', sans-serif", padding: "20px 16px",
    }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Link href="/dungeon" style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 9,
            color: DC.text2, textDecoration: "none",
          }}>← BACK</Link>
          <h1 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 12, color: DC.gold, margin: 0 }}>
            📖 GUIDE
          </h1>
          <div style={{ width: 50 }} />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, marginBottom: 0 }}>
          <div style={tabStyle("guide")} onClick={() => setTab("guide")}>{en ? "How to Play" : "あそびかた"}</div>
          <div style={tabStyle("items")} onClick={() => setTab("items")}>{en ? "Items" : "アイテム図鑑"}</div>
          <div style={tabStyle("enemies")} onClick={() => setTab("enemies")}>{en ? "Enemies" : "敵図鑑"}</div>
        </div>

        <div style={{
          background: DC.bg2, border: `1px solid ${DC.border}`, borderTop: "none",
          borderRadius: "0 0 8px 8px", padding: "16px 14px",
          fontSize: 13, lineHeight: 1.8, color: DC.text,
        }}>
          {tab === "guide" && <GuideContent lang={lang} />}
          {tab === "items" && <ItemsContent lang={lang} />}
          {tab === "enemies" && <EnemiesContent lang={lang} />}
        </div>
      </div>
    </div>
  );
}

function EnemyPixelIcon({ name, icon }: { name: string; icon: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cvs = ref.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, 32, 32);
    const fakeEnemy = { name, icon, x: 0, y: 0, hp: 1, mhp: 1, atk: 1, exp: 0, floor: 1, sleepChance: 0, id: 0, alert: false, sleeping: false, confused: 0, sealed: 0, wanderTarget: null, lastDx: undefined, lastDy: undefined, stuckCount: 0 } as Enemy;
    drawEnemySpriteForQuiz(ctx, fakeEnemy, 0, 0);
  }, [name, icon]);
  return <canvas ref={ref} width={32} height={32} style={{ width: 28, height: 28, imageRendering: "pixelated", flexShrink: 0 }} />;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontFamily: "'Press Start 2P', monospace", fontSize: 9,
        color: DC.gold, marginBottom: 8, borderBottom: `1px solid ${DC.border}`,
        paddingBottom: 4,
      }}>{title}</div>
      {children}
    </div>
  );
}

function GuideContent({ lang }: { lang: DungeonLang }) {
  const en = lang === "en";
  return (
    <>
      <Section title={en ? "Objective" : "ゲームの目標"}>
        <p>{en ? "Reach the stairs on B5F to clear the dungeon!" : "地下5階（B5F）の階段を降りればクリア！"}</p>
        <p>{en ? "Attack adjacent enemies to trigger an English quiz. Correct answers give higher accuracy!" : "敵に隣接して攻撃すると英語クイズが出題されます。正解すると高い命中率でダメージを与えられます。"}</p>
      </Section>

      <Section title={en ? "Controls" : "基本操作"}>
        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
          <tbody>
            {(en ? [
              ["D-pad", "Move (4 or 8 directions)"],
              ["Atk/Talk", "Attack adjacent enemy · Talk to Shopkeeper"],
              ["Wait", "Wait 1 turn in place (recovers HP)"],
              ["Dash", "Run in the direction you're facing"],
              ["Arrow", "Ranged attack in a straight line"],
              ["Feet", "Pick up items · Use stairs"],
              ["Items", "Use, throw, or drop items"],
              ["Look", "View the dungeon map"],
            ] : [
              ["十字キー", "移動（4方向 or 8方向）"],
              ["攻撃/話す", "隣の敵に攻撃・店主と会話"],
              ["足踏み", "その場で1ターン待機（HP回復）"],
              ["ダッシュ", "向いている方向に高速移動"],
              ["弓矢", "直線上の敵に遠距離攻撃"],
              ["足元", "足元のアイテムを拾う・階段を降りる"],
              ["持ち物", "アイテムを使う・投げる・置く"],
              ["見渡す", "周囲の状況を確認"],
            ]).map(([key, desc]) => (
              <tr key={key} style={{ borderBottom: `1px solid ${DC.border}` }}>
                <td style={{ padding: "4px 6px", color: DC.gold, fontSize: 11, whiteSpace: "nowrap" }}>{key}</td>
                <td style={{ padding: "4px 6px", color: DC.text2 }}>{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title={en ? "Item Types" : "アイテムの種類"}>
        {en ? (<>
          <p>🌿 <b>Word (Grass)</b> — Drink for self-effect. Throw at enemies for targeted effect.</p>
          <p>📜 <b>Spell (Scroll)</b> — Read to affect the floor or nearby area.</p>
          <p>🪶 <b>Bolt (Wand)</b> — Swing to hit enemies in a straight line. Limited charges.</p>
          <p>🍙 <b>Food</b> — Eat to restore Stamina. Don&apos;t starve!</p>
          <p>🫙 <b>Pot (Jar)</b> — Store up to 3 items inside.</p>
          <p>🏹 <b>Arrow</b> — Ranged straight-line attack.</p>
        </>) : (<>
          <p>🌿 <b>ワード（草）</b> — 飲むと自分に効果。投げると敵に効果。</p>
          <p>📜 <b>スペル（巻物）</b> — 読むとフロア全体や周囲に効果。</p>
          <p>🪶 <b>ボルト（杖）</b> — 振ると直線上の敵に効果。回数制限あり。</p>
          <p>🍙 <b>フード（食料）</b> — 食べるとスタミナ回復。飢え死に注意！</p>
          <p>🫙 <b>ポット（壷）</b> — アイテムを3つまで収納できる。</p>
          <p>🏹 <b>アロー（矢）</b> — 遠くの敵に直線攻撃。</p>
        </>)}
      </Section>

      <Section title={en ? "Shop" : "ショップ"}>
        {en ? (<>
          <p>Shops may appear from B2F onward.</p>
          <p>1. Press Feet to pick up an item</p>
          <p>2. Talk to the Shopkeeper to buy (confirmation dialog)</p>
          <p>3. Drop unwanted items to return them to the shelf</p>
          <p>💡 Move the Shopkeeper with wands or grass to steal — but Guardians will appear!</p>
        </>) : (<>
          <p>B2F以降にショップが出現することがあります。</p>
          <p>1. 足元ボタンでアイテムを手に取る</p>
          <p>2. 店主に話しかけて購入（確認ダイアログあり）</p>
          <p>3. 不要なら「置く」で商品を戻せる</p>
          <p>💡 店主を杖や草で動かしてから逃げると泥棒できるが、ガーディアンが出現！</p>
        </>)}
      </Section>

      <Section title={en ? "Stamina" : "スタミナ（満腹度）"}>
        {en ? (<>
          <p>Stamina decreases as turns pass.</p>
          <p>⚠️ At 0 Stamina, your HP drains every turn!</p>
          <p>⚠️ You cannot dash with 0 Stamina.</p>
          <p>🍙 Use Food or Words (grass) to restore Stamina.</p>
        </>) : (<>
          <p>ターン経過でスタミナが減少します。</p>
          <p>⚠️ スタミナが0になるとHP が減り続けます！</p>
          <p>⚠️ スタミナ0ではダッシュできません。</p>
          <p>🍙 フードやワード（草）を使ってスタミナを回復しましょう。</p>
        </>)}
      </Section>

      <Section title={en ? "When Defeated" : "倒れた場合"}>
        {en ? (<>
          <p>If your HP reaches 0, the adventure ends. All items and gold are lost.</p>
          <p>📜 Use an Escape Spell to return safely with your items and gold.</p>
          <p>📦 Items stored in the Warehouse are safe. Choose what to bring on your next run.</p>
        </>) : (<>
          <p>HPが0になると冒険失敗。アイテムとゴールドを全て失います。</p>
          <p>📜 エスケープスペルを使えばアイテムとゴールドを持って帰還できます。</p>
          <p>📦 倉庫に預けたアイテムは安全です。次の冒険に選んで持ち込めます。</p>
        </>)}
      </Section>

      <Section title={en ? "Status Effects" : "状態異常"}>
        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
          <tbody>
            {(en ? [
              ["💤 Sleep", "Cannot act for several turns"],
              ["😵 Confused", "Moves in random directions"],
              ["🔒 Sealed", "Cannot act for several turns"],
              ["🐌 Slowed", "Can only act every other turn"],
              ["⚡ Haste", "Acts twice per turn"],
              ["💪 Power Up", "Next attack is a critical hit"],
              ["🎯 Sure Hit", "Next attack never misses"],
            ] : [
              ["💤 眠り", "数ターン行動不能"],
              ["😵 混乱", "ランダム方向に移動"],
              ["🔒 封印", "数ターン行動不能"],
              ["🐌 鈍足", "2ターンに1回しか動けない"],
              ["⚡ 倍速", "1ターンに2回行動できる"],
              ["💪 パワーアップ", "次の攻撃が会心の一撃"],
              ["🎯 必中", "次の攻撃が必ず命中"],
            ]).map(([name, desc]) => (
              <tr key={name} style={{ borderBottom: `1px solid ${DC.border}` }}>
                <td style={{ padding: "4px 6px", color: DC.gold, whiteSpace: "nowrap" }}>{name}</td>
                <td style={{ padding: "4px 6px", color: DC.text2 }}>{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </>
  );
}

function ItemsContent({ lang }: { lang: DungeonLang }) {
  const en = lang === "en";
  const categories = en ? [
    { id: "grass", label: "🌿 Word (Grass)" },
    { id: "scroll", label: "📜 Spell (Scroll)" },
    { id: "cane", label: "🪶 Bolt (Wand)" },
    { id: "food", label: "🍙 Food" },
    { id: "jar", label: "🫙 Pot (Jar)" },
    { id: "special", label: "✨ Special" },
  ] : [
    { id: "grass", label: "🌿 ワード（草）" },
    { id: "scroll", label: "📜 スペル（巻物）" },
    { id: "cane", label: "🪶 ボルト（杖）" },
    { id: "food", label: "🍙 フード（食料）" },
    { id: "jar", label: "🫙 ポット（壷）" },
    { id: "special", label: "✨ スペシャル" },
  ];

  return (
    <>
      {categories.map((cat) => {
        const items = ITEMS_DEF.filter((d) => d.cat === cat.id);
        if (items.length === 0) return null;
        return (
          <Section key={cat.id} title={cat.label}>
            {items.map((item) => (
              <div key={item.id} style={{
                display: "flex", gap: 8, alignItems: "flex-start",
                padding: "6px 0", borderBottom: `1px solid ${DC.border}20`,
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: "bold" }}>{iName(item, lang)}</div>
                  <div style={{ fontSize: 10, color: DC.text3 }}>{en ? item.name : item.nameEn}</div>
                  <div style={{ fontSize: 11, color: DC.text2, marginTop: 2 }}>{iDesc(item, lang)}</div>
                </div>
              </div>
            ))}
          </Section>
        );
      })}
    </>
  );
}

function EnemiesContent({ lang }: { lang: DungeonLang }) {
  const en = lang === "en";
  return (
    <>
      <Section title={en ? "Shopkeeper" : "店主"}>
        <div style={{ display: "flex", gap: 8, padding: "6px 0" }}>
          <span style={{ fontSize: 18 }}>🧔</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: "bold" }}>{SHOPKEEPER_DEF.name}</div>
            <div style={{ fontSize: 11, color: DC.text2 }}>HP:{SHOPKEEPER_DEF.mhp} ATK:{SHOPKEEPER_DEF.atk}</div>
            <div style={{ fontSize: 11, color: DC.text2 }}>{en ? "Shop guard. Attacks or theft make them hostile (double speed)" : "ショップの番人。攻撃や泥棒をすると敵化（倍速）"}</div>
          </div>
        </div>
      </Section>

      {[1, 2, 3, 4, 5].map((floor) => {
        const enemies = ENEMIES_DEF.filter((e) => e.floor === floor);
        return (
          <Section key={floor} title={en ? `B${floor}F Enemies` : `B${floor}F の敵`}>
            {enemies.map((e) => (
              <div key={e.name} style={{
                display: "flex", gap: 8, alignItems: "center",
                padding: "6px 0", borderBottom: `1px solid ${DC.border}20`,
              }}>
                <EnemyPixelIcon name={e.name} icon={e.icon} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: "bold" }}>{e.name}</div>
                  <div style={{ display: "flex", gap: 12, fontSize: 10, color: DC.text2, marginTop: 2 }}>
                    <span>HP:{e.mhp}</span>
                    <span>ATK:{e.atk}</span>
                    <span>EXP:{e.exp}</span>
                  </div>
                </div>
              </div>
            ))}
          </Section>
        );
      })}

      <Section title={en ? "Theft Guardians" : "泥棒時の敵"}>
        <div style={{
          display: "flex", gap: 8, alignItems: "center",
          padding: "6px 0", borderBottom: `1px solid ${DC.border}20`,
        }}>
          <EnemyPixelIcon name="ガーディアン" icon="🛡️" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: "bold" }}>{en ? "Guardian" : "ガーディアン"}</div>
            <div style={{ display: "flex", gap: 12, fontSize: 10, color: DC.text2, marginTop: 2 }}>
              <span>HP:70</span><span>ATK:15</span>
            </div>
            <div style={{ fontSize: 10, color: DC.text3, marginTop: 1 }}>
              {en ? "Appears when stealing. Blocks corridor entrances." : "泥棒時に廊下入口に出現。逃げ道を塞ぐ。"}
            </div>
          </div>
        </div>
        <div style={{
          display: "flex", gap: 8, alignItems: "center",
          padding: "6px 0", borderBottom: `1px solid ${DC.border}20`,
        }}>
          <EnemyPixelIcon name="センチネル" icon="⚔️" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: "bold" }}>{en ? "Sentinel" : "センチネル"}</div>
            <div style={{ display: "flex", gap: 12, fontSize: 10, color: DC.text2, marginTop: 2 }}>
              <span>HP:90</span><span>ATK:18</span>
            </div>
            <div style={{ fontSize: 10, color: DC.text3, marginTop: 1 }}>
              {en ? "Elite guardian. Appears on deeper floors when stealing." : "上位ガーディアン。深い階層の泥棒時に出現。"}
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
