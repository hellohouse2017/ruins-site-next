import { MetadataRoute } from "next";
import plans from "@/data/plans.json";
import siteConfig from "@/data/site-config.json";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = siteConfig.seo.siteUrl; // https://ruins-bar.com
    const updated = "2026-03-24";

    // Deduplicate plan slugs (some plans share same slug e.g. wedding)
    const planSlugs = [...new Set(plans.map((p) => p.slug))];

    return [
        {
            url: baseUrl,
            lastModified: updated,
            changeFrequency: "weekly",
            priority: 1.0,
        },
        {
            url: `${baseUrl}/book`,
            lastModified: updated,
            changeFrequency: "daily",
            priority: 0.9,
        },
        // 各方案頁
        ...planSlugs.map((slug) => ({
            url: `${baseUrl}/plans/${slug}`,
            lastModified: updated,
            changeFrequency: "weekly" as const,
            priority: 0.8,
        })),
    ];
}
