/**
 * useSpeechInput - スピードチャレンジの音声入力管理フック
 *
 * NOTE: 現在このフックは page.tsx からインポートされていません。
 * page.tsx は独自の音声認識 useEffect (L739〜835 付近) を持っており、
 * そちらが実際に動作しているコードです。
 *
 * TODO: 音声認識ロジックをこのフックに一本化する場合は:
 *   1. page.tsx の音声認識 useEffect を削除
 *   2. page.tsx でこのフックをインポートして呼び出す:
 *      const { isListening } = useSpeechInput({ gameState, voiceInputEnabled, question,
 *        onRecognized: (text, isCorrect) => {
 *          dispatch({ type: "SET_RECOGNIZED_TEXT", payload: { text, isCorrect } });
 *          if (isCorrect) handleSelect(question!.correctAnswer);
 *        }, speakingDifficulty, stateRef });
 */
import { useState, useEffect, useRef } from "react";
import { Question } from "@/types";
import { levenshteinDistance } from "@/lib/speed-challenge-logic";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    SpeechGrammarList: any;
    webkitSpeechGrammarList: any;
  }
}

interface UseSpeechInputProps {
  gameState: string;
  voiceInputEnabled: boolean;
  question: Question | null;
  onRecognized: (text: string, isCorrect: boolean) => void;
  speakingDifficulty: 'normal' | 'easy';
  stateRef: React.RefObject<{ gameState: string; question: Question | null }>;
}

export function useSpeechInput({
  gameState,
  voiceInputEnabled,
  question,
  onRecognized,
  speakingDifficulty,
  stateRef,
}: UseSpeechInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setIsSupported(!!(typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)));
  }, []);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!recognitionRef.current) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognitionRef.current = recognition;
    }

    const recognition = recognitionRef.current;

    if (question && (window.SpeechGrammarList || window.webkitSpeechGrammarList)) {
      const SpeechGrammarListAPI = window.SpeechGrammarList || window.webkitSpeechGrammarList;
      const speechRecognitionList = new SpeechGrammarListAPI();
      const wordsToRecognize = [...question.choices, question.correctAnswer];
      const uniqueWords = Array.from(new Set(wordsToRecognize));
      const grammar = `#JSGF V1.0; grammar choices; public <choice> = ${uniqueWords.join(' | ')} ;`;
      speechRecognitionList.addFromString(grammar, 1);
      recognition.grammars = speechRecognitionList;
    }

    const shouldListen = gameState === 'playing' && voiceInputEnabled && question?.type === 'ja-to-en';

    if (shouldListen) {
      recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript.trim().toLowerCase();
        const answer = question!.correctAnswer.toLowerCase();

        const isCorrect = (() => {
          if (transcript === answer || transcript.includes(answer)) return true;

          if (speakingDifficulty === 'easy') {
            // 冠詞・前置詞を除去して比較しやすくする
            const stripArticles = (s: string) =>
              s.replace(/\b(a|an|the|to|of|in|on|at|for)\b/g, '').replace(/\s+/g, ' ').trim();
            const cleanTranscript = stripArticles(transcript);
            const cleanAnswer = stripArticles(answer);

            // 許容誤差: 3文字 または 単語長の50% の大きい方
            const threshold = Math.max(3, Math.floor(cleanAnswer.length * 0.5));

            if (levenshteinDistance(cleanTranscript, cleanAnswer) <= threshold) return true;
            if (cleanAnswer.startsWith(cleanTranscript) && cleanTranscript.length >= 3) return true;

            const ws = cleanTranscript.split(/\s+/);
            return ws.some((w: string) => {
              if (levenshteinDistance(w, cleanAnswer) <= threshold) return true;
              return cleanAnswer.startsWith(w) && w.length >= 3;
            });
          }
          return false;
        })();

        onRecognized(transcript, isCorrect);
      };

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => {
        setIsListening(false);
        if (stateRef.current?.gameState === 'playing' && voiceInputEnabled && stateRef.current?.question?.type === 'ja-to-en') {
          try { recognition.start(); } catch { /* ignore */ }
        }
      };

      try { recognition.start(); } catch { /* ignore */ }
    } else {
      recognition.stop();
      setIsListening(false);
    }

    return () => {
      recognition.stop();
    };
  }, [gameState, voiceInputEnabled, question, isSupported, speakingDifficulty, onRecognized, stateRef]);

  return { isListening, isSupported };
}
