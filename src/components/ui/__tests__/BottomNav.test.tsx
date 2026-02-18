/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BottomNav } from "../BottomNav";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { usePathname } from "next/navigation";

describe("BottomNav", () => {
  it("renders 5 navigation items", () => {
    render(<BottomNav />);
    const nav = screen.getByRole("navigation", { name: "メインナビゲーション" });
    const links = nav.querySelectorAll("a");
    expect(links).toHaveLength(5);
  });

  it("renders correct labels", () => {
    render(<BottomNav />);
    expect(screen.getByText("ホーム")).toBeInTheDocument();
    expect(screen.getByText("クイズ")).toBeInTheDocument();
    expect(screen.getByText("単語帳")).toBeInTheDocument();
    expect(screen.getByText("履歴")).toBeInTheDocument();
    expect(screen.getByText("その他")).toBeInTheDocument();
  });

  it("renders correct hrefs", () => {
    render(<BottomNav />);
    const nav = screen.getByRole("navigation", { name: "メインナビゲーション" });
    const links = nav.querySelectorAll("a");
    const hrefs = Array.from(links).map((link) => link.getAttribute("href"));
    expect(hrefs).toEqual(["/", "/quiz", "/word-list", "/history", "/more"]);
  });

  it("marks home as active when pathname is /", () => {
    render(<BottomNav />);
    const homeLink = screen.getByText("ホーム").closest("a");
    expect(homeLink).toHaveAttribute("aria-current", "page");
  });

  it("marks quiz as active when pathname is /quiz", () => {
    vi.mocked(usePathname).mockReturnValue("/quiz");
    render(<BottomNav />);
    const quizLink = screen.getByText("クイズ").closest("a");
    expect(quizLink).toHaveAttribute("aria-current", "page");
    const homeLink = screen.getByText("ホーム").closest("a");
    expect(homeLink).not.toHaveAttribute("aria-current");
  });

  it("marks more as active for /achievements path", () => {
    vi.mocked(usePathname).mockReturnValue("/achievements");
    render(<BottomNav />);
    const moreLink = screen.getByText("その他").closest("a");
    expect(moreLink).toHaveAttribute("aria-current", "page");
  });
});
