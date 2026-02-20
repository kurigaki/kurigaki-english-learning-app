import { describe, it, expect, beforeEach } from "vitest";
import { storage } from "../storage";

const toLocalDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("getUserData", () => {
    it("should return default user data when no data exists", () => {
      const userData = storage.getUserData();

      expect(userData.streak).toBe(0);
      expect(userData.totalXp).toBe(0);
      expect(userData.level).toBe(1);
      expect(userData.dailyGoal).toBe(10);
    });

    it("should return saved user data with correct streak and XP", () => {
      const testData = {
        streak: 5,
        lastStudyDate: "2024-01-01",
        totalXp: 100,
        level: 2,
        dailyGoal: 20,
        todayCorrect: 10,
        todayDate: "2024-01-01",
      };
      storage.saveUserData(testData);

      const userData = storage.getUserData();

      expect(userData.streak).toBe(5);
      expect(userData.totalXp).toBe(100);
      expect(userData.level).toBe(2);
      expect(userData.dailyGoal).toBe(20);
    });
  });

  describe("saveUserData", () => {
    it("should save user data to localStorage", () => {
      const testData = {
        streak: 3,
        lastStudyDate: "2024-01-15",
        totalXp: 50,
        level: 1,
        dailyGoal: 10,
        todayCorrect: 5,
        todayDate: "2024-01-15",
      };

      storage.saveUserData(testData);

      const savedData = JSON.parse(localStorage.getItem("user_data") || "{}");
      expect(savedData.streak).toBe(3);
      expect(savedData.totalXp).toBe(50);
    });
  });

  describe("getRecords", () => {
    it("should return empty array when no records exist", () => {
      const records = storage.getRecords();

      expect(records).toEqual([]);
    });
  });

  describe("addRecord", () => {
    it("should add a learning record", () => {
      storage.addRecord({
        wordId: 1,
        word: "test",
        meaning: "テスト",
        questionType: "en-to-ja",
        correct: true,
      });

      const records = storage.getRecords();

      expect(records).toHaveLength(1);
      expect(records[0].wordId).toBe(1);
      expect(records[0].correct).toBe(true);
      expect(records[0].studiedAt).toBeDefined();
    });

    it("should add multiple records", () => {
      storage.addRecord({ wordId: 1, word: "apple", meaning: "りんご", questionType: "en-to-ja", correct: true });
      storage.addRecord({ wordId: 2, word: "banana", meaning: "バナナ", questionType: "ja-to-en", correct: false });

      const records = storage.getRecords();

      expect(records).toHaveLength(2);
    });
  });

  describe("getWordStats", () => {
    it("should return empty Map when no records exist", () => {
      const statsMap = storage.getWordStats();

      expect(statsMap.size).toBe(0);
    });

    it("should calculate correct stats for words", () => {
      // Add 4 records for word 1: 3 correct, 1 incorrect
      storage.addRecord({ wordId: 1, word: "test", meaning: "テスト", questionType: "en-to-ja", correct: true });
      storage.addRecord({ wordId: 1, word: "test", meaning: "テスト", questionType: "en-to-ja", correct: true });
      storage.addRecord({ wordId: 1, word: "test", meaning: "テスト", questionType: "en-to-ja", correct: true });
      storage.addRecord({ wordId: 1, word: "test", meaning: "テスト", questionType: "en-to-ja", correct: false });

      const statsMap = storage.getWordStats();
      const stats = statsMap.get(1);

      expect(stats).toBeDefined();
      expect(stats?.totalAttempts).toBe(4);
      expect(stats?.correctCount).toBe(3);
      expect(stats?.incorrectCount).toBe(1);
      expect(stats?.accuracy).toBe(75);
    });

    it("should track multiple words separately", () => {
      storage.addRecord({ wordId: 1, word: "apple", meaning: "りんご", questionType: "en-to-ja", correct: true });
      storage.addRecord({ wordId: 2, word: "banana", meaning: "バナナ", questionType: "en-to-ja", correct: false });

      const statsMap = storage.getWordStats();

      expect(statsMap.size).toBe(2);
      expect(statsMap.get(1)?.accuracy).toBe(100);
      expect(statsMap.get(2)?.accuracy).toBe(0);
    });
  });

  describe("getXpProgress", () => {
    it("should return correct XP progress for level 1", () => {
      const userData = storage.getUserData();
      const progress = storage.getXpProgress(userData);

      expect(progress.current).toBe(0);
      expect(progress.required).toBe(100); // Level 1 requires 100 XP
      expect(progress.percentage).toBe(0);
    });

    it("should calculate percentage correctly", () => {
      const userData = {
        streak: 0,
        lastStudyDate: null,
        totalXp: 50,
        level: 1,
        dailyGoal: 10,
        todayCorrect: 0,
        todayDate: null,
      };
      const progress = storage.getXpProgress(userData);

      expect(progress.current).toBe(50);
      expect(progress.percentage).toBe(50);
    });
  });

  describe("SRS progress", () => {
    it("getSrsProgressAll returns empty array when no data", () => {
      expect(storage.getSrsProgressAll()).toEqual([]);
    });

    it("saveSrsProgress and getSrsProgress round-trip", () => {
      const progress = {
        wordId: 42,
        easeFactor: 2.5,
        intervalDays: 1,
        repetitions: 1,
        nextReviewDate: "2026-02-16",
        status: "learning" as const,
        lastReviewedDate: "2026-02-15",
      };
      storage.saveSrsProgress(progress);

      const retrieved = storage.getSrsProgress(42);
      expect(retrieved).toEqual(progress);
    });

    it("saveSrsProgress updates existing progress", () => {
      const progress = {
        wordId: 42,
        easeFactor: 2.5,
        intervalDays: 1,
        repetitions: 1,
        nextReviewDate: "2026-02-16",
        status: "learning" as const,
        lastReviewedDate: "2026-02-15",
      };
      storage.saveSrsProgress(progress);
      storage.saveSrsProgress({ ...progress, intervalDays: 6, repetitions: 2 });

      const all = storage.getSrsProgressAll();
      expect(all).toHaveLength(1);
      expect(all[0].intervalDays).toBe(6);
    });

    it("getSrsProgress returns null for unknown word", () => {
      expect(storage.getSrsProgress(999)).toBeNull();
    });

    it("getDueWords returns only due words", () => {
      const today = toLocalDateStr(new Date());
      const future = new Date();
      future.setDate(future.getDate() + 5);
      const futureStr = toLocalDateStr(future);

      storage.saveSrsProgress({
        wordId: 1,
        easeFactor: 2.5,
        intervalDays: 1,
        repetitions: 1,
        nextReviewDate: today,
        status: "learning",
        lastReviewedDate: "2026-02-14",
      });
      storage.saveSrsProgress({
        wordId: 2,
        easeFactor: 2.5,
        intervalDays: 6,
        repetitions: 2,
        nextReviewDate: futureStr,
        status: "review",
        lastReviewedDate: "2026-02-10",
      });

      const due = storage.getDueWords();
      expect(due).toHaveLength(1);
      expect(due[0].wordId).toBe(1);
    });
  });
});
