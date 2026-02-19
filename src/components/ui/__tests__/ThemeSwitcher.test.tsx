/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeSwitcher } from "../ThemeSwitcher";

// Mock next-themes
const mockSetTheme = vi.fn();
vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "system",
    setTheme: mockSetTheme,
  }),
}));

describe("ThemeSwitcher", () => {
  it("renders three theme options", () => {
    render(<ThemeSwitcher />);
    expect(screen.getByRole("radio", { name: "ライトモード" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "ダークモード" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "システム設定に従う" })).toBeInTheDocument();
  });

  it("marks system as checked by default", () => {
    render(<ThemeSwitcher />);
    const systemBtn = screen.getByRole("radio", { name: "システム設定に従う" });
    expect(systemBtn).toHaveAttribute("aria-checked", "true");
  });

  it("calls setTheme when clicking a theme button", () => {
    render(<ThemeSwitcher />);
    fireEvent.click(screen.getByRole("radio", { name: "ダークモード" }));
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("renders with radiogroup role", () => {
    render(<ThemeSwitcher />);
    expect(screen.getByRole("radiogroup", { name: "テーマ切り替え" })).toBeInTheDocument();
  });
});
