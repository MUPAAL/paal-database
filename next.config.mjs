/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects: async () => [
    {
      source: "/",
      destination: "/overview",
      permanent: true,
    },
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // Add assetPrefix for production builds to ensure assets are loaded correctly
  assetPrefix: process.env.NODE_ENV === 'production' ? 'http://localhost:8080' : undefined,
  // Configure the server to listen on port 8080
  serverRuntimeConfig: {
    port: 8080,
  },
  // Add API proxy configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:5005/api/:path*',
      },
    ];
  },
};

export default nextConfig;
