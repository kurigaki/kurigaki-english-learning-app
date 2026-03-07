/**
 * useGameAudio - スピードチャレンジの BGM・効果音管理フック
 *
 * TODO: 音声ファイル実装予定
 * このフックは現在 page.tsx の inline useEffect と重複しています。
 * public/audio/ に音声ファイルを配置した際に、以下の手順で統合してください:
 *   1. page.tsx の BGM/SFX useEffect をすべて削除
 *   2. このフックを page.tsx でインポートして呼び出す:
 *      const { playSfx } = useGameAudio({ gameState, score, timeLeft, timeLimit, isBgmEnabled, isSfxEnabled, bgmVolume });
 *   3. playSfx('correct') / playSfx('incorrect') などを handleSelect 内で呼ぶ
 *
 * 必要な音声ファイル (public/audio/ に配置):
 *   - speed-challenge-bgm.mp3 (ループBGM)
 *   - correct.mp3 / incorrect.mp3 / combo.mp3 / highscore.mp3 / countdown.mp3
 */
import { useEffect, useRef } from "react";

type GameState = "ready" | "playing" | "paused" | "finished";

interface UseGameAudioProps {
  gameState: GameState;
  score: number;
  timeLeft: number;
  timeLimit: number;
  isBgmEnabled: boolean;
  isSfxEnabled: boolean;
  bgmVolume: number;
}

export function useGameAudio({
  gameState,
  score,
  timeLeft,
  timeLimit,
  isBgmEnabled,
  isSfxEnabled,
  bgmVolume,
}: UseGameAudioProps) {
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const sfxRef = useRef<{
    correct?: HTMLAudioElement;
    incorrect?: HTMLAudioElement;
    combo?: HTMLAudioElement;
    highscore?: HTMLAudioElement;
    countdown?: HTMLAudioElement;
  }>({});

  // オーディオの初期化
  useEffect(() => {
    const audio = new Audio("/audio/speed-challenge-bgm.mp3");
    audio.loop = true;
    bgmRef.current = audio;

    sfxRef.current = {
      correct: new Audio("/audio/correct.mp3"),
      incorrect: new Audio("/audio/incorrect.mp3"),
      combo: new Audio("/audio/combo.mp3"),
      highscore: new Audio("/audio/highscore.mp3"),
      countdown: new Audio("/audio/countdown.mp3"),
    };
    Object.values(sfxRef.current).forEach((sfx) => {
      if (sfx) sfx.volume = 0.4;
    });

    return () => {
      audio.pause();
      bgmRef.current = null;
    };
  }, []);

  // 音量の同期
  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.volume = bgmVolume;
    }
  }, [bgmVolume]);

  // BGMの再生・停止制御
  useEffect(() => {
    if (gameState === "playing" && isBgmEnabled) {
      bgmRef.current?.play().catch((error) => {
        console.error("BGM autoplay failed:", error);
      });
    } else {
      if (bgmRef.current && !bgmRef.current.paused) {
        bgmRef.current.pause();
        if (gameState !== "paused") {
          bgmRef.current.currentTime = 0;
        }
      }
    }
  }, [gameState, isBgmEnabled]);

  // スコアに応じたピッチ変更
  useEffect(() => {
    if (gameState === "playing" && bgmRef.current) {
      const newRate = 1.0 + score * 0.007;
      bgmRef.current.playbackRate = Math.min(newRate, 1.2);
    } else if (bgmRef.current && bgmRef.current.playbackRate !== 1.0) {
      bgmRef.current.playbackRate = 1.0;
    }
  }, [score, gameState]);

  // カウントダウン音 (残り10秒以下)
  useEffect(() => {
    if (gameState === "playing" && timeLimit > 0 && timeLeft <= 10 && timeLeft > 0 && isSfxEnabled) {
      const sound = sfxRef.current.countdown;
      if (sound) {
        sound.currentTime = 0;
        sound.play().catch(() => {});
      }
    }
  }, [timeLeft, gameState, timeLimit, isSfxEnabled]);

  // 効果音再生関数
  const playSfx = (type: keyof typeof sfxRef.current) => {
    if (isSfxEnabled && sfxRef.current[type]) {
      sfxRef.current[type]!.currentTime = 0;
      sfxRef.current[type]!.play().catch(() => {});
    }
  };

  return { playSfx };
}
