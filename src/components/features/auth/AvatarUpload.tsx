"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { uploadAvatar } from "@/lib/supabase/storage";
import { Button } from "@/components/ui";

type AvatarUploadProps = {
  userId: string;
  currentAvatarUrl: string | null;
  displayName: string;
  onUploadComplete: (url: string) => void;
  onRemove?: () => void;
};

export const AvatarUpload = ({
  userId,
  currentAvatarUrl,
  displayName,
  onUploadComplete,
  onRemove,
}: AvatarUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initial = displayName.charAt(0).toUpperCase();
  const avatarUrl = previewUrl || currentAvatarUrl;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    // プレビュー表示
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // アップロード
    setIsUploading(true);
    try {
      const { url, error: uploadError } = await uploadAvatar(userId, file);

      if (uploadError) {
        setError(uploadError);
        setPreviewUrl(null);
        return;
      }

      if (url) {
        onUploadComplete(url);
      }
    } finally {
      setIsUploading(false);
      // ファイル入力をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = async () => {
    if (!onRemove) return;

    setIsRemoving(true);
    setError("");
    try {
      await onRemove();
      setPreviewUrl(null);
    } catch {
      setError("画像の削除に失敗しました");
    } finally {
      setIsRemoving(false);
    }
  };

  const isProcessing = isUploading || isRemoving;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* アバター表示 */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl font-bold text-primary-600">{initial}</span>
          )}
        </div>

        {/* 処理中のオーバーレイ */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* ファイル選択 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isProcessing}
      />

      <div className="flex flex-col gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleButtonClick}
          disabled={isProcessing}
        >
          {isUploading ? "アップロード中..." : "画像を変更"}
        </Button>

        {currentAvatarUrl && onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isProcessing}
            className="text-slate-500 hover:text-red-600"
          >
            {isRemoving ? "削除中..." : "初期画像に戻す"}
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <p className="text-xs text-slate-500 text-center">
        JPEG, PNG, GIF, WebP形式
        <br />
        2MB以下
      </p>
    </div>
  );
};
