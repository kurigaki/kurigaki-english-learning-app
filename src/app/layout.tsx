import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/ui";

export const metadata: Metadata = {
  title: "English Learning App",
  description: "英単語学習アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
