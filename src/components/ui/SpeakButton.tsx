"use client";

import { useState, useEffect } from "react";
import { speakWord, speakSentence, isSpeechSynthesisSupported, stopSpeaking } from "@/lib/audio";

type SpeakButtonProps = {
  text: string;
  type?: "word" | "sentence";
  slow?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export const SpeakButton = ({
  text,
  type = "word",
  slow = false,
  size = "md",
  className = "",
}: SpeakButtonProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    setIsSupported(isSpeechSynthesisSupported());
  }, []);

  const handleClick = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);

    const onEnd = () => {
      setIsSpeaking(false);
    };

    if (type === "sentence") {
      speakSentence(text, { slow, onEnd });
    } else {
      speakWord(text, { slow, onEnd });
    }
  };

  if (!isSupported) {
    return null;
  }

  const sizeClasses = {
    sm: "w-7 h-7 text-sm",
    md: "w-9 h-9 text-base",
    lg: "w-11 h-11 text-lg",
  };

  return (
    <button
      onClick={handleClick}
      className={`
        ${sizeClasses[size]}
        inline-flex items-center justify-center
        rounded-full
        transition-all duration-200
        ${isSpeaking
          ? "bg-primary-500 text-white scale-110"
          : "bg-primary-100 text-primary-600 hover:bg-primary-200"
        }
        ${className}
      `}
      title={isSpeaking ? "停止" : "発音を聞く"}
      aria-label={isSpeaking ? "音声を停止" : `${text}の発音を聞く`}
    >
      {isSpeaking ? (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07l-1.41-1.41a3 3 0 0 0 0-4.24l1.41-1.42zM19.07 4.93a10 10 0 0 1 0 14.14l-1.41-1.41a8 8 0 0 0 0-11.31l1.41-1.42z" />
        </svg>
      )}
    </button>
  );
};
