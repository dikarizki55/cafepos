import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      new URL(
        "https://zgqwlzpqthoiuspzjnin.supabase.co/storage/v1/object/public/cafepos/**"
      ),
    ],
  },
};

export default nextConfig;
