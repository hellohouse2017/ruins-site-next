import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // Google indexed /zh/* URLs from old site structure — 301 to canonical paths
    const localeRedirects = ["zh", "en", "ja", "ko"].flatMap((locale) => [
      {
        source: `/${locale}`,
        destination: "/",
        permanent: true,
      },
      {
        source: `/${locale}/proposal`,
        destination: "/plans/proposal",
        permanent: true,
      },
      {
        source: `/${locale}/wedding`,
        destination: "/plans/wedding",
        permanent: true,
      },
      {
        source: `/${locale}/baby`,
        destination: "/plans/baby",
        permanent: true,
      },
      {
        source: `/${locale}/party`,
        destination: "/plans/party",
        permanent: true,
      },
      {
        source: `/${locale}/rental`,
        destination: "/plans/rental",
        permanent: true,
      },
      {
        source: `/${locale}/meeting`,
        destination: "/plans/meeting",
        permanent: true,
      },
      {
        source: `/${locale}/book`,
        destination: "/book",
        permanent: true,
      },
      // Catch-all for any other /:locale/:path
      {
        source: `/${locale}/:path*`,
        destination: "/:path*",
        permanent: true,
      },
    ]);

    return localeRedirects;
  },
};

export default nextConfig;
