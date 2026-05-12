import path from 'node:path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The engine package contains node-specific modules used in API routes.
  experimental: {
    serverComponentsExternalPackages: ['cheerio', 'jszip', '@anthropic-ai/sdk'],
  },
  // Allow imports from the sibling engine workspace.
  transpilePackages: ['@trustfolder/engine'],
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(process.cwd()),
      '@anthropic-ai/sdk': path.resolve(process.cwd(), 'node_modules/@anthropic-ai/sdk'),
      '@supabase/supabase-js': path.resolve(process.cwd(), 'node_modules/@supabase/supabase-js'),
      cheerio: path.resolve(process.cwd(), 'node_modules/cheerio'),
      jszip: path.resolve(process.cwd(), 'node_modules/jszip'),
      resend: path.resolve(process.cwd(), 'node_modules/resend'),
      zod: path.resolve(process.cwd(), 'node_modules/zod'),
    };
    return config;
  },
};

export default nextConfig;
