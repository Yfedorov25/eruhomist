/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hero frames are pre-optimized WebP served statically; skip the image loader.
  images: { unoptimized: true },
};

export default nextConfig;
