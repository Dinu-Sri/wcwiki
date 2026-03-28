import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "wcWIKI — Watercolor Art Search Engine",
    template: "%s | wcWIKI",
  },
  description:
    "Search and discover watercolor artists, paintings, and articles. A community-driven encyclopedia for watercolor art worldwide.",
  keywords: [
    "watercolor",
    "watercolour",
    "aquarelle",
    "painting",
    "art",
    "artists",
    "wiki",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://wcwiki.com"
  ),
  icons: {
    icon: "/favicon.webp",
    apple: "/favicon.webp",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "wcWIKI",
  },
  twitter: {
    card: "summary_large_image",
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
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans antialiased selection:bg-primary/20 selection:text-foreground">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
