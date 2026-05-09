import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. GitHub Pages 배포를 위한 경로 설정
  basePath: '/pdfcraft',
  assetPrefix: '/pdfcraft',

  // Enable static export for deployment flexibility
  output: 'export',

  // Webpack configuration for WASM modules
  webpack: (config, { isServer, webpack }) => {
    // Handle qpdf-wasm and other modules that use Node.js built-ins
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        module: false,
        url: false,
        worker_threads: false,
        canvas: false,  // Required for pdfjs-dist-legacy
      };
    } else {
      // Mark canvas as external for server-side builds
      config.externals = config.externals || [];
      config.externals.push({
        canvas: 'commonjs canvas',
      });
    }

    // Also add module and canvas to alias for some packages that use it
    config.resolve.alias = {
      ...config.resolve.alias,
      'module': false,
    };

    // Ignore problematic modules that are not needed in browser
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^module$/
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^canvas$/,
        contextRegExp: /pdfjs-dist-legacy/
      })
    );

    // Enable WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    return config;
  },

  // Image optimization configuration
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // trailingSlash가 true여야 GitHub Pages에서 경로 인식이 잘 됩니다.
  trailingSlash: true,
  reactStrictMode: true,

  // 나머지 설정 유지...
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
};

export default withNextIntl(nextConfig);
