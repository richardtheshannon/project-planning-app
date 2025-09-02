/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Try to fix Jest worker issues
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  // Re-enable SWC minify to fix Terser build errors  
  swcMinify: true,
  
  // Optimize build for @dnd-kit and other modern libraries
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Optimize for modern JavaScript features in browser builds
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/logos/**',
      },
      {
        protocol: 'https',
        hostname: '*.up.railway.app',
        pathname: '/logos/**',
      },
      {
        protocol: 'https',
        hostname: '*.railway.app',
        pathname: '/logos/**',
      }
    ],
    // Disable image optimization for local files to avoid issues
    unoptimized: process.env.NODE_ENV === 'development',
  },
}

module.exports = nextConfig