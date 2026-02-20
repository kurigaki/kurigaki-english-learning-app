/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FlashcardView from "../FlashcardView";
import type { FlashcardWord } from "../FlashcardView";

// unifiedStorage をモック
vi.mock("@/lib/unified-storage", () => ({
  unifiedStorage: {
    getSrsProgressAll: vi.fn().mockResolvedValue([]),
    saveSrsProgress: vi.fn().mockResolvedValue(undefined),
  },
}));

// audio をモック
vi.mock("@/lib/audio", () => ({
  speakWord: vi.fn(),
  isSpeechSynthesisSupported: vi.fn().mockReturnValue(false),
}));

// next/link をモック
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    onClick,
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: (e: React.MouseEvent) => void;
  }) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  ),
}));

const mockWords: FlashcardWord[] = [
  { id: 1, word: "schedule", meaning: "スケジュール", mastery: "new" },
  { id: 2, word: "meeting", meaning: "会議", mastery: "familiar", example: "We have a meeting.", exampleJa: "会議があります。" },
  { id: 3, word: "budget", meaning: "予算", mastery: "mastered" },
];

const onExit = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

describe("FlashcardView", () => {
  it("単語が表面（英語）に表示されること", async () => {
    render(<FlashcardView words={mockWords} onExit={onExit} />);
    expect(screen.getByTestId("card-front-word")).toHaveTextContent("schedule");
  });

  it("カードをクリックすると裏面（日本語）が表示されること", async () => {
    render(<FlashcardView words={mockWords} onExit={onExit} />);
    const card = screen.getByRole("button", { name: "カードをめくる" });
    fireEvent.click(card);
    expect(screen.getByTestId("card-back-meaning")).toHaveTextContent("スケジュール");
  });

  it("裏面に「知ってた」「わからなかった」ボタンがあること", async () => {
    render(<FlashcardView words={mockWords} onExit={onExit} />);
    // フリップして裏面を表示
    const card = screen.getByRole("button", { name: "カードをめくる" });
    fireEvent.click(card);
    expect(screen.getByTestId("btn-knew")).toBeInTheDocument();
    expect(screen.getByTestId("btn-unknown")).toBeInTheDocument();
  });

  it("「前へ」ボタンが最初のカードで disabled なこと", () => {
    render(<FlashcardView words={mockWords} onExit={onExit} />);
    expect(screen.getByTestId("btn-prev")).toBeDisabled();
  });

  it("「次へ」ボタンが最後のカードで disabled なこと", async () => {
    render(<FlashcardView words={mockWords} onExit={onExit} />);
    // 3枚のカードの最後（インデックス2）まで進む
    fireEvent.click(screen.getByTestId("btn-next"));
    await waitFor(() => {
      expect(screen.getByTestId("card-front-word")).toHaveTextContent("meeting");
    });
    fireEvent.click(screen.getByTestId("btn-next"));
    await waitFor(() => {
      expect(screen.getByTestId("card-front-word")).toHaveTextContent("budget");
    });
    expect(screen.getByTestId("btn-next")).toBeDisabled();
  });

  it("カード切り替え後にフリップ状態がリセットされること（表面が表示）", async () => {
    render(<FlashcardView words={mockWords} onExit={onExit} />);
    // フリップ
    fireEvent.click(screen.getByRole("button", { name: "カードをめくる" }));
    // 「カードを戻す」になっていることを確認
    expect(screen.getByRole("button", { name: "カードを戻す" })).toBeInTheDocument();
    // 次へ進む
    fireEvent.click(screen.getByTestId("btn-next"));
    // スライドアニメーション後にリセット（180ms待機）
    await waitFor(
      () => {
        expect(screen.getByRole("button", { name: "カードをめくる" })).toBeInTheDocument();
      },
      { timeout: 500 }
    );
    expect(screen.getByTestId("card-front-word")).toHaveTextContent("meeting");
  });
});
