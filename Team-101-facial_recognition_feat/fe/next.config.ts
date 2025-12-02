import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Remove rewrites - we'll handle proxy in server.js
};

export default nextConfig;
