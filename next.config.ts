import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix for pdf-parse "ENOENT" error on Vercel
  // Prevents bundling of pdf-parse so it can access its internal files if needed
  serverExternalPackages: ['pdf-parse'],
};

export default nextConfig;
