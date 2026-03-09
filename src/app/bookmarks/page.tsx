import { redirect } from "next/navigation";

/**
 * ブックマーク一覧は単語帳（My単語帳）に統合されました。
 * `/word-list` へリダイレクトします。
 */
export default function BookmarksPage() {
  redirect("/word-list");
}
