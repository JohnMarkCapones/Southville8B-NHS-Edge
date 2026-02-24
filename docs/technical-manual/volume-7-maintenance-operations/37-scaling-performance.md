# Chapter 37: Scaling & Performance Optimization

## Table of Contents

- [Introduction](#introduction)
- [Scaling Strategies Overview](#scaling-strategies-overview)
- [Next.js Frontend Scaling](#nextjs-frontend-scaling)
- [NestJS API Scaling](#nestjs-api-scaling)
- [Database Scaling](#database-scaling)
- [Caching Strategies](#caching-strategies)
- [Storage Performance](#storage-performance)
- [Real-time Scaling](#real-time-scaling)
- [Performance Optimization](#performance-optimization)
- [Load Testing](#load-testing)
- [Cost Optimization](#cost-optimization)
- [Capacity Planning](#capacity-planning)
- [Monitoring and Metrics](#monitoring-and-metrics)

## Introduction

This chapter provides comprehensive guidance on scaling the Southville 8B NHS Edge platform to handle growing user bases, traffic spikes, and increasing data volumes while maintaining optimal performance and managing costs effectively.

### Understanding Scale

The Southville 8B NHS Edge platform currently serves approximately 1,200 students, 50 teachers, and 10 administrators. As the system grows, you'll need to plan for:

**User Growth Scenarios**:
- **Phase 1 (Current)**: 1,500 total users, 300 concurrent users
- **Phase 2 (Multi-school)**: 5,000 total users, 1,000 concurrent users
- **Phase 3 (District-wide)**: 20,000 total users, 4,000 concurrent users
- **Phase 4 (Regional)**: 100,000+ total users, 20,000+ concurrent users

**Traffic Patterns**:
- Morning peak (7-9 AM): Class schedule viewing, assignment checks
- Midday peak (12-2 PM): Student portal activity, quiz submissions
- Afternoon peak (3-5 PM): After-school activities, teacher grading
- Exam periods: 5-10x normal load on quiz system

### Performance Goals

Target metrics for optimal user experience:

| Metric | Target | Maximum |
|--------|--------|---------|
| Page Load Time (First Contentful Paint) | < 1.5s | < 3s |
| Time to Interactive | < 3s | < 5s |
| API Response Time (p95) | < 200ms | < 500ms |
| API Response Time (p99) | < 500ms | < 1s |
| Database Query Time (p95) | < 50ms | < 200ms |
| Real-time Message Latency | < 100ms | < 500ms |
| Uptime | 99.9% | 99.5% |

### Cost Considerations

Balance performance with cost efficiency:
- **Development**: Minimal infrastructure, focus on speed
- **Staging**: Production-like environment, moderate costs
- **Production**: Optimized for performance and reliability
- **Auto-scaling**: Scale up during peak hours, scale down during off-hours

## Scaling Strategies Overview

### Horizontal vs Vertical Scaling

**Vertical Scaling (Scale Up)**:
```
Advantages:
✓ Simpler to implement
✓ No code changes required
✓ Better for single-threaded operations
✓ Lower network latency

Disadvantages:
✗ Hardware limits (can't scale infinitely)
✗ Single point of failure
✗ More expensive per unit
✗ Downtime required for upgrades
```

**Horizontal Scaling (Scale Out)**:
```
Advantages:
✓ Near-infinite scalability
✓ High availability (redundancy)
✓ Cost-effective (commodity hardware)
✓ No downtime for scaling

Disadvantages:
✗ More complex architecture
✗ Requires load balancing
✗ May need code changes (stateless)
✗ Network overhead between nodes
```

**Recommended Approach**:
```
Start with vertical scaling:
1. Optimize code and queries
2. Add caching
3. Upgrade server resources

Then add horizontal scaling:
1. Implement stateless architecture
2. Add load balancer
3. Deploy multiple instances
4. Scale based on metrics
```

### Scaling Decision Matrix

```typescript
// When to scale what
const scalingDecisionTree = {
  // High CPU usage (>70% sustained)
  highCPU: {
    frontend: [
      'Enable code splitting',
      'Optimize bundle size',
      'Add CDN for static assets',
      'Horizontal scale (more instances)',
    ],
    backend: [
      'Profile and optimize hot paths',
      'Add caching',
      'Horizontal scale (cluster mode)',
      'Offload to background jobs',
    ],
  },

  // High memory usage (>80% sustained)
  highMemory: {
    frontend: [
      'Optimize images and assets',
      'Fix memory leaks',
      'Increase instance size',
    ],
    backend: [
      'Fix memory leaks',
      'Optimize data structures',
      'Add pagination',
      'Increase instance size',
    ],
  },

  // Slow response times (>1s p95)
  slowResponse: {
    frontend: [
      'Add route prefetching',
      'Optimize data fetching',
      'Add loading states',
    ],
    backend: [
      'Add database indexes',
      'Optimize queries',
      'Add caching layer',
      'Use database read replicas',
    ],
  },

  // High database load
  databaseBottleneck: [
    'Add indexes',
    'Optimize queries',
    'Add caching (Redis)',
    'Add read replicas',
    'Shard database',
    'Upgrade database instance',
  ],

  // Traffic spikes
  trafficSpike: [
    'Enable auto-scaling',
    'Add rate limiting',
    'Implement request queueing',
    'Add CDN',
    'Cache aggressive',
  ],
};
```

## Next.js Frontend Scaling

### Vercel Deployment (Recommended)

Vercel provides automatic scaling for Next.js applications.

**Configuration**:
```typescript
// vercel.json
{
  "functions": {
    "app/**/*.ts": {
      "memory": 3008,        // MB, max for Pro plan
      "maxDuration": 60      // seconds
    }
  },
  "regions": ["iad1"],       // Choose closest to users
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": ".next"
}
```

**Scaling Features**:
```typescript
// Automatic features on Vercel:
const vercelFeatures = {
  autoScaling: true,           // Automatic horizontal scaling
  edgeNetwork: true,           // 100+ edge locations
  imageOptimization: true,     // Automatic image optimization
  incrementalStaticRegeneration: true,  // ISR for dynamic content
  edgeFunctions: true,         // Run at edge for <50ms response
  analytics: true,             // Real user metrics
};

// Enable ISR for frequently accessed pages
export const revalidate = 60; // Revalidate every 60 seconds

// app/student/dashboard/page.tsx
export default async function Dashboard() {
  const data = await fetchDashboardData();

  return <DashboardView data={data} />;
}
```

**Performance Optimizations**:

1. **Code Splitting**:
```typescript
// Automatic route-based splitting (built-in)
// Each route in app/ is automatically split

// Component-level splitting
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/Heavy'), {
  loading: () => <Skeleton />,
  ssr: false, // Don't render on server if not needed
});

// Conditional loading
const AdminPanel = dynamic(() => import('@/components/AdminPanel'), {
  ssr: false,
});

export default function Page() {
  const { user } = useSession();

  return (
    <div>
      {user?.role === 'admin' && <AdminPanel />}
    </div>
  );
}
```

2. **Image Optimization**:
```typescript
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'], // Modern formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-*.r2.dev', // R2 storage
      },
    ],
  },
};

// Usage
import Image from 'next/image';

<Image
  src="/profile.jpg"
  alt="Profile"
  width={200}
  height={200}
  priority={false}      // Only for above-fold images
  placeholder="blur"    // Show blur during load
  blurDataURL="data:..." // Base64 placeholder
/>
```

3. **Font Optimization**:
```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',      // Prevent invisible text
  preload: true,        // Preload font
  variable: '--font-inter',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

4. **Prefetching**:
```typescript
// Prefetch links on hover (automatic)
import Link from 'next/link';

<Link href="/student/dashboard" prefetch={true}>
  Dashboard
</Link>

// Programmatic prefetch
import { useRouter } from 'next/navigation';

const router = useRouter();

// Prefetch on component mount
useEffect(() => {
  router.prefetch('/student/courses');
}, [router]);

// Prefetch on hover
<button
  onMouseEnter={() => router.prefetch('/student/quiz')}
  onClick={() => router.push('/student/quiz')}
>
  Start Quiz
</button>
```

5. **Edge Functions**:
```typescript
// Use edge runtime for fast API routes
// app/api/check-auth/route.ts
export const runtime = 'edge';

export async function GET(request: Request) {
  const token = request.headers.get('authorization');

  // Fast auth check at edge
  const isValid = await verifyToken(token);

  return Response.json({ valid: isValid });
}
```

### Self-Hosted Scaling

For self-hosted deployments, implement custom scaling.

**Docker + Nginx + Multiple Instances**:

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Nginx load balancer
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend-1
      - frontend-2
      - frontend-3

  # Frontend instances
  frontend-1:
    build:
      context: ./frontend-nextjs
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - PORT=3000
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G

  frontend-2:
    build:
      context: ./frontend-nextjs
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - PORT=3000
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G

  frontend-3:
    build:
      context: ./frontend-nextjs
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - PORT=3000
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
```

**Nginx Load Balancer Configuration**:
```nginx
# nginx.conf
upstream frontend {
    least_conn;  # Use least connections algorithm
    server frontend-1:3000 max_fails=3 fail_timeout=30s;
    server frontend-2:3000 max_fails=3 fail_timeout=30s;
    server frontend-3:3000 max_fails=3 fail_timeout=30s;

    keepalive 32;  # Keep connections alive
}

server {
    listen 80;
    server_name southville8b.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name southville8b.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/json application/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Static assets caching
    location /_next/static/ {
        proxy_pass http://frontend;
        proxy_cache_valid 200 365d;
        proxy_cache_key "$uri";
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Images caching
    location /_next/image {
        proxy_pass http://frontend;
        proxy_cache_valid 200 7d;
        add_header Cache-Control "public, max-age=604800";
    }

    # All other requests
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**Kubernetes Deployment** (Advanced):
```yaml
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  labels:
    app: southville-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: southville-frontend
  template:
    metadata:
      labels:
        app: southville-frontend
    spec:
      containers:
      - name: frontend
        image: southville/frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  type: LoadBalancer
  selector:
    app: southville-frontend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: frontend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: frontend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### CDN Integration

Use a CDN for static assets and edge caching.

**Cloudflare Setup**:
```typescript
// next.config.js
module.exports = {
  assetPrefix: process.env.NODE_ENV === 'production'
    ? 'https://cdn.southville8b.com'
    : '',

  images: {
    loader: 'custom',
    loaderFile: './lib/image-loader.ts',
  },
};

// lib/image-loader.ts
export default function cloudflareLoader({ src, width, quality }) {
  const params = [`width=${width}`];
  if (quality) {
    params.push(`quality=${quality}`);
  }
  const paramsString = params.join(',');
  return `https://cdn.southville8b.com/cdn-cgi/image/${paramsString}/${src}`;
}
```

**Cloudflare Page Rules**:
```
Cache Level: Standard
Browser Cache TTL: 4 hours
Edge Cache TTL: 7 days

Cache by Device Type: On
Auto Minify: HTML, CSS, JS
Brotli: On
HTTP/2: On
HTTP/3 (QUIC): On
```

## NestJS API Scaling

### Process Management with PM2

**Single Instance**:
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'southville-api',
    script: './dist/main.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
    },
    env_production: {
      NODE_ENV: 'production',
    },
  }]
};
```

**Cluster Mode** (Horizontal Scaling):
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'southville-api',
    script: './dist/main.js',
    instances: 'max',        // Use all CPU cores
    exec_mode: 'cluster',    // Cluster mode
    instance_var: 'INSTANCE_ID',

    // Auto-restart configuration
    max_memory_restart: '500M',
    min_uptime: '10s',
    max_restarts: 10,

    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 3000,

    env: {
      NODE_ENV: 'production',
      PORT: 3001,
    },

    // Logging
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,

    // Monitoring
    monitor_mode: true,
  }]
};

// Start cluster
// pm2 start ecosystem.config.js
// pm2 scale southville-api 4  // Scale to 4 instances
```

**Handle Cluster-Specific Code**:
```typescript
// main.ts
import cluster from 'cluster';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  // Only run once (not per worker)
  if (!cluster.worker || cluster.worker.id === 1) {
    // Migrations, cron jobs, etc.
    await runMigrations();
    setupCronJobs();
  }

  await app.listen(process.env.PORT || 3001, '0.0.0.0');

  // Signal ready for PM2
  if (process.send) {
    process.send('ready');
  }

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await app.close();
    process.exit(0);
  });
}

bootstrap();
```

### Load Balancing

**Nginx Load Balancer**:
```nginx
# /etc/nginx/sites-available/api.southville8b.com
upstream api_backend {
    # Load balancing method
    least_conn;  # Options: round_robin (default), least_conn, ip_hash

    # Backend servers
    server 127.0.0.1:3001 weight=3 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:3002 weight=2 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:3003 weight=1 max_fails=3 fail_timeout=30s;

    # Backup server
    server 127.0.0.1:3004 backup;

    # Connection pooling
    keepalive 32;
    keepalive_requests 100;
    keepalive_timeout 60s;
}

server {
    listen 80;
    server_name api.southville8b.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.southville8b.com;

    ssl_certificate /etc/letsencrypt/live/api.southville8b.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.southville8b.com/privkey.pem;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;
    limit_req zone=api_limit burst=200 nodelay;

    # Request size limits
    client_max_body_size 50M;
    client_body_buffer_size 128k;

    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;

    # Buffering
    proxy_buffering on;
    proxy_buffer_size 4k;
    proxy_buffers 8 4k;
    proxy_busy_buffers_size 8k;

    location / {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;

        # Headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint (no rate limit)
    location /health {
        proxy_pass http://api_backend;
        access_log off;
    }
}
```

### Horizontal Scaling Best Practices

**Stateless Architecture**:
```typescript
// ❌ Wrong - storing state in memory
let userSessions = new Map();

@Post('login')
async login(@Body() credentials) {
  const user = await this.authService.validateUser(credentials);
  const sessionId = generateSessionId();

  // Don't do this in scaled environment!
  userSessions.set(sessionId, user);

  return { sessionId };
}

// ✅ Correct - using external store (Redis)
@Injectable()
export class AuthService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async createSession(user: User): Promise<string> {
    const sessionId = generateSessionId();

    // Store in Redis (shared across instances)
    await this.redis.setex(
      `session:${sessionId}`,
      3600,
      JSON.stringify(user)
    );

    return sessionId;
  }

  async getSession(sessionId: string): Promise<User | null> {
    const data = await this.redis.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }
}
```

**Distributed Locking**:
```typescript
// For operations that require locks across instances
import Redlock from 'redlock';

@Injectable()
export class QuizService {
  private redlock: Redlock;

  constructor(
    @InjectRedis() private readonly redis: Redis,
  ) {
    this.redlock = new Redlock([redis], {
      retryCount: 10,
      retryDelay: 200,
    });
  }

  async submitQuiz(quizId: string, studentId: string, answers: Answer[]) {
    const lock = await this.redlock.acquire(
      [`quiz:${quizId}:student:${studentId}`],
      1000 // Lock for 1 second
    );

    try {
      // Check if already submitted
      const existing = await this.submissionRepository.findOne({
        where: { quizId, studentId }
      });

      if (existing) {
        throw new ConflictException('Quiz already submitted');
      }

      // Create submission
      const submission = await this.submissionRepository.save({
        quizId,
        studentId,
        answers,
      });

      return submission;
    } finally {
      await lock.release();
    }
  }
}
```

**Background Job Processing**:
```typescript
// Offload heavy tasks to background workers
import { Queue, Worker } from 'bullmq';

@Injectable()
export class ReportService {
  private reportQueue: Queue;

  constructor(@InjectRedis() private readonly redis: Redis) {
    this.reportQueue = new Queue('report-generation', {
      connection: redis,
    });
  }

  async generateReport(reportId: string) {
    // Add to queue instead of processing immediately
    await this.reportQueue.add('generate', {
      reportId,
      timestamp: Date.now(),
    });

    return { status: 'queued', reportId };
  }
}

// Worker process (separate from API)
// worker.ts
const worker = new Worker('report-generation', async (job) => {
  const { reportId } = job.data;

  // Heavy processing
  const report = await generateReportPdf(reportId);
  await uploadToStorage(report);
  await notifyUser(reportId);

  return { success: true };
}, {
  connection: redis,
  concurrency: 5, // Process 5 jobs concurrently
});

// Run worker
// pm2 start worker.js -i 2  // 2 worker instances
```

### API Rate Limiting

```typescript
// Rate limiting configuration
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            name: 'short',
            ttl: 1000,     // 1 second
            limit: 10,     // 10 requests
          },
          {
            name: 'medium',
            ttl: 60000,    // 1 minute
            limit: 100,    // 100 requests
          },
          {
            name: 'long',
            ttl: 3600000,  // 1 hour
            limit: 1000,   // 1000 requests
          },
        ],
        storage: new ThrottlerStorageRedisService(config.get('REDIS_URL')),
      }),
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

// Custom rate limits per endpoint
@Controller('api/v1/quiz')
export class QuizController {
  @Get()
  @Throttle({ short: { limit: 20, ttl: 1000 } })
  async getQuizzes() {
    // Higher limit for listing
  }

  @Post(':id/submit')
  @Throttle({ short: { limit: 1, ttl: 1000 } })
  async submitQuiz() {
    // Strict limit for submissions
  }
}
```

## Database Scaling

### Supabase Scaling

**Connection Pooling**:
```typescript
// Use Supabase connection pooler for better performance
// .env
DATABASE_URL=postgresql://postgres:[password]@[host]:6543/postgres?pgbouncer=true

// For direct connections (migrations, admin tasks)
DATABASE_URL_DIRECT=postgresql://postgres:[password]@[host]:5432/postgres

// TypeORM configuration
export default {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  extra: {
    // Connection pool settings
    max: 20,                    // Maximum connections
    min: 5,                     // Minimum connections
    idleTimeoutMillis: 30000,   // Close idle after 30s
    connectionTimeoutMillis: 10000,
  },
};
```

**Read Replicas** (Supabase Pro+):
```typescript
// Configure read replica
import { DataSource } from 'typeorm';

const writeDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL_PRIMARY,
  // ... other options
});

const readDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL_REPLICA,
  // ... other options
});

@Injectable()
export class StudentService {
  // Use write connection for mutations
  async createStudent(data: CreateStudentDto) {
    return writeDataSource.manager.save(Student, data);
  }

  // Use read connection for queries
  async getStudents() {
    return readDataSource.manager.find(Student);
  }
}

// Or use TypeORM replication
export default {
  type: 'postgres',
  replication: {
    master: {
      url: process.env.DATABASE_URL_PRIMARY,
    },
    slaves: [
      { url: process.env.DATABASE_URL_REPLICA_1 },
      { url: process.env.DATABASE_URL_REPLICA_2 },
    ],
  },
};
```

### Query Optimization

**Indexes**:
```sql
-- Identify missing indexes
SELECT
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100  -- High cardinality columns
ORDER BY n_distinct DESC;

-- Add strategic indexes
CREATE INDEX CONCURRENTLY idx_students_email ON students(email);
CREATE INDEX CONCURRENTLY idx_students_grade ON students(grade_level);
CREATE INDEX CONCURRENTLY idx_assignments_due ON assignments(due_date)
  WHERE status = 'pending';  -- Partial index

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY idx_quiz_submissions_student_quiz
  ON quiz_submissions(student_id, quiz_id);

-- Full-text search index
CREATE INDEX idx_students_search ON students
  USING gin(to_tsvector('english', first_name || ' ' || last_name || ' ' || email));

-- Verify index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,          -- Number of times index was used
  idx_tup_read,      -- Tuples read from index
  idx_tup_fetch      -- Tuples fetched from table
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Remove unused indexes
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
  AND indexname NOT LIKE '%_pkey';
```

**Query Optimization**:
```typescript
// ❌ Slow - N+1 query
async getStudentsWithCourses() {
  const students = await this.studentRepository.find();

  for (const student of students) {
    student.courses = await this.courseRepository.find({
      where: { studentId: student.id }
    });
  }

  return students;
}

// ✅ Fast - eager loading
async getStudentsWithCourses() {
  return this.studentRepository.find({
    relations: ['courses'],  // Single JOIN query
  });
}

// ✅ Faster - custom query with specific fields
async getStudentsWithCourses() {
  return this.studentRepository
    .createQueryBuilder('student')
    .leftJoinAndSelect('student.courses', 'course')
    .select([
      'student.id',
      'student.firstName',
      'student.lastName',
      'course.id',
      'course.name',
    ])
    .getMany();
}

// ❌ Slow - loading unnecessary data
async getStudentNames() {
  const students = await this.studentRepository.find();
  return students.map(s => ({ id: s.id, name: s.fullName }));
}

// ✅ Fast - select only needed columns
async getStudentNames() {
  return this.studentRepository
    .createQueryBuilder('student')
    .select(['student.id', 'student.firstName', 'student.lastName'])
    .getMany();
}

// ✅ Even faster - raw query for specific use case
async getStudentNames() {
  return this.studentRepository.query(`
    SELECT id, first_name, last_name
    FROM students
    WHERE active = true
  `);
}
```

**Pagination**:
```typescript
// Efficient pagination
interface PaginationOptions {
  page: number;
  limit: number;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
}

async getStudents(options: PaginationOptions) {
  const { page = 1, limit = 50, orderBy = 'lastName', order = 'ASC' } = options;

  const [data, total] = await this.studentRepository.findAndCount({
    skip: (page - 1) * limit,
    take: limit,
    order: { [orderBy]: order },
  });

  return {
    data,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}

// Cursor-based pagination for real-time data
async getRecentMessages(cursor?: string, limit: number = 50) {
  const query = this.messageRepository
    .createQueryBuilder('message')
    .orderBy('message.createdAt', 'DESC')
    .take(limit);

  if (cursor) {
    query.where('message.createdAt < :cursor', { cursor });
  }

  const messages = await query.getMany();
  const nextCursor = messages.length === limit
    ? messages[messages.length - 1].createdAt.toISOString()
    : null;

  return {
    data: messages,
    nextCursor,
  };
}
```

### Database Monitoring

```sql
-- Active connections
SELECT
  count(*),
  state,
  wait_event_type
FROM pg_stat_activity
WHERE datname = 'postgres'
GROUP BY state, wait_event_type;

-- Long-running queries
SELECT
  pid,
  now() - query_start as duration,
  state,
  query
FROM pg_stat_activity
WHERE state != 'idle'
  AND now() - query_start > interval '5 seconds'
ORDER BY duration DESC;

-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY size_bytes DESC;

-- Cache hit ratio (should be >99%)
SELECT
  sum(heap_blks_read) as heap_read,
  sum(heap_blks_hit) as heap_hit,
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio
FROM pg_statio_user_tables;
```

## Caching Strategies

### Redis Integration

**Setup**:
```bash
# Install Redis
npm install @nestjs/redis ioredis

# Docker Compose
# docker-compose.yml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru

volumes:
  redis-data:
```

**NestJS Configuration**:
```typescript
// redis.module.ts
import { Module } from '@nestjs/common';
import { RedisModule as NestRedisModule } from '@nestjs/redis';

@Module({
  imports: [
    NestRedisModule.forRoot({
      config: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD,
        db: 0,
        keyPrefix: 'southville:',
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      },
    }),
  ],
  exports: [NestRedisModule],
})
export class RedisModule {}
```

**Caching Patterns**:

1. **Cache-Aside (Lazy Loading)**:
```typescript
@Injectable()
export class StudentService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly studentRepository: Repository<Student>,
  ) {}

  async getStudent(id: string): Promise<Student> {
    const cacheKey = `student:${id}`;

    // Try cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Cache miss - fetch from database
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['courses', 'enrollments'],
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Store in cache (1 hour TTL)
    await this.redis.setex(cacheKey, 3600, JSON.stringify(student));

    return student;
  }

  async updateStudent(id: string, data: UpdateStudentDto): Promise<Student> {
    const student = await this.studentRepository.save({ id, ...data });

    // Invalidate cache
    await this.redis.del(`student:${id}`);

    return student;
  }
}
```

2. **Write-Through Cache**:
```typescript
async updateStudent(id: string, data: UpdateStudentDto): Promise<Student> {
  // Update database
  const student = await this.studentRepository.save({ id, ...data });

  // Update cache immediately
  const cacheKey = `student:${id}`;
  await this.redis.setex(cacheKey, 3600, JSON.stringify(student));

  return student;
}
```

3. **Cache with Tags** (for batch invalidation):
```typescript
@Injectable()
export class CourseService {
  async getCourse(id: string): Promise<Course> {
    const cacheKey = `course:${id}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const course = await this.courseRepository.findOne({ where: { id } });

    // Store with tags
    await this.redis.setex(cacheKey, 3600, JSON.stringify(course));
    await this.redis.sadd(`course-tags:${course.departmentId}`, cacheKey);

    return course;
  }

  async invalidateDepartmentCourses(departmentId: string) {
    // Get all cache keys for department
    const keys = await this.redis.smembers(`course-tags:${departmentId}`);

    // Delete all
    if (keys.length > 0) {
      await this.redis.del(...keys);
      await this.redis.del(`course-tags:${departmentId}`);
    }
  }
}
```

4. **Request Caching** (API Response Cache):
```typescript
// cache.interceptor.ts
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const cacheKey = this.getCacheKey(request);

    // Try cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return of(JSON.parse(cached));
    }

    // Execute request and cache response
    return next.handle().pipe(
      tap(async (response) => {
        await this.redis.setex(cacheKey, 60, JSON.stringify(response));
      }),
    );
  }

  private getCacheKey(request: Request): string {
    return `api:${request.method}:${request.url}:${JSON.stringify(request.query)}`;
  }
}

// Usage
@Controller('students')
@UseInterceptors(CacheInterceptor)
export class StudentController {
  @Get()
  async getStudents(@Query() query: StudentQueryDto) {
    // Response cached for 60 seconds
  }
}
```

### CDN Caching

**Cloudflare Cache Rules**:
```typescript
// Set cache headers in API responses
@Get('announcements')
async getAnnouncements() {
  const announcements = await this.announcementService.getActive();

  return {
    data: announcements,
    // Cache for 5 minutes
    meta: {
      cacheControl: 'public, max-age=300',
    },
  };
}

// In controller interceptor
@Injectable()
export class CacheHeaderInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();

        if (data?.meta?.cacheControl) {
          response.header('Cache-Control', data.meta.cacheControl);
        }

        return data;
      }),
    );
  }
}
```

**Next.js Edge Caching**:
```typescript
// app/api/announcements/route.ts
export async function GET() {
  const announcements = await fetchAnnouncements();

  return Response.json(announcements, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
```

## Storage Performance

### R2 Multipart Upload

For large files (>100MB), use multipart upload.

```typescript
// upload.service.ts
import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
} from '@aws-sdk/client-s3';

@Injectable()
export class UploadService {
  private s3Client: S3Client;
  private readonly CHUNK_SIZE = 10 * 1024 * 1024; // 10MB

  constructor() {
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadLargeFile(
    file: Buffer,
    key: string,
    onProgress?: (percent: number) => void
  ): Promise<string> {
    // 1. Initiate multipart upload
    const multipart = await this.s3Client.send(
      new CreateMultipartUploadCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
      })
    );

    const uploadId = multipart.UploadId;
    const parts: { PartNumber: number; ETag: string }[] = [];

    // 2. Upload parts
    const numParts = Math.ceil(file.length / this.CHUNK_SIZE);

    for (let i = 0; i < numParts; i++) {
      const start = i * this.CHUNK_SIZE;
      const end = Math.min(start + this.CHUNK_SIZE, file.length);
      const chunk = file.slice(start, end);

      const uploadPart = await this.s3Client.send(
        new UploadPartCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key,
          UploadId: uploadId,
          PartNumber: i + 1,
          Body: chunk,
        })
      );

      parts.push({
        PartNumber: i + 1,
        ETag: uploadPart.ETag,
      });

      // Progress callback
      if (onProgress) {
        const percent = Math.round(((i + 1) / numParts) * 100);
        onProgress(percent);
      }
    }

    // 3. Complete upload
    await this.s3Client.send(
      new CompleteMultipartUploadCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts },
      })
    );

    return `https://pub-${process.env.R2_PUBLIC_URL}.r2.dev/${key}`;
  }
}
```

### Image Optimization

```typescript
// image-optimization.service.ts
import sharp from 'sharp';

@Injectable()
export class ImageOptimizationService {
  async optimizeImage(
    buffer: Buffer,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'jpeg' | 'png' | 'webp' | 'avif';
    } = {}
  ): Promise<Buffer> {
    const {
      width,
      height,
      quality = 80,
      format = 'webp',
    } = options;

    let image = sharp(buffer);

    // Resize if dimensions provided
    if (width || height) {
      image = image.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Convert format and compress
    switch (format) {
      case 'jpeg':
        image = image.jpeg({ quality, progressive: true });
        break;
      case 'png':
        image = image.png({ quality, compressionLevel: 9 });
        break;
      case 'webp':
        image = image.webp({ quality });
        break;
      case 'avif':
        image = image.avif({ quality });
        break;
    }

    return image.toBuffer();
  }

  async generateThumbnails(buffer: Buffer): Promise<{
    thumbnail: Buffer;
    small: Buffer;
    medium: Buffer;
    large: Buffer;
  }> {
    const [thumbnail, small, medium, large] = await Promise.all([
      this.optimizeImage(buffer, { width: 150, height: 150 }),
      this.optimizeImage(buffer, { width: 400, height: 400 }),
      this.optimizeImage(buffer, { width: 800, height: 800 }),
      this.optimizeImage(buffer, { width: 1600, height: 1600 }),
    ]);

    return { thumbnail, small, medium, large };
  }
}
```

## Real-time Scaling

### Supabase Realtime Channel Limits

**Channel Management**:
```typescript
// Efficient channel usage
@Injectable()
export class ChatRealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();

  async joinRoom(roomId: string, userId: string) {
    // Reuse existing channel if possible
    let channel = this.channels.get(roomId);

    if (!channel) {
      channel = this.supabase.channel(`room:${roomId}`, {
        config: {
          presence: {
            key: userId,
          },
          broadcast: {
            ack: false, // Disable for better performance
            self: false, // Don't broadcast to self
          },
        },
      });

      // Limit channels per instance
      if (this.channels.size >= 100) {
        // Remove oldest channel
        const oldestKey = this.channels.keys().next().value;
        const oldestChannel = this.channels.get(oldestKey);
        await oldestChannel.unsubscribe();
        this.channels.delete(oldestKey);
      }

      this.channels.set(roomId, channel);
    }

    await channel.subscribe();
    return channel;
  }

  async leaveRoom(roomId: string) {
    const channel = this.channels.get(roomId);
    if (channel) {
      await channel.unsubscribe();
      this.channels.delete(roomId);
    }
  }
}
```

**Connection Pooling**:
```typescript
// Frontend: Share Supabase client instance
// lib/supabase/client.ts
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        realtime: {
          params: {
            eventsPerSecond: 10, // Throttle events
          },
        },
      }
    );
  }

  return supabaseInstance;
}

// Use single instance throughout app
const supabase = getSupabaseClient();
```

### WebSocket Scaling

For custom WebSocket server (if needed):

```typescript
// websocket.gateway.ts with Redis adapter
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    const pubClient = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT, 10),
    });

    const subClient = pubClient.duplicate();

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}

// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  await app.listen(3001);
}
```

## Performance Optimization

### Frontend Optimization Checklist

```typescript
// Performance optimization checklist
const frontendOptimizations = {
  images: [
    '✓ Use Next.js Image component',
    '✓ Serve WebP/AVIF formats',
    '✓ Lazy load below-fold images',
    '✓ Use appropriate sizes',
    '✓ Add blur placeholders',
  ],

  code: [
    '✓ Code splitting by route',
    '✓ Dynamic imports for heavy components',
    '✓ Tree shaking unused code',
    '✓ Minification and compression',
  ],

  fonts: [
    '✓ Use next/font for optimization',
    '✓ Preload critical fonts',
    '✓ Use font-display: swap',
    '✓ Subset fonts to needed characters',
  ],

  rendering: [
    '✓ Use Server Components where possible',
    '✓ Implement streaming for slow data',
    '✓ Add loading states',
    '✓ Prefetch linked routes',
  ],

  state: [
    '✓ Memoize expensive computations',
    '✓ Use useCallback for event handlers',
    '✓ Virtualize long lists',
    '✓ Debounce input handlers',
  ],
};
```

**Practical Examples**:

```typescript
// 1. Memoization
import { useMemo, useCallback } from 'react';

export default function StudentList({ students }: { students: Student[] }) {
  // Memoize expensive computation
  const sortedStudents = useMemo(() => {
    return students.sort((a, b) => a.lastName.localeCompare(b.lastName));
  }, [students]);

  // Memoize callback
  const handleStudentClick = useCallback((studentId: string) => {
    router.push(`/student/${studentId}`);
  }, [router]);

  return (
    <div>
      {sortedStudents.map(student => (
        <StudentCard
          key={student.id}
          student={student}
          onClick={handleStudentClick}
        />
      ))}
    </div>
  );
}

// 2. Virtual scrolling for long lists
import { useVirtualizer } from '@tanstack/react-virtual';

export default function VirtualStudentList({ students }: { students: Student[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: students.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Estimated item height
    overscan: 5, // Render 5 extra items
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <StudentCard student={students[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. Debounced search
import { useDebouncedCallback } from 'use-debounce';

export default function SearchStudents() {
  const [results, setResults] = useState<Student[]>([]);

  const handleSearch = useDebouncedCallback(async (query: string) => {
    const response = await fetch(`/api/students/search?q=${query}`);
    const data = await response.json();
    setResults(data);
  }, 300); // Wait 300ms after user stops typing

  return (
    <input
      type="text"
      onChange={(e) => handleSearch(e.target.value)}
      placeholder="Search students..."
    />
  );
}

// 4. Streaming for slow data
// app/student/[id]/page.tsx
import { Suspense } from 'react';

export default function StudentPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <StudentHeader id={params.id} />

      <Suspense fallback={<CoursesSkeletons />}>
        <StudentCourses id={params.id} />
      </Suspense>

      <Suspense fallback={<AssignmentsSkeleton />}>
        <StudentAssignments id={params.id} />
      </Suspense>
    </div>
  );
}

async function StudentCourses({ id }: { id: string }) {
  // Slow data fetch
  const courses = await fetchStudentCourses(id);
  return <CoursesList courses={courses} />;
}
```

### Backend Optimization

```typescript
// 1. Database query optimization
// ❌ Slow
async getStudentDashboard(studentId: string) {
  const student = await this.studentRepository.findOne({ where: { id: studentId } });
  const courses = await this.courseRepository.find({ where: { studentId } });
  const assignments = await this.assignmentRepository.find({ where: { studentId } });
  const grades = await this.gradeRepository.find({ where: { studentId } });

  return { student, courses, assignments, grades };
}

// ✅ Fast - single query
async getStudentDashboard(studentId: string) {
  return this.studentRepository
    .createQueryBuilder('student')
    .leftJoinAndSelect('student.courses', 'course')
    .leftJoinAndSelect('student.assignments', 'assignment')
    .leftJoinAndSelect('student.grades', 'grade')
    .where('student.id = :studentId', { studentId })
    .getOne();
}

// 2. Async operations in parallel
// ❌ Slow - sequential
async getStudentStats(studentId: string) {
  const courseCount = await this.getCourseCount(studentId);
  const assignmentCount = await this.getAssignmentCount(studentId);
  const averageGrade = await this.getAverageGrade(studentId);

  return { courseCount, assignmentCount, averageGrade };
}

// ✅ Fast - parallel
async getStudentStats(studentId: string) {
  const [courseCount, assignmentCount, averageGrade] = await Promise.all([
    this.getCourseCount(studentId),
    this.getAssignmentCount(studentId),
    this.getAverageGrade(studentId),
  ]);

  return { courseCount, assignmentCount, averageGrade };
}

// 3. Response compression
// main.ts
import compression from '@fastify/compress';

app.register(compression, {
  encodings: ['gzip', 'deflate'],
  threshold: 1024, // Only compress responses > 1KB
});

// 4. Request validation optimization
// ❌ Slow - class-validator for simple cases
@IsString()
@MinLength(3)
@MaxLength(50)
name: string;

// ✅ Fast - simple validation for performance-critical paths
validateName(name: string) {
  if (typeof name !== 'string' || name.length < 3 || name.length > 50) {
    throw new BadRequestException('Invalid name');
  }
}
```

## Load Testing

### Tools and Setup

**Artillery** (Recommended):
```bash
npm install -g artillery
```

**Load Test Configuration**:
```yaml
# artillery-config.yml
config:
  target: 'https://api.southville8b.com'
  phases:
    # Warm-up phase
    - duration: 60
      arrivalRate: 10
      name: "Warm up"

    # Ramp up
    - duration: 300
      arrivalRate: 10
      rampTo: 50
      name: "Ramp up load"

    # Sustained load
    - duration: 600
      arrivalRate: 50
      name: "Sustained load"

    # Spike test
    - duration: 60
      arrivalRate: 100
      name: "Spike"

    # Cool down
    - duration: 60
      arrivalRate: 10
      name: "Cool down"

  http:
    timeout: 10

scenarios:
  - name: "Student dashboard access"
    weight: 40
    flow:
      - post:
          url: "/api/v1/auth/login"
          json:
            email: "student{{ $randomNumber() }}@example.com"
            password: "password123"
          capture:
            - json: "$.accessToken"
              as: "token"

      - get:
          url: "/api/v1/student/dashboard"
          headers:
            Authorization: "Bearer {{ token }}"

      - get:
          url: "/api/v1/student/courses"
          headers:
            Authorization: "Bearer {{ token }}"

  - name: "Quiz submission"
    weight: 20
    flow:
      - post:
          url: "/api/v1/auth/login"
          json:
            email: "student{{ $randomNumber() }}@example.com"
            password: "password123"
          capture:
            - json: "$.accessToken"
              as: "token"

      - get:
          url: "/api/v1/quizzes/{{ $randomNumber() }}"
          headers:
            Authorization: "Bearer {{ token }}"

      - post:
          url: "/api/v1/quizzes/{{ $randomNumber() }}/submit"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            answers: [{ questionId: 1, answer: "A" }]

  - name: "Browse announcements"
    weight: 40
    flow:
      - get:
          url: "/api/v1/announcements"

      - get:
          url: "/api/v1/announcements/{{ $randomNumber() }}"
```

**Run Load Test**:
```bash
# Run test
artillery run artillery-config.yml

# Run with reporting
artillery run --output report.json artillery-config.yml
artillery report report.json

# Quick test
artillery quick --count 100 --num 10 https://api.southville8b.com/health
```

**Interpret Results**:
```
Summary Report:
  Scenarios launched:  5000
  Scenarios completed: 4950
  Requests completed:  14850

  Response time (msec):
    min: 45
    max: 1234
    median: 156
    p95: 456      ← Target: <500ms
    p99: 789      ← Target: <1000ms

  Scenario counts:
    Student dashboard: 2000 (100%)
    Quiz submission: 1000 (100%)
    Browse announcements: 2000 (100%)

  Codes:
    200: 14500
    401: 100
    500: 250      ← Investigate errors!

  Errors:
    ETIMEDOUT: 50  ← Server overloaded or network issues
```

**Database Load Testing**:
```bash
# pgbench (PostgreSQL)
pgbench -h localhost -U postgres -d southville -c 50 -j 10 -t 1000

# Custom SQL script
# test.sql
\set studentId random(1, 1000)
SELECT * FROM students WHERE id = :studentId;
SELECT * FROM courses WHERE student_id = :studentId;
SELECT * FROM assignments WHERE student_id = :studentId;

pgbench -h localhost -U postgres -d southville -f test.sql -c 20 -j 4 -t 500
```

### Performance Benchmarks

**Expected Performance**:
```typescript
const performanceBenchmarks = {
  api: {
    healthCheck: { p95: '10ms', p99: '20ms' },
    listStudents: { p95: '100ms', p99: '200ms' },
    getStudent: { p95: '50ms', p99: '100ms' },
    createStudent: { p95: '150ms', p99: '300ms' },
    quizSubmission: { p95: '200ms', p99: '400ms' },
    fileUpload: { p95: '2000ms', p99: '5000ms' },
  },

  database: {
    simpleQuery: { p95: '10ms', p99: '20ms' },
    joinQuery: { p95: '50ms', p99: '100ms' },
    aggregation: { p95: '100ms', p99: '200ms' },
    fullTextSearch: { p95: '150ms', p99: '300ms' },
  },

  frontend: {
    firstContentfulPaint: { p95: '1.5s', p99: '3s' },
    timeToInteractive: { p95: '3s', p99: '5s' },
    totalBlockingTime: { p95: '200ms', p99: '500ms' },
  },
};
```

## Cost Optimization

### Resource Optimization

**Compute Costs**:
```typescript
// Cost comparison
const monthlyCosts = {
  // Vercel (Frontend)
  vercel: {
    hobby: 0,           // Free for small projects
    pro: 20,            // $20/month
    enterprise: 'custom'
  },

  // VPS (Backend)
  vps: {
    '2GB RAM, 1 CPU': 12,    // DigitalOcean, Linode
    '4GB RAM, 2 CPU': 24,
    '8GB RAM, 4 CPU': 48,
  },

  // Supabase (Database)
  supabase: {
    free: 0,            // 500MB database, 1GB bandwidth
    pro: 25,            // 8GB database, 50GB bandwidth
    team: 599,          // 100GB database, 250GB bandwidth
  },

  // Cloudflare R2 (Storage)
  r2: {
    storage: 0.015,     // $0.015/GB/month
    operationsCost: 'minimal' // $0.36 per million requests
  },
};

// Optimization strategies
const costOptimization = [
  'Use Vercel Hobby for development/staging',
  'Enable auto-scaling only for production',
  'Use Supabase Free tier for development',
  'Implement aggressive caching to reduce database queries',
  'Use CDN to reduce origin requests',
  'Clean up unused data and logs regularly',
  'Monitor and optimize slow queries',
  'Use spot instances for non-critical workloads',
];
```

**Bandwidth Optimization**:
```typescript
// Reduce API response sizes
@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data) => {
        // Remove null/undefined fields
        return this.removeEmpty(data);
      }),
    );
  }

  private removeEmpty(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.removeEmpty(item));
    }

    if (obj && typeof obj === 'object') {
      return Object.entries(obj)
        .filter(([_, v]) => v !== null && v !== undefined)
        .reduce((acc, [k, v]) => ({
          ...acc,
          [k]: this.removeEmpty(v),
        }), {});
    }

    return obj;
  }
}

// Implement pagination everywhere
@Get()
async getStudents(@Query() query: PaginationDto) {
  // Always paginate, never return all records
  const { page = 1, limit = 50 } = query;
  return this.studentService.findPaginated(page, Math.min(limit, 100));
}

// Use compression
app.use(compression({
  level: 6,           // Compression level (1-9)
  threshold: 1024,    // Minimum size to compress (bytes)
}));
```

## Capacity Planning

### User Growth Projections

```typescript
// Calculate required resources based on user growth
interface CapacityRequirements {
  users: number;
  concurrentUsers: number;
  requestsPerSecond: number;
  databaseSize: number;  // GB
  storageSize: number;   // GB
  bandwidth: number;     // GB/month
}

function calculateCapacity(totalUsers: number): CapacityRequirements {
  // Assumptions
  const concurrencyRatio = 0.2; // 20% users online during peak
  const requestsPerUserPerHour = 50;
  const dataPerUser = 10; // MB
  const filesPerUser = 5;
  const avgFileSize = 2; // MB
  const bandwidthMultiplier = 3; // Data transferred vs stored

  const concurrentUsers = Math.ceil(totalUsers * concurrencyRatio);
  const requestsPerSecond = Math.ceil(
    (concurrentUsers * requestsPerUserPerHour) / 3600
  );

  return {
    users: totalUsers,
    concurrentUsers,
    requestsPerSecond,
    databaseSize: (totalUsers * dataPerUser) / 1024, // GB
    storageSize: (totalUsers * filesPerUser * avgFileSize) / 1024, // GB
    bandwidth: ((totalUsers * dataPerUser * bandwidthMultiplier) / 1024) * 30, // GB/month
  };
}

// Example projections
const projections = {
  phase1: calculateCapacity(1500),
  phase2: calculateCapacity(5000),
  phase3: calculateCapacity(20000),
  phase4: calculateCapacity(100000),
};

console.log(projections);
/*
{
  phase1: {
    users: 1500,
    concurrentUsers: 300,
    requestsPerSecond: 5,
    databaseSize: 14.65 GB,
    storageSize: 14.65 GB,
    bandwidth: 1318 GB/month
  },
  phase2: {
    users: 5000,
    concurrentUsers: 1000,
    requestsPerSecond: 14,
    databaseSize: 48.83 GB,
    storageSize: 48.83 GB,
    bandwidth: 4395 GB/month
  },
  // ...
}
*/
```

### Infrastructure Scaling Plan

```typescript
// Recommended infrastructure per phase
const infrastructurePlan = {
  phase1: {
    users: '1,500',
    frontend: {
      platform: 'Vercel Hobby',
      instances: 'Auto',
      cost: '$0/month',
    },
    backend: {
      platform: 'VPS',
      specs: '2GB RAM, 1 CPU',
      instances: 1,
      cost: '$12/month',
    },
    database: {
      platform: 'Supabase Pro',
      size: '8GB',
      cost: '$25/month',
    },
    storage: {
      platform: 'Cloudflare R2',
      size: '15GB',
      cost: '$0.23/month',
    },
    total: '$37/month',
  },

  phase2: {
    users: '5,000',
    frontend: {
      platform: 'Vercel Pro',
      instances: 'Auto',
      cost: '$20/month',
    },
    backend: {
      platform: 'VPS',
      specs: '4GB RAM, 2 CPU',
      instances: 2,
      cost: '$48/month',
    },
    database: {
      platform: 'Supabase Pro',
      size: '50GB',
      cost: '$25/month',
    },
    cache: {
      platform: 'Redis (Upstash)',
      size: '1GB',
      cost: '$10/month',
    },
    storage: {
      platform: 'Cloudflare R2',
      size: '50GB',
      cost: '$0.75/month',
    },
    total: '$104/month',
  },

  phase3: {
    users: '20,000',
    frontend: {
      platform: 'Vercel Pro',
      instances: 'Auto',
      cost: '$20/month',
    },
    backend: {
      platform: 'VPS',
      specs: '8GB RAM, 4 CPU',
      instances: 4,
      cost: '$192/month',
    },
    database: {
      platform: 'Supabase Team',
      size: '100GB',
      replicas: 1,
      cost: '$599/month',
    },
    cache: {
      platform: 'Redis (Upstash)',
      size: '5GB',
      cost: '$50/month',
    },
    storage: {
      platform: 'Cloudflare R2',
      size: '200GB',
      cost: '$3/month',
    },
    cdn: {
      platform: 'Cloudflare Pro',
      cost: '$20/month',
    },
    total: '$884/month',
  },
};
```

## Monitoring and Metrics

### Application Monitoring

**Setup Monitoring** (Using Sentry):
```typescript
// Backend monitoring
// main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

// Error tracking
@Catch()
export class SentryFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    Sentry.captureException(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : 500;

    response.status(status).json({
      statusCode: status,
      message: exception['message'] || 'Internal server error',
    });
  }
}

// Frontend monitoring
// app/layout.tsx
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

**Custom Metrics**:
```typescript
// Track custom events
Sentry.metrics.increment('quiz.submission', 1, {
  tags: { grade_level: student.gradeLevel },
});

Sentry.metrics.distribution('quiz.score', score, {
  tags: { quiz_id: quizId },
});

Sentry.metrics.set('active_users', userId, {
  tags: { role: user.role },
});
```

### Key Metrics to Monitor

```typescript
const criticalMetrics = {
  availability: {
    uptime: '99.9%',
    monitor: 'Every 1 minute',
    alert: 'If down for >2 minutes',
  },

  performance: {
    apiResponseTime: {
      p50: '<100ms',
      p95: '<200ms',
      p99: '<500ms',
      monitor: 'Every request',
      alert: 'If p95 >500ms for 5 minutes',
    },
    frontendLoadTime: {
      target: '<3s',
      monitor: 'Real user monitoring',
      alert: 'If p95 >5s',
    },
  },

  errors: {
    errorRate: {
      target: '<0.1%',
      monitor: 'Every request',
      alert: 'If >1% for 5 minutes',
    },
    http5xxRate: {
      target: '<0.01%',
      monitor: 'Every request',
      alert: 'If >0.1% for 5 minutes',
    },
  },

  resources: {
    cpuUsage: {
      target: '<70%',
      monitor: 'Every minute',
      alert: 'If >85% for 10 minutes',
    },
    memoryUsage: {
      target: '<80%',
      monitor: 'Every minute',
      alert: 'If >90% for 5 minutes',
    },
    diskUsage: {
      target: '<80%',
      monitor: 'Every hour',
      alert: 'If >90%',
    },
  },

  database: {
    connectionPoolUsage: {
      target: '<80%',
      monitor: 'Every minute',
      alert: 'If >90% for 5 minutes',
    },
    queryTime: {
      target: 'p95 <100ms',
      monitor: 'Every query',
      alert: 'If p95 >500ms for 5 minutes',
    },
    replicationLag: {
      target: '<1s',
      monitor: 'Every minute',
      alert: 'If >5s',
    },
  },
};
```

**Alerting Setup**:
```yaml
# Example: alertmanager.yml
route:
  receiver: 'team-notifications'
  group_by: ['alertname', 'severity']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h

receivers:
  - name: 'team-notifications'
    slack_configs:
      - api_url: 'YOUR_SLACK_WEBHOOK'
        channel: '#alerts'
        title: 'Southville Alert: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

    email_configs:
      - to: 'dev-team@southville8b.com'
        from: 'alerts@southville8b.com'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'alerts@southville8b.com'
        auth_password: 'PASSWORD'
```

---

## Summary

Scaling the Southville 8B NHS Edge platform requires a multi-faceted approach:

1. **Start Small**: Optimize code and queries before adding infrastructure
2. **Measure First**: Use monitoring and load testing to identify bottlenecks
3. **Scale Incrementally**: Add resources gradually based on actual needs
4. **Cache Aggressively**: Reduce database load with Redis and CDN caching
5. **Go Stateless**: Enable horizontal scaling with stateless architecture
6. **Automate Scaling**: Use auto-scaling for unpredictable traffic
7. **Monitor Continuously**: Track metrics and set up alerts
8. **Plan Capacity**: Predict resource needs based on user growth
9. **Optimize Costs**: Balance performance with budget constraints
10. **Test Regularly**: Run load tests before major releases

### Scaling Checklist

Before scaling to next phase:
- [ ] Current infrastructure at 70%+ capacity
- [ ] Load testing shows degraded performance
- [ ] Cost analysis favors additional resources
- [ ] Monitoring and alerting configured
- [ ] Auto-scaling tested in staging
- [ ] Database optimization completed
- [ ] Caching strategy implemented
- [ ] CDN configured for static assets
- [ ] Backup and disaster recovery tested
- [ ] Team trained on new infrastructure

The platform is designed to scale from 1,500 to 100,000+ users with the strategies outlined in this chapter. Start with the recommended Phase 1 configuration and scale progressively as user base grows, always measuring performance and optimizing costs along the way.
