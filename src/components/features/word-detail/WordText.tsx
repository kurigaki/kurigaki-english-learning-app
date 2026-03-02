import Link from "next/link";
import { findWordId } from "@/lib/word-lookup";

type WordTextProps = {
  text: string;
  currentWord: string;
};

/**
 * テキスト内の英単語を解析し、以下のように表示：
 * - 現在学習中の単語 → 青色（アンダーラインなし）
 * - 語彙DBに存在する他の単語 → クリック可能なリンク（点線アンダーライン）
 * - その他のテキスト → プレーンテキスト
 */
export const WordText = ({ text, currentWord }: WordTextProps) => {
  const regex = /([a-zA-Z]+(?:'[a-zA-Z]+)*)|([^a-zA-Z]+)/g;
  const parts: React.ReactNode[] = [];
  let match: RegExpExecArray | null;
  let i = 0;

  regex.lastIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    const englishToken = match[1];
    const otherToken = match[2];

    if (englishToken !== undefined) {
      if (englishToken.toLowerCase() === currentWord.toLowerCase()) {
        // 現在の単語: 青色のみ（アンダーラインなし）
        parts.push(
          <span key={i} className="text-blue-600 dark:text-blue-400 font-medium">
            {englishToken}
          </span>
        );
      } else {
        const wordId = findWordId(englishToken);
        if (wordId !== null) {
          // 語彙DBにある単語: リンク + 点線アンダーライン
          parts.push(
            <Link
              key={i}
              href={`/word/${wordId}`}
              className="text-primary-600 dark:text-primary-400 border-b border-dashed border-primary-600 dark:border-primary-400 hover:opacity-70 transition-opacity"
            >
              {englishToken}
            </Link>
          );
        } else {
          // DB未登録の英単語: プレーン
          parts.push(<span key={i}>{englishToken}</span>);
        }
      }
    } else {
      // 英語以外（日本語・記号・空白など）: プレーン
      parts.push(<span key={i}>{otherToken}</span>);
    }

    i++;
  }

  return <>{parts}</>;
};
