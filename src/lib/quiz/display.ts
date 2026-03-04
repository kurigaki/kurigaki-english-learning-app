import { Question, QuestionType } from "@/types";
import { createFillBlankSentence } from "./generator";

export function getQuestionPrompt(type: QuestionType): string {
  switch (type) {
    case "en-to-ja":
      return "この単語の意味は?";
    case "ja-to-en":
      return "この意味の英単語は?";
    case "listening":
      return "音声を聞いて、空欄に入る単語は?";
    case "dictation":
      return "空欄に入る英単語を入力してください";
  }
}

export function getQuestionDisplay(question: Question): string {
  switch (question.type) {
    case "en-to-ja":
      return question.word.word;
    case "ja-to-en":
      return question.word.meaning;
    case "listening":
    case "dictation":
      // 穴あき例文を生成
      return question.word.example
        ? createFillBlankSentence(question.word.example, question.word.word)
        : "";
  }
}