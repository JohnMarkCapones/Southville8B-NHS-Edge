import bundleAnalyzer from "@next/bundle-analyzer"
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Enable Next.js automatic image optimization
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Allow local placeholder SVG with query params (required from Next.js 16)
    localPatterns: [
      {
        pathname: "/placeholder.svg",
        // Match any combination of these query params
        search: "height=*&width=*&text=*",
      },
    ],
    // We intentionally use SVG placeholders
    dangerouslyAllowSVG: true,
  },
  // Optimize CSS and JavaScript output
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  // Enable experimental optimizations for better performance
  experimental: {
    optimizeCss: true, // Enable CSS optimization
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  async redirects() {
    return [
      {
        source: "/event/:slug",
        destination: "/guess/event/:slug",
        permanent: true,
      },
    ]
  },
}

export default bundleAnalyzer({ enabled: process.env.ANALYZE === "true" })(nextConfig)
