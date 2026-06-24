import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Tells Next.js to export static HTML files
  images: {
    unoptimized: true, // Required for static exports
  },
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "/shree-siddhivinayak-art-website",
};

export default nextConfig;
