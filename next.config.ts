import type { NextConfig } from "next";
import { readFileSync } from "fs";
import { join } from "path";

// Read version from package.json at build time
const packageJson = JSON.parse(
  readFileSync(join(process.cwd(), "package.json"), "utf-8")
);

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  env: {
    APP_VERSION: packageJson.version,
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.pixabay.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pixabay.com",
        pathname: "/**",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.properties": {
        type: "raw",
      },
    },
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.properties$/,
      type: "asset/source",
    });
    return config;
  },
};

export default nextConfig;

