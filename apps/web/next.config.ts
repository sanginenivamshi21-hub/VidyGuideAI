import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    const proxyTarget = process.env.API_PROXY_TARGET || 'https://vidyguideai-api.onrender.com';
    return [
      {
        source: '/api/:path*',
        destination: `${proxyTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
