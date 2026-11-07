import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@skillconnect/domain", "@skillconnect/api"],
};

export default nextConfig;
