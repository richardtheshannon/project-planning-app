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
  // Disable SWC minify which can cause worker issues
  swcMinify: false,
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