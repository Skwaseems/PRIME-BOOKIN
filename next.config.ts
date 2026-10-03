import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  images: {
    // Hosts allowed for remote photos (see src/data/media.ts).
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
    formats: ["image/avif", "image/webp"],
  },
  // Lets phones on the same Wi-Fi load the dev server (npm run dev:mobile).
  // Only affects `next dev`; production builds ignore it.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*", "100.*.*.*"],
};

export default nextConfig;
