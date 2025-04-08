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
  // Don't use assetPrefix as it can cause issues with Nginx proxy
  // assetPrefix: process.env.NODE_ENV === 'production' ? 'http://localhost:8080' : undefined,

  // Configure the server
  serverRuntimeConfig: {
    port: process.env.PORT || 3000,
  },

  // Enable output tracing for better debugging
  output: 'standalone',
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
