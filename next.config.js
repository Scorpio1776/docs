/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['tsx', 'ts'],
  experimental: {
    serverComponentsExternalPackages: ['rss-parser'],
  },
};

module.exports = nextConfig;
