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
    domains: ["images.unsplash.com"],
  },
};

export default nextConfig;

