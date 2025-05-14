// next.config.mjs - Using ESM format

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure for Cloudflare Pages
  reactStrictMode: true,
  
  // Enable image optimization
  images: {
    domains: ['images.unsplash.com'],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  // Configure for Cloudflare Pages with app directory
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Add polyfills for browser-only bundles
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        net: false,
        tls: false,
        child_process: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        process: 'process/browser',
        zlib: false,
      };

      // Add buffer and process to the providePlugin
      // Use webpack from the webpack context that Next.js provides
      const { webpack } = config;
      if (webpack) {
        config.plugins.push(
          new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            process: 'process/browser',
          })
        );
      }
    }
    return config;
  },
};

export default nextConfig;
