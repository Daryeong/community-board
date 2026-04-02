import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/header";
import { RecentPostsSidebar } from "@/components/recent-posts-sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "커뮤니티 게시판",
  description: "누구나 익숙하게 사용할 수 있는 공개형 커뮤니티 게시판",
  openGraph: {
    title: "커뮤니티 게시판",
    description: "누구나 익숙하게 사용할 수 있는 공개형 커뮤니티 게시판",
    type: "website",
    locale: "ko_KR",
    siteName: "커뮤니티 게시판",
  },
  twitter: {
    card: "summary",
    title: "커뮤니티 게시판",
    description: "누구나 익숙하게 사용할 수 있는 공개형 커뮤니티 게시판",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="ko" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-[var(--color-page)] text-slate-900">
        <div className="min-h-screen">
          <Header />
          <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
          <RecentPostsSidebar />
        </div>
      </body>
    </html>
  );
}
