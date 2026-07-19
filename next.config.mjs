import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    proxyClientMaxBodySize: '100mb',
    outputFileTracingExcludes: {
      '*': ['uploads/**'],
    },
  },
};

export default nextConfig;
