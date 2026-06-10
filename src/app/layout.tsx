import type { Metadata } from "next";
import { JetBrains_Mono, Manrope, Sora } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import VoraPresence from "@/components/vora-presence";
import { absoluteUrl, siteConfig } from "@/lib/site";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "BuildVora | AI SaaS Development for Operators",
    template: "%s | BuildVora",
  },
  description: siteConfig.description,
  keywords: [
    "AI SaaS development",
    "CRM software development",
    "marketing automation software",
    "SEO platform",
    "underwriting software",
    "investor analytics",
    "operations software",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  twitter: {
    card: "summary_large_image",
    title: "BuildVora | AI SaaS Development for Operators",
    description: siteConfig.description,
    images: [absoluteUrl(siteConfig.ogImage)],
  },
  openGraph: {
    title: "BuildVora | AI SaaS Development for Operators",
    description: siteConfig.description,
    type: "website",
    url: siteConfig.url,
    siteName: "BuildVora",
    images: [
      {
        url: absoluteUrl(siteConfig.ogImage),
        width: 1200,
        height: 630,
        alt: "BuildVora AI SaaS development portfolio",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${sora.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-slate-100">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "BuildVora",
              url: siteConfig.url,
              description: siteConfig.description,
              foundingDate: "2026",
              sameAs: [siteConfig.url],
            }),
          }}
        />
        <SiteHeader />
        <VoraPresence />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
