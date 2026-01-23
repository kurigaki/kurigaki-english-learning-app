import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  saveSpeedResultState,
  getSpeedResultState,
  clearSpeedResultState,
  hasSpeedResultState,
  SpeedResultState,
} from "../speed-session";

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "sessionStorage", {
  value: mockSessionStorage,
});

describe("speed-session", () => {
  beforeEach(() => {
    mockSessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockState: Omit<SpeedResultState, "timestamp"> = {
    score: 15,
    totalQuestions: 20,
    maxCombo: 8,
    isNewHighScore: true,
    answeredWords: [
      { id: 1, word: "meeting", meaning: "会議", correct: true },
      { id: 2, word: "schedule", meaning: "予定", correct: false },
      { id: 3, word: "deadline", meaning: "締め切り", correct: true },
    ],
  };

  describe("saveSpeedResultState", () => {
    it("should save state to sessionStorage", () => {
      saveSpeedResultState(mockState);

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        "speed_result_state",
        expect.any(String)
      );

      const savedData = JSON.parse(
        mockSessionStorage.setItem.mock.calls[0][1]
      );
      expect(savedData.score).toBe(15);
      expect(savedData.totalQuestions).toBe(20);
      expect(savedData.maxCombo).toBe(8);
      expect(savedData.isNewHighScore).toBe(true);
      expect(savedData.answeredWords).toHaveLength(3);
      expect(savedData.timestamp).toBeDefined();
    });
  });

  describe("getSpeedResultState", () => {
    it("should return saved state", () => {
      saveSpeedResultState(mockState);

      const result = getSpeedResultState();

      expect(result).not.toBeNull();
      expect(result?.score).toBe(15);
      expect(result?.totalQuestions).toBe(20);
      expect(result?.maxCombo).toBe(8);
      expect(result?.isNewHighScore).toBe(true);
      expect(result?.answeredWords).toHaveLength(3);
    });

    it("should return null when no state exists", () => {
      const result = getSpeedResultState();
      expect(result).toBeNull();
    });

    it("should return null for expired state (30 minutes)", () => {
      saveSpeedResultState(mockState);

      // Advance time by 31 minutes
      const now = Date.now();
      vi.spyOn(Date, "now").mockReturnValue(now + 31 * 60 * 1000);

      const result = getSpeedResultState();
      expect(result).toBeNull();
    });

    it("should return state if not expired", () => {
      saveSpeedResultState(mockState);

      // Advance time by 29 minutes (within 30 min expiry)
      const now = Date.now();
      vi.spyOn(Date, "now").mockReturnValue(now + 29 * 60 * 1000);

      const result = getSpeedResultState();
      expect(result).not.toBeNull();
      expect(result?.score).toBe(15);
    });
  });

  describe("clearSpeedResultState", () => {
    it("should clear state from sessionStorage", () => {
      saveSpeedResultState(mockState);
      clearSpeedResultState();

      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
        "speed_result_state"
      );

      const result = getSpeedResultState();
      expect(result).toBeNull();
    });
  });

  describe("hasSpeedResultState", () => {
    it("should return true when valid state exists", () => {
      saveSpeedResultState(mockState);
      expect(hasSpeedResultState()).toBe(true);
    });

    it("should return false when no state exists", () => {
      expect(hasSpeedResultState()).toBe(false);
    });

    it("should return false when state is expired", () => {
      saveSpeedResultState(mockState);

      const now = Date.now();
      vi.spyOn(Date, "now").mockReturnValue(now + 31 * 60 * 1000);

      expect(hasSpeedResultState()).toBe(false);
    });
  });
});
