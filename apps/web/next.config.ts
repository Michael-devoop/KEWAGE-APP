import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@skillconnect/domain", "@skillconnect/ui", "@skillconnect/api"],
};

export default nextConfig;
