import {
    FastifyAdapter,
    NestFastifyApplication
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { S3Service } from '@s3/s3.service';

import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
    let app: NestFastifyApplication;

    beforeEach(async () => {
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
        await app.close();
    });

    it('/health (GET)', () => {
        return request(app.getHttpServer()).get('/health').expect(200);
    });
});
