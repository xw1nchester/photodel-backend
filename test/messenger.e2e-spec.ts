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
import { randomUUID } from 'crypto';

import { MailService } from '@mail/mail.service';
import { S3Service } from '@s3/s3.service';

import { AppModule } from '../src/app.module';
import { Message } from '@messenger/messages/entities/message.entity';
import { clearDatabase } from './utils/clear-db';
import { Chat } from '@messenger/chats/entities/chat.entity';

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
        await container.stop();
        await app.close();
    });

    beforeEach(async () => {
        await clearDatabase(dataSource);
    });

    const registerUser = async () => {
        const uuid = randomUUID();
        const parts = uuid.split('-');

        const res = await request(app.getHttpServer())
            .post('/auth/register')
            .set('User-Agent', 'Mozilla/5.0 (TestAgent)')
            .send({
                email: `${parts[0]}@${parts[1]}.com`,
                firstName: parts[2],
                lastName: parts[3],
                isAdult: Math.random() > 0.5,
                isProfessional: Math.random() > 0.5,
                password: parts[4]
            })
            .expect(201);

        return { userId: res.body.user.id, accessToken: res.body.accessToken };
    };

    // TODO: статус код проверять в тесте, а не в хелпере
    const sendMessageToUser = async (
        userId: number,
        accessToken: string,
        expectedStatusCode = 201
    ) => {
        return await request(app.getHttpServer())
            .post(`/users/${userId}/messages`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(messageDto)
            .expect(expectedStatusCode);
    };

    const sendMessageToChat = async (
        chatId: number,
        accessToken: string,
        expectedStatusCode = 201
    ) => {
        return await request(app.getHttpServer())
            .post(`/chats/${chatId}/messages`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(messageDto)
            .expect(expectedStatusCode);
    };

    const getChats = (token: string) =>
        request(app.getHttpServer())
            .get('/chats')
            .set('Authorization', `Bearer ${token}`);

    const getChatById = async (chatId: number, accessToken: string) => {
        return await request(app.getHttpServer())
            .get(`/chats/${chatId}`)
            .set('Authorization', `Bearer ${accessToken}`);
    };

    describe('Messages', () => {
        it('should send message by user id', async () => {
            const { userId: user1Id, accessToken: user1Token } =
                await registerUser();
            const { userId: user2Id } = await registerUser();

            const res = await sendMessageToUser(user2Id, user1Token);

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
            // expect(createdMessage.senderId).toBe(user1Id);
            // expect(createdMessage.chat.latestMessageId).toBe(
            //     res.body.message.id
            // );
            // expect(
            //     [...createdMessage.chat.members.map(m => m.userId)].sort()
            // ).toEqual([user1Id, user2Id].sort());
        });

        it('should send message by chat id', async () => {
            const { accessToken: user1Token } = await registerUser();
            const { userId: user2Id, accessToken: user2Token } =
                await registerUser();

            const msg1Response = await sendMessageToUser(user2Id, user1Token);

            const createdMessage = await dataSource
                .getRepository(Message)
                .findOne({
                    where: { id: msg1Response.body.message.id }
                });

            expect(createdMessage).not.toBeNull();

            const msg2Response = await sendMessageToChat(
                createdMessage.chatId,
                user2Token
            );

            const msg3Response = await sendMessageToChat(
                createdMessage.chatId,
                user1Token
            );

            // подумать как получать чаты, чтобы не приходилось очищать бд перед каждым тестом
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
            const { accessToken: user1Token } = await registerUser();
            const { userId: user2Id } = await registerUser();
            const { accessToken: user3Token } = await registerUser();

            const res = await sendMessageToUser(user2Id, user1Token);

            const createdMessage = await dataSource
                .getRepository(Message)
                .findOne({
                    where: { id: res.body.message.id }
                });

            await sendMessageToChat(createdMessage.chatId, user3Token, 404);
        });

        it('should return 404 for non-existing user', async () => {
            const { accessToken } = await registerUser();
            await sendMessageToUser(999, accessToken, 404);
        });

        it('should return 404 for non-existing chat', async () => {
            const { accessToken } = await registerUser();
            await sendMessageToChat(999, accessToken, 404);
        });
    });

    describe('Chats', () => {
        it('chat must be created after the message is sent to the user', async () => {
            const { userId: user1Id, accessToken: user1Token } =
                await registerUser();
            const { userId: user2Id, accessToken: user2Token } =
                await registerUser();

            const msgRes = await sendMessageToUser(
                user2Id,
                user1Token
            );

            const chatsResponse1 = await getChats(user1Token)
                .expect(200);

            expect(chatsResponse1.body).toEqual(
                expect.objectContaining({
                    data: expect.any(Array),
                    total: 1,
                    page: 1,
                    totalPages: 1,
                    isLast: true
                })
            );
            expect(chatsResponse1.body.data).toHaveLength(1);
            expect(chatsResponse1.body.data[0]).toEqual(
                expect.objectContaining({
                    id: expect.any(Number),
                    userId: user2Id,
                    title: expect.any(String),
                    latestMessage: expect.any(Object)
                })
            );
            expect(chatsResponse1.body.data[0].latestMessage.id).toBe(
                msgRes.body.message.id
            );
            expect(chatsResponse1.body.data[0].latestMessage.sender.id).toBe(
                user1Id
            );

            const chatsResponse2 = await getChats(user2Token)
                .expect(200);

            expect(chatsResponse2.body.data[0].userId).toBe(user1Id);
        });

        it('two chats must be created', async () => {
            const { userId: user1Id, accessToken: user1Token } =
                await registerUser();
            const { userId: user2Id } = await registerUser();
            const { userId: user3Id, accessToken: user3Token } =
                await registerUser();

            // user1 -> user2
            const msgRes1 = await sendMessageToUser(
                user2Id,
                user1Token
            );

            // user3 -> user1
            const msgRes2 = await sendMessageToUser(
                user1Id,
                user3Token
            );

            const chatsResponse = await getChats(user1Token)
                .expect(200);

            expect(chatsResponse.body).toEqual(
                expect.objectContaining({
                    data: expect.any(Array),
                    total: 2,
                    page: 1,
                    totalPages: 1,
                    isLast: true
                })
            );
            expect(chatsResponse.body.data).toHaveLength(2);

            // последнее сообщение в первом чате
            expect(chatsResponse.body.data[0]).toEqual(
                expect.objectContaining({
                    id: expect.any(Number),
                    userId: user3Id,
                    title: expect.any(String),
                    latestMessage: expect.any(Object)
                })
            );
            expect(chatsResponse.body.data[0].latestMessage.id).toBe(
                msgRes2.body.message.id
            );
            expect(chatsResponse.body.data[0].latestMessage.sender.id).toBe(
                user3Id
            );

            // последнее сообщение во втором чате
            expect(chatsResponse.body.data[1].latestMessage.id).toBe(
                msgRes1.body.message.id
            );
            expect(chatsResponse.body.data[1].latestMessage.sender.id).toBe(
                user1Id
            );
        });

        it('should return chat by id', async () => {
            const { accessToken: user1Token } = await registerUser();
            const { userId: user2Id } = await registerUser();

            await sendMessageToUser(user2Id, user1Token);

            const chatsResponse = await getChats(user1Token)
                .expect(200);

            const chatRes = await request(app.getHttpServer())
                .get(`/chats/${chatsResponse.body.data[0].id}`)
                .set('Authorization', `Bearer ${user1Token}`)
                .expect(200);

            expect(chatRes.body.chat).toEqual(
                expect.objectContaining({
                    id: expect.any(Number),
                    userId: user2Id,
                    title: expect.any(String),
                    latestMessage: expect.any(Object)
                })
            );
        });

        it('should not return not existing chat', async () => {
            const { accessToken } = await registerUser();

            await request(app.getHttpServer())
                .get('/chats/999')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(404);
        });

        it('should not return not own chat', async () => {
            const { accessToken: user1Token } = await registerUser();
            const { userId: user2Id } = await registerUser();
            const { accessToken: user3Token } = await registerUser();

            const res = await sendMessageToUser(user2Id, user1Token);

            const createdMessage = await dataSource
                .getRepository(Message)
                .findOne({
                    where: { id: res.body.message.id }
                });

            await request(app.getHttpServer())
                .get(`/chats/${createdMessage.chatId}`)
                .set('Authorization', `Bearer ${user3Token}`)
                .expect(404);
        });

        describe('Unread chats count', () => {
            it('should return 0 when there are no unread chats', async () => {
                const { accessToken } = await registerUser();

                const res = await request(app.getHttpServer())
                    .get('/notifications/count')
                    .set('Authorization', `Bearer ${accessToken}`)
                    .expect(200);

                expect(res.body.unreadChats).toBe(0);
            });

            it('should count unread chat when message is received', async () => {
                const { userId: user1Id, accessToken: user1Token } =
                    await registerUser();
                const { accessToken: user2Token } = await registerUser();

                await sendMessageToUser(user1Id, user2Token);

                const res = await request(app.getHttpServer())
                    .get('/notifications/count')
                    .set('Authorization', `Bearer ${user1Token}`)
                    .expect(200);

                expect(res.body.unreadChats).toBe(1);
            });

            it('should count only unique chats, not messages', async () => {
                const { userId: user1Id, accessToken: user1Token } =
                    await registerUser();
                const { accessToken: user2Token } = await registerUser();

                await sendMessageToUser(user1Id, user2Token);
                await sendMessageToUser(user1Id, user2Token);
                await sendMessageToUser(user1Id, user2Token);

                const res = await request(app.getHttpServer())
                    .get('/notifications/count')
                    .set('Authorization', `Bearer ${user1Token}`)
                    .expect(200);

                expect(res.body.unreadChats).toBe(1);
            });

            it('should increase count with multiple senders', async () => {
                const { userId: user1Id, accessToken: user1Token } =
                    await registerUser();
                const { accessToken: user2Token } = await registerUser();
                const { accessToken: user3Token } = await registerUser();

                await sendMessageToUser(user1Id, user2Token);
                await sendMessageToUser(user1Id, user3Token);

                const res = await request(app.getHttpServer())
                    .get('/notifications/count')
                    .set('Authorization', `Bearer ${user1Token}`)
                    .expect(200);

                expect(res.body.unreadChats).toBe(2);
            });

            // todo: обнулей счетчика после явной прочиткий сообщения ('should reset unread count after reading latest message')

            it('should reset unread count after reply', async () => {
                const { userId: user1Id, accessToken: user1Token } =
                    await registerUser();
                const { userId: user2Id, accessToken: user2Token } =
                    await registerUser();

                await sendMessageToUser(user1Id, user2Token);

                let res = await request(app.getHttpServer())
                    .get('/notifications/count')
                    .set('Authorization', `Bearer ${user1Token}`)
                    .expect(200);

                expect(res.body.unreadChats).toBe(1);

                await sendMessageToUser(user2Id, user1Token);

                res = await request(app.getHttpServer())
                    .get('/notifications/count')
                    .set('Authorization', `Bearer ${user1Token}`)
                    .expect(200);

                expect(res.body.unreadChats).toBe(0);
            });
        });

        describe('Delete chat', () => {
            it('should delete chat', async () => {
                const { accessToken: user1Token } = await registerUser();
                const { userId: user2Id, accessToken: user2Token } =
                    await registerUser();

                await sendMessageToUser(user2Id, user1Token);

                let chatRes = await getChats(user2Token).expect(200);

                expect(chatRes.body).toEqual(
                    expect.objectContaining({
                        data: expect.any(Array),
                        total: 1,
                        page: 1,
                        totalPages: 1,
                        isLast: true
                    })
                );
                expect(chatRes.body.data).toHaveLength(1);

                chatRes = await getChats(user1Token).expect(200);

                expect(chatRes.body).toEqual(
                    expect.objectContaining({
                        data: expect.any(Array),
                        total: 1,
                        page: 1,
                        totalPages: 1,
                        isLast: true
                    })
                );
                expect(chatRes.body.data).toHaveLength(1);

                await request(app.getHttpServer())
                    .del(`/chats/${chatRes.body.data[0].id}`)
                    .set('Authorization', `Bearer ${user2Token}`)
                    .expect(200);

                chatRes = await getChats(user2Token).expect(200);

                expect(chatRes.body).toEqual(
                    expect.objectContaining({
                        data: expect.any(Array),
                        total: 0,
                        page: 1,
                        totalPages: 0,
                        isLast: true
                    })
                );
                expect(chatRes.body.data).toHaveLength(0);

                chatRes = await getChats(user1Token).expect(200);

                expect(chatRes.body).toEqual(
                    expect.objectContaining({
                        data: expect.any(Array),
                        total: 1,
                        page: 1,
                        totalPages: 1,
                        isLast: true
                    })
                );
                expect(chatRes.body.data).toHaveLength(1);
            });

            it('should return 404 when deleting non-existing chat', async () => {
                const { accessToken } = await registerUser();

                await request(app.getHttpServer())
                    .del('/chats/999')
                    .set('Authorization', `Bearer ${accessToken}`)
                    .expect(404);
            });

            it('should not allow another user to delete foreign chat', async () => {
                const { accessToken: user1Token } = await registerUser();
                const { userId: user2Id, accessToken: user2Token } =
                    await registerUser();
                const { accessToken: user3Token } = await registerUser();

                await sendMessageToUser(user2Id, user1Token);

                const chats = await getChats(user2Token).expect(200);
                const chatId = chats.body.data[0].id;

                await request(app.getHttpServer())
                    .del(`/chats/${chatId}`)
                    .set('Authorization', `Bearer ${user3Token}`)
                    .expect(404);
            });

            it('should recreate chat after new incoming message', async () => {
                const { accessToken: user1Token } = await registerUser();
                const { userId: user2Id, accessToken: user2Token } =
                    await registerUser();

                await sendMessageToUser(user2Id, user1Token);

                const chats = await getChats(user2Token).expect(200);
                const chatId = chats.body.data[0].id;

                await request(app.getHttpServer())
                    .del(`/chats/${chatId}`)
                    .set('Authorization', `Bearer ${user2Token}`)
                    .expect(200);

                await sendMessageToUser(user2Id, user1Token);

                const newChats = await getChats(user2Token).expect(200);

                expect(newChats.body.total).toBe(1);
            });
        });
    });
});
