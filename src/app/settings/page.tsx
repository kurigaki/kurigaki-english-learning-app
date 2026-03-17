"use client";

import { useState } from "react";
import Link from "next/link";
import {
  InQuizSettings,
  loadInQuizSettings,
  saveInQuizSettings,
  loadMyQuizSettings,
  saveMyQuizSettings,
  defaultInQuizSettings,
  AudioMode,
  HintMode,
  TranslationMode,
  SpeakingDifficulty,
  DictationDifficulty,
  AutoAdvanceMode,
} from "@/lib/quiz/in-quiz-settings";

// ── プリセット定義 ────────────────────────────────────────────
const PRESETS: {
  id: string;
  emoji: string;
  name: string;
  description: string;
  tags: string[];
  settings: InQuizSettings;
}[] = [
  {
    id: "beginner",
    emoji: "🟢",
    name: "初心者",
    description: "音声・和訳フル表示でじっくり学習",
    tags: ["音声: 自動", "和訳: 常時", "手動で次へ"],
    settings: {
      ...defaultInQuizSettings,
      readingAudioMode: "auto",
      writingAudioMode: "auto",
      listeningAudioMode: "auto",
      speakingAudioMode: "button",
      listeningTranslationMode: "always",
      writingTranslationMode: "always",
      hintMode: "always",
      speakingDifficulty: "easy",
      dictationDifficulty: "easy",
      autoAdvanceMode: "off",
    },
  },
  {
    id: "balanced",
    emoji: "🟡",
    name: "バランス",
    description: "必要なときだけ確認しながら学習",
    tags: ["音声: 手動", "和訳: ボタン表示", "手動で次へ"],
    settings: { ...defaultInQuizSettings },
  },
  {
    id: "advanced",
    emoji: "🔴",
    name: "上級者",
    description: "和訳でライティング・リスニングは音声だけ",
    tags: ["書き取り: 和訳を見て解答", "リスニング: 1回聞いて解答", "即時次へ"],
    settings: {
      ...defaultInQuizSettings,
      readingAudioMode: "off",
      writingAudioMode: "off",
      listeningAudioMode: "auto",
      speakingAudioMode: "off",
      listeningTranslationMode: "none",
      writingTranslationMode: "always",
      hintMode: "none",
      speakingDifficulty: "strict",
      dictationDifficulty: "strict",
      dictationAudioPlayLimit: null,
      listeningAudioPlayLimit: 1,
      autoAdvanceMode: "instant",
    },
  },
];

// 現在の設定がどのプリセットに一致するか判定
function matchPreset(settings: InQuizSettings): string | null {
  for (const preset of PRESETS) {
    const s = preset.settings;
    if (
      settings.readingAudioMode === s.readingAudioMode &&
      settings.writingAudioMode === s.writingAudioMode &&
      settings.listeningAudioMode === s.listeningAudioMode &&
      settings.speakingAudioMode === s.speakingAudioMode &&
      settings.listeningTranslationMode === s.listeningTranslationMode &&
      settings.writingTranslationMode === s.writingTranslationMode &&
      settings.hintMode === s.hintMode &&
      settings.speakingDifficulty === s.speakingDifficulty &&
      settings.dictationDifficulty === s.dictationDifficulty &&
      settings.dictationAudioPlayLimit === s.dictationAudioPlayLimit &&
      settings.listeningAudioPlayLimit === s.listeningAudioPlayLimit &&
      settings.autoAdvanceMode === s.autoAdvanceMode
    ) {
      return preset.id;
    }
  }
  return null;
}

// ── 汎用コンポーネント ────────────────────────────────────────
function SegmentGroup<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1.5">
      {options.map(({ value: v, label }) => (
        <button
          key={String(v)}
          type="button"
          onClick={() => onChange(v)}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
            value === v
              ? "bg-primary-500 text-white shadow-sm"
              : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-4 border-b border-slate-100 dark:border-slate-700 last:border-0">
      <div className="mb-2.5">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{description}</p>
      </div>
      {children}
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 px-1">
        <span className="emoji-icon">{icon}</span>
        {title}
      </h2>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 px-4">
        {children}
      </div>
    </section>
  );
}

// ── オプション定義 ────────────────────────────────────────────
const AUDIO_OPTIONS: { value: AudioMode; label: string }[] = [
  { value: "off", label: "OFF" },
  { value: "button", label: "手動" },
  { value: "auto", label: "自動" },
];

const TRANSLATION_OPTIONS: { value: TranslationMode; label: string }[] = [
  { value: "none", label: "なし" },
  { value: "reveal", label: "ボタン" },
  { value: "always", label: "常に表示" },
];

const HINT_OPTIONS: { value: HintMode; label: string }[] = [
  { value: "none", label: "なし" },
  { value: "reveal", label: "ボタン" },
  { value: "always", label: "常に表示" },
];

const DIFFICULTY_OPTIONS: { value: SpeakingDifficulty; label: string }[] = [
  { value: "easy", label: "やさしい" },
  { value: "normal", label: "標準" },
  { value: "strict", label: "本格的" },
];

const DICTATION_DIFFICULTY_OPTIONS: { value: DictationDifficulty; label: string }[] = [
  { value: "easy", label: "やさしい" },
  { value: "normal", label: "標準" },
  { value: "strict", label: "本格的" },
];

// ── ページ本体 ────────────────────────────────────────────────
export default function SettingsPage() {
  const [settings, setSettings] = useState<InQuizSettings>(() => loadInQuizSettings());
  const [mySettings, setMySettings] = useState<InQuizSettings | null>(() => loadMyQuizSettings());
  const [savedFeedback, setSavedFeedback] = useState(false);

  const activePreset = matchPreset(settings);

  const apply = (next: InQuizSettings) => {
    setSettings(next);
    saveInQuizSettings(next);
  };

  const update = <K extends keyof InQuizSettings>(key: K, value: InQuizSettings[K]) => {
    apply({ ...settings, [key]: value });
  };

  const handleSaveMySettings = () => {
    saveMyQuizSettings(settings);
    setMySettings({ ...settings });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const timedLabel = `${(settings.autoAdvanceMs / 1000).toFixed(1)}秒後`;

  return (
    <div className="main-content-scroll px-4 py-4 pb-24">
      <div className="max-w-lg mx-auto">

        {/* ヘッダー */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">クイズ設定</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">変更は次のクイズから反映されます</p>
          </div>
        </div>

        {/* プリセット */}
        <section className="mb-6">
          <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 px-1">
            <span className="emoji-icon">⚡</span>
            おすすめ設定
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {/* 3つのプリセット */}
            {PRESETS.map((preset) => {
              const isActive = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => apply(preset.settings)}
                  className={`relative text-left rounded-2xl p-3.5 border-2 transition-all ${
                    isActive
                      ? "border-primary-400 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500"
                      : "border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary-200 dark:hover:border-primary-700"
                  }`}
                >
                  {isActive && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                  <p className="text-base mb-0.5">
                    <span className="emoji-icon">{preset.emoji}</span>
                  </p>
                  <p className={`text-sm font-bold mb-1 ${isActive ? "text-primary-600 dark:text-primary-400" : "text-slate-700 dark:text-slate-200"}`}>
                    {preset.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
                    {preset.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {preset.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                          isActive
                            ? "bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}

            {/* マイ設定カード */}
            <div
              className={`relative rounded-2xl border-2 p-3.5 transition-all ${
                mySettings
                  ? activePreset === null && matchPreset(settings) === null
                    ? "border-accent-400 bg-accent-50 dark:bg-accent-900/20 dark:border-accent-500"
                    : "border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800"
                  : "border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
              }`}
            >
              <p className="text-base mb-0.5">
                <span className="emoji-icon">⭐</span>
              </p>
              <p className={`text-sm font-bold mb-1 ${mySettings ? "text-slate-700 dark:text-slate-200" : "text-slate-400 dark:text-slate-500"}`}>
                マイ設定
              </p>

              {mySettings ? (
                <>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
                    自分用にカスタマイズした設定
                  </p>
                  <button
                    type="button"
                    onClick={() => apply(mySettings)}
                    className="w-full py-1.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-white text-xs font-medium transition-colors mb-1.5"
                  >
                    この設定を使う
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveMySettings}
                    className="w-full py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors"
                  >
                    {savedFeedback ? "✓ 保存しました" : "現在の設定で上書き"}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed mb-2">
                    好みの設定を保存しておくとすぐに呼び出せます
                  </p>
                  <button
                    type="button"
                    onClick={handleSaveMySettings}
                    className="w-full py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors"
                  >
                    {savedFeedback ? "✓ 保存しました" : "現在の設定を保存"}
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* 音声設定 */}
        <Section title="音声設定" icon="🔊">
          <SettingRow
            label="英語→日本語"
            description="英単語が表示される問題での音声再生。「自動」にすると問題表示時に自動で読み上げます。"
          >
            <SegmentGroup
              options={AUDIO_OPTIONS}
              value={settings.readingAudioMode}
              onChange={(v) => update("readingAudioMode", v)}
            />
          </SettingRow>

          <SettingRow
            label="日本語→英語・書き取り"
            description="日本語から英語を答える問題や書き取り問題での音声再生。「自動」で例文を自動読み上げします。"
          >
            <SegmentGroup
              options={AUDIO_OPTIONS}
              value={settings.writingAudioMode}
              onChange={(v) => update("writingAudioMode", v)}
            />
            {settings.writingAudioMode === "off" && settings.writingTranslationMode === "none" && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2.5">
                ℹ️ 音声がOFFのため、書き取り問題では和訳を自動表示します。
              </p>
            )}
            {settings.writingAudioMode !== "off" && settings.writingTranslationMode === "none" && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2.5">
                🎧 書き取りの和訳がOFFのため、音声を自動再生します（聞いて書き取る練習）。
              </p>
            )}
          </SettingRow>

          <SettingRow
            label="リスニング"
            description="例文のリスニング問題での音声再生。「自動」推奨：問題表示と同時に例文が流れます。"
          >
            <SegmentGroup
              options={AUDIO_OPTIONS}
              value={settings.listeningAudioMode}
              onChange={(v) => update("listeningAudioMode", v)}
            />
          </SettingRow>

          <SettingRow
            label="スピーキング"
            description="スピーキング問題でのお手本音声。「自動」にすると問題表示時に正解の発音を流します。"
          >
            <SegmentGroup
              options={AUDIO_OPTIONS}
              value={settings.speakingAudioMode}
              onChange={(v) => update("speakingAudioMode", v)}
            />
          </SettingRow>
        </Section>

        {/* 表示設定 */}
        <Section title="表示設定" icon="👁">
          <SettingRow
            label="リスニングの和訳"
            description="リスニング問題での例文和訳の表示。「なし」にすると音声だけで問題を解くことができます。"
          >
            <SegmentGroup
              options={TRANSLATION_OPTIONS}
              value={settings.listeningTranslationMode}
              onChange={(v) => update("listeningTranslationMode", v)}
            />
          </SettingRow>

          <SettingRow
            label="書き取りの和訳"
            description="書き取り問題での例文和訳の表示。「常に表示」にすると和訳を見ながら英語を書き取ることができます。"
          >
            <SegmentGroup
              options={TRANSLATION_OPTIONS}
              value={settings.writingTranslationMode}
              onChange={(v) => update("writingTranslationMode", v)}
            />
          </SettingRow>

          <SettingRow
            label="スピーキングのヒント"
            description="スピーキング問題で答えの英単語をヒントとして表示します。「ボタン」はタップした時だけ表示。"
          >
            <SegmentGroup
              options={HINT_OPTIONS}
              value={settings.hintMode}
              onChange={(v) => update("hintMode", v)}
            />
          </SettingRow>
        </Section>

        {/* リスニング */}
        <Section title="リスニング" icon="🎧">
          <SettingRow
            label="音声の再生回数"
            description="問題ごとに音声を聞ける回数の上限。「1回」にすると一度だけ聞いて正解を選ぶ集中練習ができます。"
          >
            <div className="flex gap-1.5">
              {([null, 1, 2, 3] as (number | null)[]).map((count) => (
                <button
                  key={String(count)}
                  type="button"
                  onClick={() => update("listeningAudioPlayLimit", count)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                    settings.listeningAudioPlayLimit === count
                      ? "bg-primary-500 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }`}
                >
                  {count === null ? "無制限" : `${count}回`}
                </button>
              ))}
            </div>
            {settings.listeningAudioPlayLimit === 1 && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2.5">
                💡 1回だけ聞いて答えるモードです。集中して聴き取る練習に最適です。
              </p>
            )}
          </SettingRow>
        </Section>

        {/* 書き取り */}
        <Section title="書き取り" icon="✏️">
          <SettingRow
            label="音声の再生回数"
            description="問題ごとに音声を聞ける回数の上限。「1回」にすると一度だけ聞いて書き取る練習ができます。"
          >
            <div className="flex gap-1.5">
              {([null, 1, 2, 3] as (number | null)[]).map((count) => (
                <button
                  key={String(count)}
                  type="button"
                  onClick={() => update("dictationAudioPlayLimit", count)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                    settings.dictationAudioPlayLimit === count
                      ? "bg-primary-500 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }`}
                >
                  {count === null ? "無制限" : `${count}回`}
                </button>
              ))}
            </div>
            {settings.dictationAudioPlayLimit === 1 && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2.5">
                💡 1回だけ音声を聞いて答えるモードです。聴き取り重視の練習に最適です。
              </p>
            )}
          </SettingRow>

          <SettingRow
            label="タイポ許容（ファジーマッチ）"
            description="書き取り回答の判定の厳しさを設定します。「やさしい」は多少のスペルミスも正解にします。"
          >
            <SegmentGroup
              options={DICTATION_DIFFICULTY_OPTIONS}
              value={settings.dictationDifficulty}
              onChange={(v) => update("dictationDifficulty", v)}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2.5">
              {settings.dictationDifficulty === "easy" && "🟢 4文字以上で1文字・8文字以上で2文字のミスを許容。アポストロフィは無視 (it's → its)。"}
              {settings.dictationDifficulty === "normal" && "🟡 5文字以上の単語で1文字のミスまで許容。短い単語は完全一致。"}
              {settings.dictationDifficulty === "strict" && "🔴 大文字・小文字を除いて完全一致のみ正解。スペルミスは不正解。"}
            </p>
          </SettingRow>
        </Section>

        {/* スピーキング */}
        <Section title="スピーキング" icon="🎤">
          <SettingRow
            label="認識の厳しさ"
            description="音声認識で回答判定する際の厳しさを設定します。"
          >
            <SegmentGroup
              options={DIFFICULTY_OPTIONS}
              value={settings.speakingDifficulty}
              onChange={(v) => update("speakingDifficulty", v)}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2.5">
              {settings.speakingDifficulty === "easy" && "🟢 多少の発音のずれも正解として認識します。初心者向け。"}
              {settings.speakingDifficulty === "normal" && "🟡 発音が近ければ正解として認識します。標準的な難易度。"}
              {settings.speakingDifficulty === "strict" && "🔴 完全一致のみ正解。ネイティブに近い発音が求められます。"}
            </p>
          </SettingRow>
        </Section>

        {/* 自動操作 */}
        <Section title="自動操作" icon="⏩">
          <SettingRow
            label="回答後に自動で次へ進む"
            description="正解・不正解が表示された後、自動的に次の問題へ移ります。「手動」は自分でタップして進みます。"
          >
            <SegmentGroup
              options={[
                { value: "off" as AutoAdvanceMode, label: "手動" },
                { value: "timed" as AutoAdvanceMode, label: settings.autoAdvanceMode === "timed" ? timedLabel : "秒数設定" },
                { value: "instant" as AutoAdvanceMode, label: "即時" },
              ]}
              value={settings.autoAdvanceMode}
              onChange={(v) => update("autoAdvanceMode", v)}
            />
            {settings.autoAdvanceMode === "timed" && (
              <div className="flex items-center gap-3 mt-3">
                <input
                  type="range"
                  min={500}
                  max={5000}
                  step={500}
                  value={settings.autoAdvanceMs}
                  onChange={(e) => update("autoAdvanceMs", parseInt(e.target.value))}
                  className="flex-1 accent-primary-500"
                />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 w-14 text-right tabular-nums">
                  {(settings.autoAdvanceMs / 1000).toFixed(1)} 秒
                </span>
              </div>
            )}
            {settings.autoAdvanceMode === "instant" && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2.5">
                ⚠️ 解説が表示される前に次の問題へ進みます
              </p>
            )}
          </SettingRow>
        </Section>

      </div>
    </div>
  );
}
