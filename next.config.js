/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  // No need to manually set env here, Next.js picks them up automatically
};

export default nextConfig;