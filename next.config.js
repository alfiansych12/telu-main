/** @type {import('next').NextConfig} */
const isProdOrStaging = process.env.NEXT_PUBLIC_ENV === 'production' || process.env.NEXT_PUBLIC_ENV === 'staging';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const nextConfig = {
  output: isProdOrStaging ? 'standalone' : undefined,
  basePath: isProdOrStaging ? basePath : undefined,
  // assetPrefix: isProdOrStaging ? basePath : undefined,
  env: {
    NEXT_PUBLIC_NEXT_APP_VERSION: process.env.npm_package_version
  },
  modularizeImports: {
    '@mui/material': {
      transform: '@mui/material/{{member}}'
    },
    '@mui/lab': {
      transform: '@mui/lab/{{member}}'
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
        pathname: '**'
      }
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb'
    }
  }
};

module.exports = nextConfig;
