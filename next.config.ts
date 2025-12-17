import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'enwhjnkfwjoxfswgelik.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com', // Adding Discord just in case as well since we use Discord auth
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
