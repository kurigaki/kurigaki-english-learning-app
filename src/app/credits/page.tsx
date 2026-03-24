import Link from "next/link";

export default function CreditsPage() {
  return (
    <div className="main-content-scroll px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-primary-500 transition-colors"
          >
            ← ホームへ
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          クレジット
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          本アプリで使用している音楽・素材の著作権表記
        </p>

        {/* BGM */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <span className="emoji-icon">🎵</span>
            <span>BGM（バックグラウンドミュージック）</span>
          </h2>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
            {/* WORD DUNGEON BGM */}
            <div className="p-5">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    WORD DUNGEON BGM
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    使用場面: ダンジョン探索中
                  </p>
                </div>
              </div>
              <dl className="mt-3 space-y-1.5 text-sm">
                <div className="flex gap-2">
                  <dt className="text-slate-500 dark:text-slate-400 shrink-0 w-16">曲名</dt>
                  <dd className="text-slate-800 dark:text-slate-200">
                    カナリアスキップ
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-slate-500 dark:text-slate-400 shrink-0 w-16">作曲者</dt>
                  <dd className="text-slate-800 dark:text-slate-200">
                    まんぼう二等兵
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-slate-500 dark:text-slate-400 shrink-0 w-16">配布元</dt>
                  <dd>
                    <a
                      href="https://dova-s.jp/bgm/detail/6391"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 dark:text-primary-400 hover:underline break-all"
                    >
                      DOVA-SYNDROME（フリーBGM素材）
                    </a>
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-slate-500 dark:text-slate-400 shrink-0 w-16">ライセンス</dt>
                  <dd className="text-slate-800 dark:text-slate-200">
                    DOVA-SYNDROME 利用規約に準拠
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* SFX */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <span className="emoji-icon">🔊</span>
            <span>効果音（SE）</span>
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
              ダンジョン効果音は Web Audio API によるオリジナル生成音と、MP3ファイルの二重構成です。
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              MP3ファイルが利用できない環境ではオシレーター合成音にフォールバックします。
            </p>
          </div>
        </section>

        {/* フォント */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <span className="emoji-icon">✒️</span>
            <span>フォント</span>
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
            <div className="p-4">
              <p className="font-medium text-slate-800 dark:text-slate-200">Press Start 2P</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">CodeMan38 / Google Fonts / SIL Open Font License 1.1</p>
            </div>
            <div className="p-4">
              <p className="font-medium text-slate-800 dark:text-slate-200">DotGothic16</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Fontworks / Google Fonts / SIL Open Font License 1.1</p>
            </div>
          </div>
        </section>

        <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
          素材提供者の皆さまに感謝いたします。
        </p>
      </div>
    </div>
  );
}
