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

import { MailService } from '@mail/mail.service';
import { S3Service } from '@s3/s3.service';

import { AppModule } from '../src/app.module';
import { Message } from '@messenger/messages/entities/message.entity';
import { clearDatabase } from './utils/clear-db';
import { Chat } from '@messenger/chats/entities/chat.entity';

const userDtos = {
    user1: {
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isAdult: true,
        isProfessional: true,
        password: 'SecurePass456!'
    },
    user2: {
        email: 'anna.smith@example.com',
        firstName: 'Anna',
        lastName: 'Smith',
        isAdult: true,
        isProfessional: false,
        password: 'MyStrongPass789@'
    },
    user3: {
        email: 'michael.brown@example.com',
        firstName: 'Michael',
        lastName: 'Brown',
        isAdult: false,
        isProfessional: false,
        password: 'Password123#'
    }
};

const messageDto = {
    content: 'Еще раз'
};

describe('Messenger (e2e)', () => {
    // чтобы успел стартануть тестовый контейнер с бд
    jest.setTimeout(30000);

    let app: NestFastifyApplication;
    let container: StartedPostgreSqlContainer;
    let dataSource: DataSource;

    const mockMailService = {
        sendVerificationCode: jest.fn().mockResolvedValue(true)
    };

    const mockS3Service = {
        getUrl: (key: string) => `http://localhost:9000/${key}`
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
            .useValue(mockS3Service)
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

    beforeEach(async () => {
        await clearDatabase(dataSource);
    });

    const registerUser = async dto => {
        const res = await request(app.getHttpServer())
            .post('/auth/register')
            .set('User-Agent', 'Mozilla/5.0 (TestAgent)')
            .send(dto)
            .expect(201);

        return { userId: res.body.user.id, accessToken: res.body.accessToken };
    };

    describe('Messages', () => {
        it('should send message by user id', async () => {
            const { userId: user1Id, accessToken: user1Token } =
                await registerUser(userDtos.user1);
            const { userId: user2Id } = await registerUser(userDtos.user2);

            const res = await request(app.getHttpServer())
                .post(`/users/${user2Id}/messages`)
                .set('Authorization', `Bearer ${user1Token}`)
                .send(messageDto)
                .expect(201);

            expect(res.body.message).toBeDefined();
            expect(res.body.message).toEqual(
                expect.objectContaining({
                    id: expect.any(Number),
                    content: messageDto.content
                })
            );

            const createdMessage = await dataSource
                .getRepository(Message)
                .findOne({
                    where: { id: res.body.message.id },
                    relations: {
                        chat: {
                            members: true
                        }
                    }
                });

            expect(createdMessage).not.toBeNull();
            expect(createdMessage.senderId).toBe(user1Id);
            expect(createdMessage.chat.latestMessageId).toBe(
                res.body.message.id
            );
            expect(
                [...createdMessage.chat.members.map(m => m.userId)].sort()
            ).toEqual([user1Id, user2Id].sort());
        });

        it('should send message by chat id', async () => {
            const { accessToken: user1Token } = await registerUser(
                userDtos.user1
            );
            const { userId: user2Id, accessToken: user2Token } =
                await registerUser(userDtos.user2);

            const msg1Response = await request(app.getHttpServer())
                .post(`/users/${user2Id}/messages`)
                .set('Authorization', `Bearer ${user1Token}`)
                .send(messageDto)
                .expect(201);

            const createdMessage1 = await dataSource
                .getRepository(Message)
                .findOne({
                    where: { id: msg1Response.body.message.id },
                    relations: { chat: true }
                });

            expect(createdMessage1.chat.latestMessageId).toBe(
                msg1Response.body.message.id
            );

            const msg2Response = await request(app.getHttpServer())
                .post(`/chats/${createdMessage1.chatId}/messages`)
                .set('Authorization', `Bearer ${user2Token}`)
                .send(messageDto)
                .expect(201);

            const createdMessage2 = await dataSource
                .getRepository(Message)
                .findOne({
                    where: { id: msg2Response.body.message.id },
                    relations: { chat: true }
                });

            expect(createdMessage2.chat.latestMessageId).toBe(
                msg2Response.body.message.id
            );

            const msg3Response = await request(app.getHttpServer())
                .post(`/chats/${createdMessage1.chatId}/messages`)
                .set('Authorization', `Bearer ${user1Token}`)
                .send(messageDto)
                .expect(201);

            const createdMessage3 = await dataSource
                .getRepository(Message)
                .findOne({
                    where: { id: msg3Response.body.message.id },
                    relations: { chat: true }
                });

            expect(createdMessage3.chat.latestMessageId).toBe(
                msg3Response.body.message.id
            );

            const chats = await dataSource.getRepository(Chat).find();

            expect(chats).toHaveLength(1);
            expect(chats[0].latestMessageId).toBe(msg3Response.body.message.id);

            const messages = await dataSource.getRepository(Message).find({
                where: { chatId: chats[0].id },
                order: { createdAt: 'ASC' }
            });

            expect(messages).toHaveLength(3);
            expect(messages[0].id).toBe(msg1Response.body.message.id);
            expect(messages[1].id).toBe(msg2Response.body.message.id);
            expect(messages[2].id).toBe(msg3Response.body.message.id);
        });

        it('should not allow non-member to send messages to chat', async () => {
            const { accessToken: user1Token } = await registerUser(
                userDtos.user1
            );
            const { userId: user2Id } = await registerUser(userDtos.user2);
            const { accessToken: user3Token } = await registerUser(
                userDtos.user3
            );

            const res = await request(app.getHttpServer())
                .post(`/users/${user2Id}/messages`)
                .set('Authorization', `Bearer ${user1Token}`)
                .send(messageDto)
                .expect(201);

            const createdMessage = await dataSource
                .getRepository(Message)
                .findOne({
                    where: { id: res.body.message.id }
                });

            await request(app.getHttpServer())
                .post(`/chats/${createdMessage.chatId}/messages`)
                .set('Authorization', `Bearer ${user3Token}`)
                .send(messageDto)
                .expect(404);
        });

        it('should return 404 for non-existing user', async () => {
            const { accessToken } = await registerUser(userDtos.user1);

            await request(app.getHttpServer())
                .post('/users/999/messages')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(messageDto)
                .expect(404);
        });

        it('should return 404 for non-existing chat', async () => {
            const { accessToken } = await registerUser(userDtos.user1);

            await request(app.getHttpServer())
                .post('/chats/999/messages')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(messageDto)
                .expect(404);
        });
    });
});
