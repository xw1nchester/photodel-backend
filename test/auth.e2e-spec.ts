import { ValidationPipe } from '@nestjs/common';
import {
    FastifyAdapter,
    NestFastifyApplication
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import fastifyCookie from 'fastify-cookie';
import * as request from 'supertest';
import { DataSource } from 'typeorm';

import { MailService } from '@mail/mail.service';

import { AppModule } from '../src/app.module';

import { clearDatabase } from './utils/clear-db';

const extractAndValidateRefreshCookie = (res: request.Response) => {
    const raw = res.headers['set-cookie'];
    const cookies = Array.isArray(raw) ? raw : [raw];

    expect(cookies).toBeDefined();

    const tokenCookie = cookies.find((c: string) =>
        c.startsWith('refresh-token=')
    );

    expect(tokenCookie).toBeDefined();

    return tokenCookie;
};

describe('Auth & Users (e2e)', () => {
    let app: NestFastifyApplication;
    let dataSource: DataSource;
    let accessToken: string;
    let refreshTokenCookie: string;

    const mockMailService = {
        sendVerificationCode: jest.fn().mockResolvedValue(true)
    };

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule]
        })
            .overrideProvider(MailService)
            .useValue(mockMailService)
            .compile();

        app = moduleFixture.createNestApplication(new FastifyAdapter());

        dataSource = app.get(DataSource);

        app.useGlobalPipes(
            new ValidationPipe({
                transform: true,
                whitelist: true,
                forbidNonWhitelisted: true
            })
        );

        await app.register(fastifyCookie, {});

        await app.init();
        await app.getHttpAdapter().getInstance().ready();
    });

    afterAll(async () => {
        await clearDatabase(dataSource);
        await app.close();
    });

    const testUser = {
        email: 'test.user@example.com',
        firstName: 'Test',
        lastName: 'User',
        isAdult: true,
        isProfessional: false,
        password: 'StrongPass123!'
    };

    it('Register a new user', async () => {
        const res = await request(app.getHttpServer())
            .post('/auth/register')
            .set('User-Agent', 'Mozilla/5.0 (TestAgent)')
            .send(testUser)
            .expect(201);

        expect(res.body).toHaveProperty('accessToken');
        expect(res.body.user.email).toBe(testUser.email);
        extractAndValidateRefreshCookie(res);
    });

    it('Login with registered user', async () => {
        const res = await request(app.getHttpServer())
            .post('/auth/login')
            .set('User-Agent', 'Mozilla/5.0 (TestAgent)')
            .send({
                email: testUser.email,
                password: testUser.password
            })
            .expect(201);

        expect(res.body).toHaveProperty('accessToken');
        expect(res.body.user.email).toBe(testUser.email);

        accessToken = res.body.accessToken;
        refreshTokenCookie = extractAndValidateRefreshCookie(res);
    });

    it('Get current user info', async () => {
        const res = await request(app.getHttpServer())
            .get('/users/me')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

        expect(res.body.user.email).toBe(testUser.email);
    });

    it('Refresh token', async () => {
        const res = await request(app.getHttpServer())
            .get('/auth/refresh')
            .set('User-Agent', 'Mozilla/5.0 (TestAgent)')
            .set('Cookie', refreshTokenCookie)
            .expect(200);

        expect(res.body).toHaveProperty('accessToken');
        extractAndValidateRefreshCookie(res);
    });

    it('Logout user', async () => {
        await request(app.getHttpServer())
            .get('/auth/logout')
            .set('User-Agent', 'Mozilla/5.0 (TestAgent)')
            .expect(200);
    });
});
