# Supabase セットアップガイド

このドキュメントでは、英語学習アプリでSupabaseを使用するためのセットアップ手順を説明します。

## 前提条件

- [Supabase](https://supabase.com) アカウント
- Supabaseプロジェクト（作成済み）

## セットアップ手順

### 1. 環境変数の設定

`.env.local` ファイルに以下の環境変数を設定してください：

```bash
# Supabase Project URL
# Settings > API > Project URL から取得
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase Anon Key
# Settings > API > anon public から取得
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. データベーステーブルの作成

Supabaseダッシュボードの **SQL Editor** で、`migrations/001_initial_schema.sql` の内容を実行してください。

#### 手順：
1. [Supabaseダッシュボード](https://app.supabase.com) にログイン
2. プロジェクトを選択
3. 左メニューから **SQL Editor** をクリック
4. **New query** をクリック
5. `migrations/001_initial_schema.sql` の内容をコピー＆ペースト
6. **Run** をクリック

### 3. 認証設定（オプション）

Supabaseダッシュボードで認証プロバイダーを設定できます：

1. **Authentication** > **Providers** に移動
2. 使用したいプロバイダーを有効化（Email, Google, GitHub など）

### 作成されるテーブル

| テーブル名 | 説明 |
|------------|------|
| `profiles` | ユーザープロフィール |
| `user_data` | レベル、XP、ストリークなどのユーザーデータ |
| `learning_records` | 学習記録（回答履歴） |
| `unlocked_achievements` | 解除済み実績 |
| `speed_challenge_results` | スピードチャレンジの結果 |
| `bookmarks` | ブックマークした単語 |

### Row Level Security (RLS)

すべてのテーブルにRLSが設定されています。ユーザーは自分のデータのみにアクセスできます。

## トラブルシューティング

### 「API Error: Connection error.」が表示される場合

1. **テーブルが作成されているか確認**
   - Supabaseダッシュボードの **Table Editor** でテーブルが存在するか確認
   - 存在しない場合は、上記「データベーステーブルの作成」の手順を実行

2. **環境変数が正しく設定されているか確認**
   - `.env.local` ファイルの `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を確認

3. **プロジェクトがアクティブか確認**
   - 無料プランのプロジェクトは、一定期間使用しないとpauseされることがあります
   - Supabaseダッシュボードでプロジェクトの状態を確認し、必要に応じてresumeしてください

### localStorageへのフォールバック

Supabaseへの接続に失敗した場合、アプリは自動的にlocalStorageを使用します。
データはブラウザに保存されますが、端末間での同期はできません。

## Supabase なしで使用する場合

環境変数を設定しなければ、アプリはlocalStorageのみを使用して動作します。
認証機能は無効になりますが、学習機能は問題なく使用できます。
