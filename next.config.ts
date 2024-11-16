/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['react-toastify'],
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/video_feed',
        destination: 'http://localhost:5001/video_feed',
      },
    ]
  },
}

module.exports = nextConfig