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
    // Let Vercel handle image optimization in production
    // Allow local placeholder SVG with query params (required from Next.js 16)
    // Enable Next.js automatic image optimization
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimized images for 1 year
    minimumCacheTTL: 31536000,
    // Allow external image domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-a9f924050e1f1ee11d51659b08634fc4.r2.dev',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
        port: '',
        pathname: '/**',
      },
    ],
    // Allow local images (required from Next.js 16)
    localPatterns: [
      {
        pathname: "/placeholder.svg",
      },
      {
        pathname: "/logo-48.webp",
      },
      {
        pathname: "/logo-48.png",
      },
      {
        pathname: "/logo.png",
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
    // Improve bundling performance (PPR disabled - requires Next.js canary)
    optimizeServerReact: true,
  },
  // Webpack configuration for react-pdf-viewer
  webpack: (config, { isServer }) => {
    // Handle PDF.js worker
    config.resolve.alias = {
      ...config.resolve.alias,
      'pdfjs-dist/build/pdf.worker.entry': 'pdfjs-dist/build/pdf.worker.mjs',
    }
    
    // Handle canvas and other Node.js modules for server-side rendering
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    // Handle PDF.js modules
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    })
    
    return config
  },
  // Use default output on Vercel (no standalone)
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
