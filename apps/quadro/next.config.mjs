/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hero frames are pre-optimized WebP served statically; skip the image loader.
  images: { unoptimized: true },

  // Hero frames are immutable static assets (path == identity, never change). Cache them
  // hard so scrolling back up serves instantly from disk instead of revalidating every
  // frame — revalidation round-trips were starving the decoder's concurrent slots and
  // showing up as scroll-back stutter. Same for the section renders + map texture.
  async headers() {
    return [
      {
        source: "/frames/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/renders/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/assets/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
