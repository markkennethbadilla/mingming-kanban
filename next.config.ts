import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  serverExternalPackages: ['pg', 'sequelize'],
};

export default nextConfig;
