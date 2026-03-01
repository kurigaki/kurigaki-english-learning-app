# English Learning App

TOEIC基礎単語を楽しく学べる英語学習アプリ。ゲーミフィケーション要素を取り入れた一人プレイ向けのMVPです。

## Features

- **3種類のクイズ形式**: 英語→日本語 / 日本語→英語 / 穴埋め問題
- **スピードチャレンジ**: 30秒間で何問正解できるかに挑戦
- **ゲーミフィケーション**: XP・レベル・ストリーク・実績システム
- **苦手単語管理**: 正答率の低い単語を自動抽出・集中復習
- **音声読み上げ**: Web Speech APIによる発音確認
- **単語詳細画面**: 例文・類義語・コラムによる深い学習

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **State**: React State + localStorage
- **Audio**: Web Speech API
- **Images**: Unsplash (placeholder)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
src/
├── app/                  # Next.js pages
├── components/
│   ├── ui/              # Reusable UI components
│   └── features/        # Feature-specific components
├── lib/                 # Utilities (audio, storage, image)
├── data/                # Static data (words, achievements)
└── types/               # TypeScript type definitions
```

## Documentation

- [CLAUDE.md](./CLAUDE.md) - Development guide
- [docs/design.md](./docs/design.md) - Design specifications
- [docs/vocabulary-policy.md](./docs/vocabulary-policy.md) - Vocabulary coverage and data quality policy

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Notes

- This is a personal learning project (MVP)
- No user authentication (single-player)
- Data is stored in browser localStorage
- Images from [Unsplash](https://unsplash.com) (free for non-commercial use)
