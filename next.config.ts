import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  // Lets phones on the same Wi-Fi load the dev server (npm run dev:mobile).
  // Only affects `next dev`; production builds ignore it.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*", "100.*.*.*"],
};

export default nextConfig;
