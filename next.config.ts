import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma 7 generated client imports @prisma/client/runtime/client — mark all
  // three packages as server-side externals so Next.js never tries to bundle them.
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
};

export default nextConfig;
