/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Add this if your repo name is not your username
  basePath: '/shopping-list-app',
  assetPrefix: '/shopping-list-app/',
}

export default nextConfig