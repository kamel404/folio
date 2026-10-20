import type { MetadataRoute } from "next";
import { PLATFORM_URL } from "@/lib/config";

/** The main domain's public pages. Each portfolio lists its own (app/sites/[slug]/sitemap.xml). */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: PLATFORM_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${PLATFORM_URL}/pricing`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${PLATFORM_URL}/signup`, changeFrequency: "yearly", priority: 0.5 },
  ];
}
