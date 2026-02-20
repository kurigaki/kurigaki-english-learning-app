import { describe, it, expect } from "vitest";
import {
  calculateSm2,
  isDueForReview,
  answerQualityFromResult,
  getInitialSrsProgress,
  type SrsProgress,
} from "../srs";

const toLocalDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

describe("srs - SM-2 algorithm", () => {
  describe("getInitialSrsProgress", () => {
    it("returns default SRS progress for a word", () => {
      const progress = getInitialSrsProgress(42);
      expect(progress.wordId).toBe(42);
      expect(progress.easeFactor).toBe(2.5);
      expect(progress.intervalDays).toBe(0);
      expect(progress.repetitions).toBe(0);
      expect(progress.status).toBe("new");
      expect(progress.nextReviewDate).toBeNull();
    });
  });

  describe("calculateSm2", () => {
    it("on first correct answer (quality=4), sets interval to 1 day", () => {
      const initial = getInitialSrsProgress(1);
      const result = calculateSm2(initial, 4);

      expect(result.repetitions).toBe(1);
      expect(result.intervalDays).toBe(1);
      expect(result.status).toBe("learning");
      expect(result.nextReviewDate).not.toBeNull();
    });

    it("on second correct answer (quality=4), sets interval to 6 days", () => {
      const after1 = calculateSm2(getInitialSrsProgress(1), 4);
      const after2 = calculateSm2(after1, 4);

      expect(after2.repetitions).toBe(2);
      expect(after2.intervalDays).toBe(6);
      expect(after2.status).toBe("review");
    });

    it("on third correct answer, interval = prev * easeFactor", () => {
      let progress = getInitialSrsProgress(1);
      progress = calculateSm2(progress, 4); // rep=1, interval=1
      progress = calculateSm2(progress, 4); // rep=2, interval=6
      progress = calculateSm2(progress, 4); // rep=3, interval=6*EF

      expect(progress.repetitions).toBe(3);
      // EF after three q=4: 2.5 + (0.1 - 0.08) = 2.5 (stays ~2.5)
      // Actually: EF = EF + (0.1 - (5-q)*(0.08 + (5-q)*0.02))
      // q=4: 0.1 - 1*(0.08 + 1*0.02) = 0.1 - 0.10 = 0.0 → EF stays same
      expect(progress.intervalDays).toBe(Math.round(6 * progress.easeFactor));
    });

    it("quality=5 increases easeFactor", () => {
      const initial = getInitialSrsProgress(1);
      const result = calculateSm2(initial, 5);

      // q=5: EF + (0.1 - 0*(0.08 + 0*0.02)) = EF + 0.1 = 2.6
      expect(result.easeFactor).toBe(2.6);
    });

    it("quality=3 does not change interval (repetitions continues)", () => {
      let progress = getInitialSrsProgress(1);
      progress = calculateSm2(progress, 4); // rep=1, interval=1
      const before = { ...progress };
      progress = calculateSm2(progress, 3); // quality=3: repeat

      expect(progress.repetitions).toBe(2);
      expect(progress.intervalDays).toBe(6);
      // EF decreases slightly for q=3
      expect(progress.easeFactor).toBeLessThan(before.easeFactor);
    });

    it("quality < 3 resets repetitions and interval", () => {
      let progress = getInitialSrsProgress(1);
      progress = calculateSm2(progress, 5); // rep=1
      progress = calculateSm2(progress, 5); // rep=2
      progress = calculateSm2(progress, 1); // fail

      expect(progress.repetitions).toBe(0);
      expect(progress.intervalDays).toBe(1);
      expect(progress.status).toBe("learning");
    });

    it("easeFactor never goes below 1.3", () => {
      let progress = getInitialSrsProgress(1);
      // Repeatedly give low quality to push EF down
      for (let i = 0; i < 20; i++) {
        progress = calculateSm2(progress, 0);
      }
      expect(progress.easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    it("sets status to mastered when interval >= 21 days", () => {
      let progress = getInitialSrsProgress(1);
      // Build up to mastered by giving perfect answers
      progress = calculateSm2(progress, 5); // rep=1, interval=1
      progress = calculateSm2(progress, 5); // rep=2, interval=6
      progress = calculateSm2(progress, 5); // rep=3, interval=6*2.6=16 → round=16
      progress = calculateSm2(progress, 5); // rep=4, interval=16*2.7=43 → round=43

      expect(progress.intervalDays).toBeGreaterThanOrEqual(21);
      expect(progress.status).toBe("mastered");
    });

    it("nextReviewDate is set to today + intervalDays", () => {
      const initial = getInitialSrsProgress(1);
      const result = calculateSm2(initial, 4);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expected = new Date(today);
      expected.setDate(expected.getDate() + result.intervalDays);
      const expectedStr = toLocalDateStr(expected);

      expect(result.nextReviewDate).toBe(expectedStr);
    });
  });

  describe("isDueForReview", () => {
    it("returns false for new words (no nextReviewDate)", () => {
      const progress = getInitialSrsProgress(1);
      expect(isDueForReview(progress)).toBe(false);
    });

    it("returns true when nextReviewDate is today", () => {
      const today = toLocalDateStr(new Date());
      const progress: SrsProgress = {
        ...getInitialSrsProgress(1),
        nextReviewDate: today,
        status: "learning",
      };
      expect(isDueForReview(progress)).toBe(true);
    });

    it("returns true when nextReviewDate is in the past", () => {
      const past = new Date();
      past.setDate(past.getDate() - 3);
      const progress: SrsProgress = {
        ...getInitialSrsProgress(1),
        nextReviewDate: toLocalDateStr(past),
        status: "review",
      };
      expect(isDueForReview(progress)).toBe(true);
    });

    it("returns false when nextReviewDate is in the future", () => {
      const future = new Date();
      future.setDate(future.getDate() + 5);
      const progress: SrsProgress = {
        ...getInitialSrsProgress(1),
        nextReviewDate: toLocalDateStr(future),
        status: "review",
      };
      expect(isDueForReview(progress)).toBe(false);
    });

    it("returns false for mastered words (they still show if due)", () => {
      const past = new Date();
      past.setDate(past.getDate() - 1);
      const progress: SrsProgress = {
        ...getInitialSrsProgress(1),
        nextReviewDate: toLocalDateStr(past),
        status: "mastered",
      };
      // mastered words are still reviewable when due
      expect(isDueForReview(progress)).toBe(true);
    });
  });

  describe("answerQualityFromResult", () => {
    it("returns 5 for correct + fast response", () => {
      expect(answerQualityFromResult(true, 1500)).toBe(5);
    });

    it("returns 4 for correct + slow response", () => {
      expect(answerQualityFromResult(true, 8000)).toBe(4);
    });

    it("returns 4 for correct with no response time", () => {
      expect(answerQualityFromResult(true)).toBe(4);
    });

    it("returns 1 for incorrect", () => {
      expect(answerQualityFromResult(false)).toBe(1);
    });

    it("returns 2 for incorrect + fast (close miss)", () => {
      expect(answerQualityFromResult(false, 1000)).toBe(2);
    });
  });
});
