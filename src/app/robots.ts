import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/admin", "/api/", "/sign"],
        },
        sitemap: "https://ruins-bar.com/sitemap.xml",
    };
}
