/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  experimental: {
    serverActions: {
      bodySizeLimit: "1mb",
    },
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Workaround for Windows file-lock/EPERM issues on filesystem cache writes.
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
