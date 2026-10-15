import type { NextConfig } from "next";

// Tenant images live in Supabase Storage: allow next/image to optimize only that bucket
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const storagePattern = supabaseUrl
  ? [new URL("/storage/v1/object/public/portfolio-images/**", supabaseUrl)]
  : [];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: storagePattern,
  },
  experimental: {
    serverActions: {
      // Profile / project images are sent through Server Actions (max 4 MB + multipart overhead)
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
