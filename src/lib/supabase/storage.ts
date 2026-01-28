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
    // 既存のファイルを削除（エラーは無視）
    await supabase.storage.from(AVATAR_BUCKET).remove([fileName]);

    // 新しいファイルをアップロード
    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("アップロードエラー:", uploadError);
      return { url: null, error: "アップロードに失敗しました" };
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
