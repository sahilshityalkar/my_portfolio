import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // a note that was published briefly and then withdrawn; keep its old
  // address useful for anyone who saved it
  redirects: async () => [
    { source: "/writing/a-portfolio-that-prints-as-a-resume", destination: "/writing", permanent: true },
  ],
};

export default nextConfig;
