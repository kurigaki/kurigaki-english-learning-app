/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("audio.ts exports", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("exports all expected functions", async () => {
    const audio = await import("../audio");

    expect(typeof audio.isSpeechSynthesisSupported).toBe("function");
    expect(typeof audio.getAvailableVoices).toBe("function");
    expect(typeof audio.getEnglishVoice).toBe("function");
    expect(typeof audio.speak).toBe("function");
    expect(typeof audio.speakWord).toBe("function");
    expect(typeof audio.speakSentence).toBe("function");
    expect(typeof audio.stopSpeaking).toBe("function");
    expect(typeof audio.isSpeaking).toBe("function");
    expect(typeof audio.waitForVoices).toBe("function");
    // New functions
    expect(typeof audio.ensureVoicesLoaded).toBe("function");
    expect(typeof audio.speakWordWithVariant).toBe("function");
  });

  it("exports PronunciationVariant type (implicit via function type)", async () => {
    const audio = await import("../audio");
    // speakWordWithVariant should accept "us" and "uk" as variants
    expect(() => audio.speakWordWithVariant("test", "us")).not.toThrow();
    expect(() => audio.speakWordWithVariant("test", "uk")).not.toThrow();
  });
});

describe("audio.ts function behavior (without mocking)", () => {
  it("isSpeechSynthesisSupported returns boolean", async () => {
    const { isSpeechSynthesisSupported } = await import("../audio");
    const result = isSpeechSynthesisSupported();
    expect(typeof result).toBe("boolean");
  });

  it("getAvailableVoices returns array", async () => {
    const { getAvailableVoices } = await import("../audio");
    const result = getAvailableVoices();
    expect(Array.isArray(result)).toBe(true);
  });

  it("waitForVoices returns a Promise", async () => {
    const { waitForVoices } = await import("../audio");
    const result = waitForVoices();
    expect(result).toBeInstanceOf(Promise);
  });

  it("ensureVoicesLoaded returns a Promise<boolean>", async () => {
    const { ensureVoicesLoaded } = await import("../audio");
    const result = ensureVoicesLoaded();
    expect(result).toBeInstanceOf(Promise);
    const resolved = await result;
    expect(typeof resolved).toBe("boolean");
  });

  it("stopSpeaking does not throw", async () => {
    const { stopSpeaking } = await import("../audio");
    expect(() => stopSpeaking()).not.toThrow();
  });

  it("isSpeaking returns boolean", async () => {
    const { isSpeaking } = await import("../audio");
    const result = isSpeaking();
    expect(typeof result).toBe("boolean");
  });
});
