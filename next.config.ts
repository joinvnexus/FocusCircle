import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: process.env.NEXT_BUILD_SKIP_TYPECHECK === "1",
  },
};

export default nextConfig;
