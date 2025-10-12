import bundleAnalyzer from "@next/bundle-analyzer"
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  optimizePackageImports: ["lucide-react"],
  images: {
    unoptimized: true,
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
