import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/ui";
import { AuthProvider } from "@/lib/auth-context";
import { AuthGuard } from "@/components/AuthGuard";

export const metadata: Metadata = {
  title: "English Learning App",
  description: "英単語学習アプリ",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover", // Safe Area対応
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen overflow-x-hidden">
        <AuthProvider>
          <Header />
          <main className="relative">
            <AuthGuard>{children}</AuthGuard>
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
