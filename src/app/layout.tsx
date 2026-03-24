import type { Metadata } from "next";
import "./globals.css";
import siteConfig from "@/data/site-config.json";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ThemeProvider, ThemeToggle } from "@/components/ThemeProvider";
import { StickyLineButton } from "@/components/StickyLineButton";

export const metadata: Metadata = {
  title: {
    default: siteConfig.seo.defaultTitle,
    template: `%s | ${siteConfig.brand.name}`,
  },
  description: siteConfig.seo.defaultDescription,
  keywords: siteConfig.seo.keywords,
  metadataBase: new URL(siteConfig.seo.siteUrl),
  openGraph: {
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.seo.defaultDescription,
    url: siteConfig.seo.siteUrl,
    siteName: siteConfig.brand.name,
    images: [{ url: siteConfig.seo.ogImage, width: 1200, height: 630 }],
    locale: "zh_TW",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.seo.defaultDescription,
    images: [siteConfig.seo.ogImage],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: siteConfig.seo.siteUrl },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "EventVenue"],
    name: `${siteConfig.brand.name} ${siteConfig.brand.nameCN}`,
    description: siteConfig.seo.defaultDescription,
    url: siteConfig.seo.siteUrl,
    telephone: siteConfig.contact.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: "瀨南街205號",
      addressLocality: siteConfig.location.district,
      addressRegion: siteConfig.location.city,
      postalCode: siteConfig.location.postalCode,
      addressCountry: "TW",
    },
    geo: { "@type": "GeoCoordinates", latitude: siteConfig.location.lat, longitude: siteConfig.location.lng },
    image: `${siteConfig.seo.siteUrl}${siteConfig.seo.ogImage}`,
    priceRange: "$$",
    openingHours: "Mo-Su 09:00-24:00",
    sameAs: [siteConfig.contact.instagram],
  };

  return (
    <html lang="zh-TW" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+TC:wght@300;400;500;600;700&family=Oswald:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <StickyLineButton />
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}
