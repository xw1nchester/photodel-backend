import { ValidationPipe } from '@nestjs/common';
import {
    FastifyAdapter,
    NestFastifyApplication
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import {
    StartedPostgreSqlContainer,
    PostgreSqlContainer
} from '@testcontainers/postgresql';
import fastifyCookie from 'fastify-cookie';
import request from 'supertest';
import { DataSource } from 'typeorm';

import { Code } from '@codes/code.entity';
import { CodeType } from '@codes/enums';
import { MailService } from '@mail/mail.service';
import { S3Service } from '@s3/s3.service';

import { AppModule } from '../src/app.module';
import { User } from '@users/entities/user.entity';
import { Token } from '@tokens/token.entity';

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
    // чтобы успел стартануть тестовый контейнер с бд
    jest.setTimeout(30000);

    let app: NestFastifyApplication;
    let container: StartedPostgreSqlContainer;
    let dataSource: DataSource;
    let accessToken: string;
    let refreshTokenCookie: string;

    const mockMailService = {
        sendVerificationCode: jest.fn().mockResolvedValue(true),
        sendPasswordRecoveryCode: jest.fn().mockResolvedValue(true)
    };

    beforeAll(async () => {
        container = await new PostgreSqlContainer(
            'postgis/postgis:16-3.4'
        ).start();

        // process.env.NODE_ENV = 'test';

        process.env.DB_HOST = container.getHost();
        process.env.DB_PORT = container.getMappedPort(5432).toString();
        process.env.DB_USER = container.getUsername();
        process.env.DB_PASSWORD = container.getPassword();
        process.env.DB_NAME = container.getDatabase();

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule]
        })
            .overrideProvider(MailService)
            .useValue(mockMailService)
            .overrideProvider(S3Service)
            .useValue({})
            .compile();

        app = moduleFixture.createNestApplication(new FastifyAdapter());

        dataSource = app.get(DataSource);
        await dataSource.runMigrations();

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
        // await clearDatabase(dataSource);
        await container.stop();
        await app.close();
    });

    const dto = {
        email: 'test.user@example.com',
        firstName: 'Test',
        lastName: 'User',
        isAdult: true,
        isProfessional: false,
        password: 'StrongPass123!'
    };

    describe('Register', () => {
        it('should register a new user with valid data and return access token', async () => {
            const res = await request(app.getHttpServer())
                .post('/auth/register')
                .set('User-Agent', 'Mozilla/5.0 (TestAgent)')
                .send(dto)
                .expect(201);

            expect(res.body).toEqual({
                user: expect.objectContaining({
                    email: dto.email,
                    firstName: dto.firstName,
                    lastName: dto.lastName
                }),
                accessToken: expect.any(String)
            });

            extractAndValidateRefreshCookie(res);

            const user = await dataSource.getRepository(User).findOne({
                where: { email: dto.email }
            });

            expect(user).toBeDefined();
            expect(user!.passwordHash).not.toBe(dto.password);

            const token = await dataSource.getRepository(Token).findOne({
                where: {
                    user: {
                        id: user!.id
                    }
                }
            });

            expect(token).toBeDefined();

            const code = await dataSource.getRepository(Code).findOne({
                where: {
                    user: {
                        id: user!.id
                    },
                    type: CodeType.VERIFICATION
                }
            });

            expect(code).toBeDefined();
        });

        it('should not register user with already existing email', async () => {
            await request(app.getHttpServer())
                .post('/auth/register')
                .set('User-Agent', 'Mozilla/5.0 (TestAgent)')
                .send(dto)
                .expect(400);
        });
    });

    describe('Login', () => {
        it('should login user with correct email and password', async () => {
            const res = await request(app.getHttpServer())
                .post('/auth/login')
                .set('User-Agent', 'Mozilla/5.0 (TestAgent)')
                .send({
                    email: dto.email,
                    password: dto.password
                })
                .expect(201);

            expect(res.body).toHaveProperty('accessToken');
            expect(res.body.user.email).toBe(dto.email);

            accessToken = res.body.accessToken;
            refreshTokenCookie = extractAndValidateRefreshCookie(res);
        });

        it('should not login user with incorrect password', async () => {
            await request(app.getHttpServer())
                .post('/auth/login')
                .set('User-Agent', 'Mozilla/5.0 (TestAgent)')
                .send({
                    email: dto.email,
                    password: 'invalid123'
                })
                .expect(400);
        });
    });

    describe('Get user info', () => {
        it('should return current user data when valid access token is provided', async () => {
            const res = await request(app.getHttpServer())
                .get('/users/me')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(res.body.user.email).toBe(dto.email);
        });

        it('should not return user data when request is made without authorization header', async () => {
            await request(app.getHttpServer()).get('/users/me').expect(401);
        });

        it('should not return user data when invalid token is provided', async () => {
            await request(app.getHttpServer())
                .get('/users/me')
                .set('Authorization', 'Bearer invalid123')
                .expect(401);
        });
    });

    describe('Refresh token', () => {
        it('should refresh access token with valid refresh cookie', async () => {
            const res = await request(app.getHttpServer())
                .get('/auth/refresh')
                .set('User-Agent', 'Mozilla/5.0 (TestAgent)')
                .set('Cookie', refreshTokenCookie)
                .expect(200);

            expect(res.body).toHaveProperty('accessToken');
            extractAndValidateRefreshCookie(res);
        });

        it('should not refresh token when refresh cookie is missing', async () => {
            await request(app.getHttpServer())
                .get('/auth/refresh')
                .set('User-Agent', 'Mozilla/5.0 (TestAgent)')
                .expect(401);
        });

        it('should not refresh token with invalid refresh cookie', async () => {
            await request(app.getHttpServer())
                .get('/auth/refresh')
                .set('User-Agent', 'Mozilla/5.0 (TestAgent)')
                .set('Cookie', 'refresh-token=invalid-token')
                .expect(401);
        });
    });

    it('should clear refresh cookie and invalidate session on logout', async () => {
        await request(app.getHttpServer())
            .get('/auth/logout')
            .set('User-Agent', 'Mozilla/5.0 (TestAgent)')
            .expect(200);
    });

    describe('Resend verification', () => {
        it('should not resend verification code if retry interval has not expired yet', async () => {
            await request(app.getHttpServer())
                .get('/auth/resend-verification')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(400);
        });

        it('should resend verification code after retry interval has expired', async () => {
            const repo = dataSource.getRepository(Code);

            const prevCode = await repo.findOne({
                where: {
                    type: CodeType.VERIFICATION,
                    user: { email: dto.email }
                }
            });

            await repo.update(
                { id: prevCode.id },
                { retryDate: new Date(Date.now() - 1) }
            );

            await request(app.getHttpServer())
                .get('/auth/resend-verification')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            const newCode = await repo.findOne({
                where: {
                    type: CodeType.VERIFICATION,
                    user: { email: dto.email }
                }
            });

            expect(prevCode.code).not.toBe(newCode.code);
        });

        it('should not resend verification code when authorization header is missing', async () => {
            await request(app.getHttpServer())
                .get('/auth/resend-verification')
                .expect(401);
        });

        it('should not resend verification code when invalid token is provided', async () => {
            await request(app.getHttpServer())
                .get('/auth/resend-verification')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);
        });
    });

    describe('Verify email', () => {
        it('should not verify email with invalid verification code', async () => {
            await request(app.getHttpServer())
                .post('/auth/verify-email')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ code: 'invalid' })
                .expect(400);
        });

        it('should verify user email with valid verification code', async () => {
            const codeRepo = dataSource.getRepository(Code);
            const code = await codeRepo.findOne({
                where: {
                    type: CodeType.VERIFICATION,
                    user: { email: dto.email }
                }
            });

            await request(app.getHttpServer())
                .post('/auth/verify-email')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ code: code.code })
                .expect(200);
        });

        it('should not verify email when user is already verified', async () => {
            await request(app.getHttpServer())
                .post('/auth/verify-email')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ code: '000000' })
                .expect(400);
        });

        it('should not verify email when authorization header is missing', async () => {
            await request(app.getHttpServer())
                .post('/auth/verify-email')
                .send({ code: '000000' })
                .expect(401);
        });

        it('should not verify email when invalid token is provided', async () => {
            await request(app.getHttpServer())
                .post('/auth/verify-email')
                .set('Authorization', 'Bearer invalid-token')
                .send({ code: '000000' })
                .expect(401);
        });
    });

    describe('Password recovery', () => {
        it('should send recovery code', async () => {
            await request(app.getHttpServer())
                .post('/auth/send-recovery')
                .set('Authorization', accessToken)
                .send({ email: dto.email })
                .expect(200);

            const code = await dataSource.getRepository(Code).findOne({
                where: {
                    type: CodeType.PASSWORD_RECOVERY,
                    user: { email: dto.email }
                }
            });

            expect(code).toBeDefined();
        });

        it('should not resend recovery code if retry interval has not expired yet', async () => {
            await request(app.getHttpServer())
                .post('/auth/send-recovery')
                .set('Authorization', accessToken)
                .send({ email: dto.email })
                .expect(400);
        });

        it('should not verify invalid recovery code', async () => {
            await request(app.getHttpServer())
                .post('/auth/verify-recovery')
                .set('Authorization', accessToken)
                .send({ email: dto.email, code: '000000' })
                .expect(400);
        });

        it('should verify correct recovery code', async () => {
            const code = await dataSource.getRepository(Code).findOne({
                where: {
                    type: CodeType.PASSWORD_RECOVERY,
                    user: { email: dto.email }
                }
            });

            await request(app.getHttpServer())
                .post('/auth/verify-recovery')
                .set('Authorization', accessToken)
                .send({ email: dto.email, code: code.code })
                .expect(200);
        });

        it('should not recovery password with invalid code', async () => {
            await request(app.getHttpServer())
                .post('/auth/recovery-password')
                .set('Authorization', accessToken)
                .send({
                    email: dto.email,
                    code: '000000',
                    password: '123123123'
                })
                .expect(400);
        });

        it('should recovery password with valid code', async () => {
            const code = await dataSource.getRepository(Code).findOne({
                where: {
                    type: CodeType.PASSWORD_RECOVERY,
                    user: { email: dto.email }
                }
            });

            const repo = dataSource.getRepository(User);

            const prevUser = await repo.findOne({
                where: { email: dto.email }
            });

            await request(app.getHttpServer())
                .post('/auth/recovery-password')
                .set('Authorization', accessToken)
                .send({
                    email: dto.email,
                    code: code.code,
                    password: '123123123'
                })
                .expect(200);

            const currentUser = await repo.findOne({
                where: { email: dto.email }
            });

            expect(prevUser.passwordHash).not.toBe(currentUser.passwordHash);

            // rollback (for next tests)
            await repo.update(
                { email: dto.email },
                { passwordHash: prevUser.passwordHash }
            );
        });
    });

    describe('Change password', () => {
        it('should not change password with invalid old password', async () => {
            await request(app.getHttpServer())
                .post('/auth/change-password')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ oldPassword: 'invalid123', newPassword: '123123123' })
                .expect(400);
        });
        
        it('should change password with valid old password', async () => {
            const repo = dataSource.getRepository(User);

            const prevUser = await repo.findOne({
                where: { email: dto.email }
            });

            await request(app.getHttpServer())
                .post('/auth/change-password')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ oldPassword: dto.password, newPassword: '123123123' })
                .expect(200);

            const currentUser = await repo.findOne({
                where: { email: dto.email }
            });

            expect(prevUser.passwordHash).not.toBe(currentUser.passwordHash);

            await repo.update(
                { email: dto.email },
                { passwordHash: prevUser.passwordHash }
            );
        });
    });
});
