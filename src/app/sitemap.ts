import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { categoryMeta } from "@/data/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const categoryEntries = Object.keys(categoryMeta).map((slug) => ({
    url: `${siteConfig.url}/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...categoryEntries,
  ];
}
