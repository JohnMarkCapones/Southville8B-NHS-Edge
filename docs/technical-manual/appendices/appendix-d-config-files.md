# Appendix D: Configuration Files Reference

Complete reference for all configuration files used in the Southville 8B NHS Edge system.

---

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Next.js Configuration](#nextjs-configuration)
3. [Tailwind Configuration](#tailwind-configuration)
4. [TypeScript Configuration](#typescript-configuration)
5. [Package.json Scripts](#packagejson-scripts)
6. [NestJS Configuration](#nestjs-configuration)
7. [ESLint Configuration](#eslint-configuration)

---

## Environment Variables

### Frontend (.env.local)

Located in `frontend-nextjs/.env.local`:

```env
# Supabase Configuration
# These credentials are required for chat realtime functionality
# Copy from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Chat Service
# URL of the chat service API (defaults to localhost:3001)
NEXT_PUBLIC_CHAT_SERVICE_URL=http://localhost:3001

# API Configuration
# URL of the backend API (defaults to localhost:3000)
NEXT_PUBLIC_API_URL=http://localhost:3000

# Application Configuration
NEXT_PUBLIC_APP_NAME=Southville 8B NHS Edge
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags (optional)
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_ERROR_REPORTING=false

# Development (optional)
# Set to 'true' to enable bundle analysis
ANALYZE=false
```

### Backend (.env)

Located in root directory `.env`:

```env
# Application
NODE_ENV=development
PORT=3000
API_VERSION=1

# Supabase Configuration
# Get these from your Supabase project settings
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Cloudflare R2 Configuration
# Get these from Cloudflare R2 dashboard
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=your-bucket-name
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com

# R2 Upload Configuration
R2_MAX_FILE_SIZE=10485760
R2_PRESIGNED_URL_EXPIRATION=3600
R2_ALLOWED_MIME_TYPES=application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,image/jpeg,image/png,image/webp

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
CORS_CREDENTIALS=true

# Security
HELMET_ENABLED=true
CSP_ENABLED=true

# Logging
LOG_LEVEL=debug
```

### Chat Service (.env)

Located in `southville-chat-service/.env`:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Supabase Configuration
# Must match the credentials in backend .env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### Environment Variable Descriptions

#### Frontend Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL | - |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public key | - |
| `NEXT_PUBLIC_CHAT_SERVICE_URL` | No | Chat service API URL | `http://localhost:3001` |
| `NEXT_PUBLIC_API_URL` | No | Backend API URL | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_NAME` | No | Application name | `Southville 8B NHS Edge` |
| `NEXT_PUBLIC_APP_URL` | No | Application URL | `http://localhost:3000` |
| `ANALYZE` | No | Enable bundle analysis | `false` |

#### Backend Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `NODE_ENV` | No | Environment mode | `development` |
| `PORT` | No | Server port | `3000` |
| `SUPABASE_URL` | Yes | Supabase project URL | - |
| `SUPABASE_ANON_KEY` | Yes | Supabase anonymous key | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (admin) | - |
| `R2_ACCOUNT_ID` | Yes | Cloudflare account ID | - |
| `R2_ACCESS_KEY_ID` | Yes | R2 access key | - |
| `R2_SECRET_ACCESS_KEY` | Yes | R2 secret key | - |
| `R2_BUCKET_NAME` | Yes | R2 bucket name | - |
| `R2_MAX_FILE_SIZE` | No | Max upload size (bytes) | `10485760` (10MB) |
| `R2_PRESIGNED_URL_EXPIRATION` | No | URL expiration (seconds) | `3600` (1 hour) |
| `THROTTLE_TTL` | No | Rate limit window (ms) | `60000` |
| `THROTTLE_LIMIT` | No | Max requests per window | `100` |

---

## Next.js Configuration

### next.config.js

Located in `frontend-nextjs/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for highlighting potential problems
  reactStrictMode: true,

  // Image optimization configuration
  images: {
    // Allowed image domains
    domains: [
      'localhost',
      'your-domain.com',
      'supabase.co',
      'r2.cloudflarestorage.com',
    ],
    // Supported image formats
    formats: ['image/avif', 'image/webp'],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for different layouts
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Add custom webpack configurations here
    if (!isServer) {
      // Client-side only configurations
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Bundle analyzer (optional)
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer
            ? '../analyze/server.html'
            : './analyze/client.html',
          openAnalyzer: true,
        })
      );
    }

    return config;
  },

  // Experimental features
  experimental: {
    // Enable server actions
    serverActions: true,
  },

  // Environment variables exposed to the client
  // Note: Use NEXT_PUBLIC_ prefix for client-accessible vars
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Southville 8B NHS Edge',
  },

  // Headers configuration
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/guess',
        permanent: true,
      },
    ];
  },

  // Rewrites
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
```

---

## Tailwind Configuration

### tailwind.config.ts

Located in `frontend-nextjs/tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  // Dark mode configuration
  darkMode: ['class'],

  // Content paths for Tailwind to scan
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },

    extend: {
      // Custom colors
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        // School branding colors
        'school-blue': '#2563EB',
        'school-gold': '#F59E0B',
        'school-green': '#10B981',
        'school-red': '#EF4444',

        // Vibrant colors
        'vibrant-blue': '#3B82F6',
        'vibrant-indigo': '#6366F1',
        'vibrant-sky': '#0EA5E9',
        'vibrant-cyan': '#06B6D4',
        'vibrant-teal': '#14B8A6',
        'vibrant-slate': '#64748B',

        // Accent colors
        'accent-emerald': '#10B981',
        'accent-amber': '#F59E0B',
        'accent-rose': '#F43F5E',
      },

      // Custom border radius
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },

      // Custom fonts
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },

      // Custom keyframes
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gentleGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },

      // Custom animations
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        fadeIn: 'fadeIn 0.3s ease-out',
        slideInUp: 'slideInUp 0.3s ease-out',
        slideInLeft: 'slideInLeft 0.3s ease-out',
        slideInRight: 'slideInRight 0.3s ease-out',
        float: 'float 3s ease-in-out infinite',
        gentleGlow: 'gentleGlow 2s ease-in-out infinite',
      },

      // Custom screens
      screens: {
        xs: '475px',
        '3xl': '1920px',
      },

      // Custom spacing
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },

      // Custom z-index
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },

  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};

export default config;
```

---

## TypeScript Configuration

### tsconfig.json (Frontend)

Located in `frontend-nextjs/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    },
    "forceConsistentCasingInFileNames": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### tsconfig.json (Backend)

Located in root `tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
```

---

## Package.json Scripts

### Frontend Scripts

Located in `frontend-nextjs/package.json`:

```json
{
  "name": "southville-8b-nhs-edge",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "analyze": "set ANALYZE=true&& next build",
    "analyze:dev": "set ANALYZE=true&& next dev",
    "clean": "rimraf .next out dist"
  }
}
```

#### Script Descriptions (Frontend)

| Script | Description |
|--------|-------------|
| `dev` | Start development server at http://localhost:3000 |
| `build` | Create production build |
| `start` | Start production server |
| `lint` | Run ESLint for code quality checks |
| `lint:fix` | Automatically fix ESLint issues |
| `type-check` | Check TypeScript types without emitting files |
| `format` | Format code with Prettier |
| `format:check` | Check code formatting without changes |
| `analyze` | Build with bundle analysis (Windows) |
| `analyze:dev` | Dev server with bundle analysis (Windows) |
| `clean` | Remove build artifacts |

### Backend Scripts

Located in root `package.json`:

```json
{
  "name": "southville-nhs-api",
  "version": "1.0.0",
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "test:r2-connection": "ts-node src/scripts/test-r2-connection.ts",
    "security-check": "npm audit --audit-level=moderate"
  }
}
```

#### Script Descriptions (Backend)

| Script | Description |
|--------|-------------|
| `build` | Compile TypeScript to JavaScript |
| `start` | Start the application |
| `start:dev` | Start with watch mode (auto-reload) |
| `start:debug` | Start with debugging enabled |
| `start:prod` | Start production build |
| `lint` | Run ESLint with auto-fix |
| `format` | Format code with Prettier |
| `test` | Run unit tests |
| `test:watch` | Run tests in watch mode |
| `test:cov` | Run tests with coverage report |
| `test:e2e` | Run end-to-end tests |
| `test:r2-connection` | Test R2 storage connection |
| `security-check` | Check for security vulnerabilities |

---

## NestJS Configuration

### main.ts

Located in `src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from '@fastify/helmet';
import compression from '@fastify/compress';
import multipart from '@fastify/multipart';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create app with Fastify
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Security middleware
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'https:'],
        scriptSrc: [`'self'`],
      },
    },
  });

  // Compression
  await app.register(compression);

  // Multipart support for file uploads
  await app.register(multipart, {
    limits: {
      fileSize: parseInt(process.env.R2_MAX_FILE_SIZE || '10485760', 10), // 10MB default
      files: 1,
    },
  });

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Southville 8B NHS Edge API')
    .setDescription('API documentation for Southville 8B NHS Edge school portal')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('students', 'Student management')
    .addTag('teachers', 'Teacher management')
    .addTag('modules', 'Educational modules')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Start server
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();
```

---

## ESLint Configuration

### .eslintrc.js (Frontend)

Located in `frontend-nextjs/.eslintrc.js`:

```javascript
module.exports = {
  extends: ['next/core-web-vitals', 'prettier'],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    'react/no-unescaped-entities': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
  },
};
```

### .eslintrc.js (Backend)

Located in root `.eslintrc.js`:

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
```

---

## Additional Configuration Files

### .prettierrc

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true,
  "arrowParens": "always"
}
```

### .gitignore

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output

# Next.js
.next/
out/
build/

# Production
dist/

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env
.env*.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
```

---

**Navigation:**
- [← Back: Appendix C - Code Examples](./appendix-c-code-examples.md)
- [Next: Appendix E - Database Schema →](./appendix-e-database-schema.md)
- [Back to Appendices](./README.md)

---

**Last Updated:** January 2026
**Version:** 1.0.0
**Word Count:** ~5,100 words
