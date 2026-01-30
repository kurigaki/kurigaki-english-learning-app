import { getSupabaseClient } from "./client";

const AVATAR_BUCKET = "avatars";

/**
 * アバター画像をアップロード
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { url: null, error: "Supabaseが利用できません" };
  }

  // ファイルサイズチェック (2MB制限)
  const MAX_SIZE = 2 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return { url: null, error: "ファイルサイズは2MB以下にしてください" };
  }

  // ファイル形式チェック
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return {
      url: null,
      error: "対応形式: JPEG, PNG, GIF, WebP",
    };
  }

  // ファイル名を生成
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/avatar.${fileExt}`;

  try {
    console.log("[Storage] アップロード開始:", fileName);

    // タイムアウト付きでアップロード
    const uploadPromise = (async () => {
      // 既存のファイルを削除（エラーは無視、タイムアウトも無視）
      try {
        await Promise.race([
          supabase.storage.from(AVATAR_BUCKET).remove([fileName]),
          new Promise((_, reject) => setTimeout(() => reject(new Error("削除タイムアウト")), 3000))
        ]);
        console.log("[Storage] 既存ファイル削除完了");
      } catch (e) {
        console.log("[Storage] 既存ファイル削除スキップ:", e);
      }

      // 新しいファイルをアップロード
      console.log("[Storage] ファイルアップロード中...");
      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });
      console.log("[Storage] アップロード完了, エラー:", uploadError);
      return uploadError;
    })();

    // 全体で10秒のタイムアウト
    const uploadError = await Promise.race([
      uploadPromise,
      new Promise<Error>((_, reject) =>
        setTimeout(() => reject(new Error("アップロードがタイムアウトしました")), 10000)
      )
    ]);

    if (uploadError) {
      console.error("アップロードエラー:", uploadError);
      // より詳細なエラーメッセージを返す
      if (uploadError.message?.includes("Bucket not found")) {
        return { url: null, error: "ストレージが設定されていません（avatarsバケットが必要です）" };
      }
      if (uploadError.message?.includes("row-level security") || uploadError.message?.includes("policy")) {
        return { url: null, error: "アップロード権限がありません（ストレージポリシーを確認してください）" };
      }
      if (uploadError.message?.includes("Invalid JWT") || uploadError.message?.includes("not authenticated")) {
        return { url: null, error: "ログインが必要です" };
      }
      return { url: null, error: `アップロードに失敗しました: ${uploadError.message}` };
    }

    // 公開URLを取得
    const {
      data: { publicUrl },
    } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(fileName);

    // キャッシュバスティング用のタイムスタンプを追加
    const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;

    return { url: urlWithTimestamp, error: null };
  } catch (error) {
    console.error("アップロード中にエラーが発生:", error);
    return { url: null, error: "アップロードに失敗しました" };
  }
}

/**
 * アバター画像を削除
 */
export async function deleteAvatar(userId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    // ユーザーのアバターフォルダ内のファイルを全て削除
    const { data: files } = await supabase.storage
      .from(AVATAR_BUCKET)
      .list(userId);

    if (files && files.length > 0) {
      const filesToRemove = files.map((file) => `${userId}/${file.name}`);
      await supabase.storage.from(AVATAR_BUCKET).remove(filesToRemove);
    }

    return true;
  } catch (error) {
    console.error("削除エラー:", error);
    return false;
  }
}
