/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/collect.js",
        destination: "/api/sdk",
      },
    ];
  },
};

module.exports = nextConfig;
