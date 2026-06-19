import siteConfig from "@/data/site-config.json";
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/admin", "/api/", "/sign"],
        },
        sitemap: `${siteConfig.seo.siteUrl}/sitemap.xml`,
    };
}
