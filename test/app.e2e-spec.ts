import {
    FastifyAdapter,
    NestFastifyApplication
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { S3Service } from '@s3/s3.service';

import { AppModule } from '../src/app.module';
import {
    PostgreSqlContainer,
    StartedPostgreSqlContainer
} from '@testcontainers/postgresql';

describe('AppController (e2e)', () => {
    jest.setTimeout(30000);

    let app: NestFastifyApplication;
    let container: StartedPostgreSqlContainer;

    beforeAll(async () => {
        container = await new PostgreSqlContainer(
            'postgis/postgis:16-3.4'
        ).start();

        process.env.DB_HOST = container.getHost();
        process.env.DB_PORT = container.getMappedPort(5432).toString();
        process.env.DB_USER = container.getUsername();
        process.env.DB_PASSWORD = container.getPassword();
        process.env.DB_NAME = container.getDatabase();

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule]
        })
            .overrideProvider(S3Service)
            .useValue({})
            .compile();

        app = moduleFixture.createNestApplication(new FastifyAdapter());

        await app.init();
        await app.getHttpAdapter().getInstance().ready();
    });

    afterAll(async () => {
        await container.stop();
        await app.close();
    });

    it('/health (GET)', () => {
        return request(app.getHttpServer()).get('/health').expect(200);
    });
});
