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

  // Production optimizations
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header for security

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

    // Production optimizations
    if (process.env.NODE_ENV === 'production') {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for node_modules
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20
            },
            // Common chunk for shared code
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true
            }
          }
        }
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