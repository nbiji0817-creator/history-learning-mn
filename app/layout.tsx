import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { themeScript } from "@/lib/theme";
import { getSiteUrl } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Түүхээ мэдье — 6–12-р ангийн түүхийн нэгдсэн сургалтын систем",
    template: "%s | Түүхээ мэдье",
  },
  description:
    "6–12-р ангийн түүхийн хичээл, тест, түүхэн он цагийн хэлхээс, түүхэн хүмүүс, тоглоом, AI түүхийн багш болон ЭЕШ, улсын шалгалтын бэлтгэл — бүгд нэг дор, Монгол хэл дээр.",
  keywords: [
    "6-12-р ангийн түүхийн хичээл",
    "Монголын түүх",
    "дэлхийн түүх",
    "түүхийн тест",
    "ЭЕШ түүх",
    "улсын шалгалт түүх",
    "түүхийн он цагийн хэлхээс",
    "Чингис хаан",
    "Хүннү",
    "төрийн албаны шалгалт түүх",
  ],
  authors: [{ name: "Түүхээ мэдье" }],
  openGraph: {
    type: "website",
    locale: "mn_MN",
    url: siteUrl,
    siteName: "Түүхээ мэдье",
    title: "Түүхээ мэдье — 6–12-р ангийн түүхийн нэгдсэн сургалтын систем",
    description:
      "Хичээл, тест, тоглоом, он цагийн хэлхээс, AI түүхийн багш, шалгалтын бэлтгэл — Монгол хэл дээр.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Түүхээ мэдье",
    description:
      "6–12-р ангийн түүхийн интерактив сургалтын систем — Монгол хэл дээр.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf7ef" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1120" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="mn"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-gold focus:px-4 focus:py-2 focus:font-bold focus:text-[#1c1a17]"
        >
          Үндсэн агуулга руу шилжих
        </a>
        <Providers>
          <SiteHeader />
          <main id="main" className="flex-1 pb-20 md:pb-0">
            {children}
          </main>
          <SiteFooter />
          <MobileNav />
        </Providers>
      </body>
    </html>
  );
}
