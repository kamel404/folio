import type { MetadataRoute } from "next";
import { PLATFORM_URL } from "@/lib/config";

/**
 * robots.txt for the main domain. Tenant subdomains never reach this: the
 * proxy rewrites their /robots.txt to app/sites/[slug]/robots.txt.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/onboarding", "/preview", "/api/", "/auth/", "/sites/", "/styleguide"],
    },
    sitemap: `${PLATFORM_URL}/sitemap.xml`,
  };
}
