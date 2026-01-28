import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/ui";
import { AuthProvider } from "@/lib/auth-context";

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
        <AuthProvider>
          <Header />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
