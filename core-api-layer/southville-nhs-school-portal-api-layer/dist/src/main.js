"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const common_1 = require("@nestjs/common");
const helmet_1 = require("@fastify/helmet");
const compress_1 = require("@fastify/compress");
const multipart_1 = require("@fastify/multipart");
const swagger_1 = require("@nestjs/swagger");
const common_2 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter());
    const configService = app.get(config_1.ConfigService);
    await app.register(helmet_1.default, {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'https:'],
            },
        },
    });
    await app.register(compress_1.default);
    await app.register(multipart_1.default, {
        limits: {
            fileSize: 50 * 1024 * 1024,
        },
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.setGlobalPrefix('api');
    app.enableVersioning({
        type: common_2.VersioningType.URI,
        defaultVersion: '1',
    });
    app.enableCors({
        origin: process.env.NODE_ENV === 'production' ? ['https://yourdomain.com'] : true,
        credentials: true,
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Southville NHS School Portal API')
        .setDescription('API layer for Southville NHS School Portal with Supabase integration')
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter Supabase JWT token',
        in: 'header',
    }, 'JWT-auth')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
    app.enableShutdownHooks();
    const port = configService.get('PORT') || 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map