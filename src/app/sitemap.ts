import type { MetadataRoute } from "next";
import { forts } from "@/lib/forts";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const buildDate = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: buildDate,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/circuits`,
      lastModified: buildDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/timeline`,
      lastModified: buildDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/data`,
      lastModified: buildDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: buildDate,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  const fortRoutes: MetadataRoute.Sitemap = forts.map((fort) => ({
    url: `${siteUrl}/forts/${fort.slug}`,
    lastModified: fort.reviewedOn ? new Date(fort.reviewedOn) : buildDate,
    changeFrequency: "monthly",
    priority: fort.profileStatus === "curated" ? 0.7 : 0.5,
  }));

  return [...staticRoutes, ...fortRoutes];
}
