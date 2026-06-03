/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tour frames are pre-optimized WebP served statically; the hero/section images are
  // already sized WebP. Skip Next's image loader — these are static, immutable assets.
  images: { unoptimized: true },

  // Tour frames are immutable static assets (path == identity, never change). Cache them
  // hard so scrolling the walkthrough back up serves instantly from disk instead of
  // revalidating every frame — revalidation round-trips starve the decoder's concurrent
  // slots and show up as scroll-back stutter (learned on the sister project). Same for images.
  async headers() {
    return [
      {
        source: "/frames/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
