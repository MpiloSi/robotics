/* @type {import('next').NextConfig} */
/*const nextConfig = {
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
*/
import { spawn } from 'child_process';
import { NextConfig } from 'next';

const nextConfig: NextConfig = {
    webpack(config, { isServer }) {
      if (isServer) {
        // Start the Flask server
        const flaskServer = spawn('python', ['./object_detection.py'], {
          stdio: 'inherit',
        });
  
        flaskServer.on('close', (code) => {
          console.log(`Flask server exited with code ${code}`);
        });
      }
  
      return config;
    },
}

export default nextConfig;
