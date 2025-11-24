import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import helmet from '@fastify/helmet';
import compression from '@fastify/compress';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const configService = app.get(ConfigService);

  // Security middleware
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  });

  // Compression middleware
  await app.register(compression, {
    encodings: ['gzip', 'deflate', 'br'],
    threshold: 1024,
  });

  // Global exception filter for error handling
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable API versioning with global prefix
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Enable CORS
  // Note: When credentials: true, origin cannot be '*'
  // Must use specific origins when credentials are enabled
  const getAllowedOrigins = (): string | string[] | boolean => {
    const corsOriginEnv = configService.get<string>('CORS_ORIGIN') || process.env.CORS_ORIGIN;
    const frontendUrl = configService.get<string>('FRONTEND_URL') || process.env.FRONTEND_URL;
    const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS') || process.env.ALLOWED_ORIGINS;
    
    if (allowedOrigins) {
      return allowedOrigins.split(',').map(origin => origin.trim());
    }
    
    if (corsOriginEnv) {
      return corsOriginEnv.split(',').map(origin => origin.trim());
    }
    
    if (frontendUrl) {
      return frontendUrl.split(',').map(origin => origin.trim());
    }
    
    // In production, warn if no CORS origin is set
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️  WARNING: No CORS origin configured in production. Allowing all origins.');
      return true; // Allow all origins in production if not configured
    }
    
    // Default to localhost:3000 for development
    return [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ];
  };
  
  app.enableCors({
    origin: getAllowedOrigins(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    exposedHeaders: ['Content-Type', 'Authorization'],
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Southville Chat Service API')
    .setDescription('Dedicated chat service for Southville NHS School Portal')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Graceful shutdown
  app.enableShutdownHooks();

  // Render automatically sets PORT env var - use it directly
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : configService.get<number>('PORT') || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Chat service is running on: http://localhost:${port}/api`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();

