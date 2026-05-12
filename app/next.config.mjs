/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The engine package contains node-specific modules used in API routes.
  experimental: {
    serverComponentsExternalPackages: ['cheerio', 'jszip', '@anthropic-ai/sdk'],
  },
  // Allow imports from the sibling engine workspace.
  transpilePackages: ['@trustfolder/engine'],
};

export default nextConfig;
