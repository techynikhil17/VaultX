/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    // Pre-compile all these routes at dev server startup so the first
    // user request to each page is instant instead of waiting 2-6s for
    // Turbopack to compile it on-demand.
    turbo: {},
  },
};
export default nextConfig;
