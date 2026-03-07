import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/openrouter-dashboard",
  images: { unoptimized: true },
};

export default nextConfig;
