/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["@heroicons/react", "@headlessui/react"]
  }
};

export default nextConfig;
