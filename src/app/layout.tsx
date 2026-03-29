import type { Metadata } from "next";
import Script from "next/script";
import { Geist } from "next/font/google";
import { getLocale } from "next-intl/server";
import { AuthProvider } from "@/components/auth/AuthProvider";
import {
  getSiteSettings,
  generateOrganizationSchema,
  generateWebSiteSchema,
} from "@/lib/schema";
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
    "The world's first peer-reviewed watercolor encyclopedia, created exclusively by human artists. Artists building for artists — safeguarding authentic art philosophy through a human-verified knowledge base, accessible to all, forever.",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  const locale = await getLocale();

  const orgSchema = generateOrganizationSchema(settings);
  const webSiteSchema = generateWebSiteSchema(settings);

  const gaId = (settings as Record<string, unknown>).googleAnalyticsId as string | null;
  const gtmId = (settings as Record<string, unknown>).googleTagManagerId as string | null;
  const gscVerification = (settings as Record<string, unknown>).googleSiteVerification as string | null;
  const bingVerification = (settings as Record<string, unknown>).bingSiteVerification as string | null;
  const pinterestVerification = (settings as Record<string, unknown>).pinterestVerification as string | null;
  const yandexVerification = (settings as Record<string, unknown>).yandexVerification as string | null;

  return (
    <html lang={locale} className={`${geistSans.variable} h-full`}>
      <head>
        {/* Verification meta tags */}
        {gscVerification && (
          <meta name="google-site-verification" content={gscVerification} />
        )}
        {bingVerification && (
          <meta name="msvalidate.01" content={bingVerification} />
        )}
        {pinterestVerification && (
          <meta name="p:domain_verify" content={pinterestVerification} />
        )}
        {yandexVerification && (
          <meta name="yandex-verification" content={yandexVerification} />
        )}

        {/* Organization + WebSite structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />

        {/* Google Analytics (GA4) */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
        )}

        {/* Google Tag Manager */}
        {gtmId && !gaId && (
          <Script id="gtm-init" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
        )}
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans antialiased selection:bg-primary/20 selection:text-foreground">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
