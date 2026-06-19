import { MetadataRoute } from "next";
import siteConfig from "@/data/site-config.json";
import { legacyPlanSlugs } from "@/lib/v2/navigation";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = siteConfig.seo.siteUrl; // https://ruins-bar.com
    const updated = "2026-06-20";

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
        {
            url: `${baseUrl}/gallery`,
            lastModified: updated,
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/faq`,
            lastModified: updated,
            changeFrequency: "weekly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/location`,
            lastModified: updated,
            changeFrequency: "weekly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/insights`,
            lastModified: updated,
            changeFrequency: "weekly",
            priority: 0.8,
        },
        // 舊方案頁目前作為 v2 導流入口保留
        ...legacyPlanSlugs.map((slug) => ({
            url: `${baseUrl}/plans/${slug}`,
            lastModified: updated,
            changeFrequency: "weekly" as const,
            priority: 0.8,
        })),
    ];
}
