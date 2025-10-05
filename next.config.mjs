/** @type {import('next').NextConfig} */
const nextConfig = {
  // Automatically use basePath in production, not in development
  ...(process.env.NODE_ENV === 'production' && { basePath: '/freelance-hive' })
};

export default nextConfig;
