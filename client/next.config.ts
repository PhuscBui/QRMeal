import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "localhost",
        pathname: "/**",
      },
      {
        hostname: "via.placeholder.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
        port: "",
        search: "",
      },
    ],
    dangerouslyAllowSVG: true,
    domains: ["placehold.co"],
  },
};

export default nextConfig;
