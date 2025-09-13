/** @type {import('next').NextConfig} */
const BACKEND = process.env.BACKEND_URL
  || 'https://microcourse-backend-final-clean.onrender.com';

const nextConfig = {
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${BACKEND}/api/:path*` }];
  },
  reactStrictMode: true,
  poweredByHeader: false,
};

module.exports = nextConfig;
