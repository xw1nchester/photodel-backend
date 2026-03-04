import cors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
    FastifyAdapter,
    NestFastifyApplication
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import fastifyCookie from 'fastify-cookie';

import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter({
            logger: {
                level: 'info',
                transport: {
                    target: 'pino-pretty',
                    options: {
                        colorize: true,
                        singleLine: true,
                        ignore: 'reqId,req.host,req.remotePort'
                    }
                }
            }
        })
    );

    const configService = app.get(ConfigService);

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true
        })
    );

    app.setGlobalPrefix('api');

    await app.register(fastifyCookie, {});

    await app.register(cors, {
        origin: configService.get('ALLOWED_ORIGINS')?.split(',') || '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true
    });

    await app.register(fastifyMultipart, {
        limits: {
            // 10MB
            fileSize: 10 * 1024 * 1024,
            files: 10
        }
    });

    const swaggerConfig = new DocumentBuilder()
        .setTitle('Photodel API documentation')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api-docs', app, document);

    await app.listen(configService.get<number>('PORT', 8080), '0.0.0.0');
}

bootstrap();
