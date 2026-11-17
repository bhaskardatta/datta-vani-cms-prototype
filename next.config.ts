import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // ponytail: cacheComponents / partialPrefetching off: the prototype is client-only (data lives in the browser).
  reactCompiler: true,
  turbopack: {
    // There are other lockfiles higher up on the Desktop; pin the project root here.
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
