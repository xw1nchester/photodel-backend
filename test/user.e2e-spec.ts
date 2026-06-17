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
import { Profile } from '@users/entities/profile.entity';
import { User } from '@users/entities/user.entity';
import { Place } from '@locations/entities/place.entity';
import { ProCategory } from '@pro-categories/pro-category.entity';
import { Specialization } from '@specializations/specialization.entity';
import { Social } from '@socials/entities/social.entity';

const getTemporaryLocationDates = () => {
    const today = new Date();

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const format = (date: Date) => date.toISOString().split('T')[0];

    return {
        startDate: format(yesterday),
        endDate: format(tomorrow)
    };
};

describe('Users & Profiles (e2e)', () => {
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

    const seedData = async () => {
        await dataSource.getRepository(Place).save([
            {
                country: 'Россия',
                city: 'Москва',
                coordinates: {
                    type: 'Point',
                    coordinates: [37.62, 55.75]
                }
            },
            {
                country: 'Россия',
                city: 'Санкт-Петербург',
                coordinates: {
                    type: 'Point',
                    coordinates: [30.31, 59.94]
                }
            },
            {
                country: 'Россия',
                city: 'Екатеринбург',
                coordinates: {
                    type: 'Point',
                    coordinates: [60.61, 56.85]
                }
            },
            {
                country: 'Россия',
                city: 'Новосибирск',
                coordinates: {
                    type: 'Point',
                    coordinates: [82.93, 55.04]
                }
            },
            {
                country: 'Россия',
                city: 'Калининград',
                coordinates: {
                    type: 'Point',
                    coordinates: [20.51, 54.71]
                }
            }
        ]);

        await dataSource
            .getRepository(ProCategory)
            .save([
                { name: 'Фотографы' },
                { name: 'Визажисты' },
                { name: 'Модели' },
                { name: 'Фотостудии' }
            ]);

        await dataSource
            .getRepository(Specialization)
            .save([
                { name: 'Животные' },
                { name: 'Архитектура' },
                { name: 'Репортаж' },
                { name: 'Дети' }
            ]);

        await dataSource
            .getRepository(Social)
            .save([
                { name: 'Телефон' },
                { name: 'Сайт' },
                { name: 'Email' },
                { name: 'Facebook' }
            ]);
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
        await seedData();

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
        await dataSource.getRepository(User).deleteAll();
    });

    const fetchAdditionalData = async () => {
        const proCategoriesRes = await request(app.getHttpServer())
            .get('/pro-categories')
            .expect(200);

        expect(proCategoriesRes.body).toHaveProperty('proCategories');
        expect(Array.isArray(proCategoriesRes.body.proCategories)).toBe(true);

        const specializationsRes = await request(app.getHttpServer())
            .get('/specializations')
            .expect(200);

        expect(specializationsRes.body).toHaveProperty('specializations');
        expect(Array.isArray(specializationsRes.body.specializations)).toBe(
            true
        );

        const socialsRes = await request(app.getHttpServer())
            .get('/socials')
            .expect(200);

        expect(socialsRes.body).toHaveProperty('socials');
        expect(Array.isArray(socialsRes.body.socials)).toBe(true);

        const proCategoryIds = proCategoriesRes.body.proCategories.map(
            item => item.id
        );
        const specializationIds = specializationsRes.body.specializations.map(
            item => item.id
        );
        const socialIds = socialsRes.body.socials.map(item => item.id);

        return { proCategoryIds, specializationIds, socialIds };
    };

    const registerUser = async (): Promise<string> => {
        const registerResponse = await request(app.getHttpServer())
            .post('/auth/register')
            .set('User-Agent', 'Mozilla/5.0 (TestAgent)')
            .send({
                email: 'test.user@example.com',
                firstName: 'Test',
                lastName: 'User',
                isAdult: true,
                isProfessional: true,
                password: 'StrongPass123!'
            })
            .expect(201);

        expect(registerResponse.body).toEqual(
            expect.objectContaining({
                user: expect.any(Object),
                accessToken: expect.any(String)
            })
        );

        return registerResponse.body.accessToken;
    };

    const fillProfile = async (accessToken: string) => {
        const { proCategoryIds, specializationIds, socialIds } =
            await fetchAdditionalData();

        const firstHalf = (arr: any[]) =>
            arr.slice(0, Math.ceil(arr.length / 2));

        const { startDate, endDate } = getTemporaryLocationDates();

        const profileResponse = await request(app.getHttpServer())
            .patch('/users/profile')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                status: 'Свободен',
                price: 'от 5000р',
                conditions: 'Только на условиях предоплаты',
                equipment: 'Canon EOS R5, объективы 24-70, 70-200',
                geography: ['Москва', 'Санкт-Петербург', 'Екатеринбург'],
                languages: ['Русский', 'Английский'],
                about: 'Профессиональный фотограф с 10-летним опытом. Специализируюсь на свадебной и портретной съёмке.',
                location: {
                    latitude: 54.702656,
                    longitude: 20.515619,
                    address: 'Рыбная деревня'
                },
                proCategoryIds: firstHalf(proCategoryIds),
                specializationIds: firstHalf(specializationIds),
                socials: firstHalf(socialIds).map((id, i) => ({
                    id,
                    value: `Social ${i} value`
                })),
                temporaryLocations: [
                    {
                        startDate,
                        endDate,
                        location: {
                            latitude: 56.829029,
                            longitude: 60.599397,
                            address: 'Гринвич'
                        },
                        comment: 'Командировка'
                    }
                ]
            })
            .expect(200);

        return profileResponse;
    };

    describe('Profile', () => {
        it('should initialize profile', async () => {
            const accessToken = await registerUser();
            const profileResponse = await fillProfile(accessToken);

            expect(profileResponse.body.profile).toBeDefined();
            expect(profileResponse.body.profile).toEqual(
                expect.objectContaining({
                    id: expect.any(Number)
                })
            );

            const profile = await dataSource.getRepository(Profile).findOne({
                where: { user: { id: profileResponse.body.profile.id } },
                relations: {
                    user: true,
                    location: {
                        place: true
                    },
                    temporaryLocations: {
                        location: {
                            place: true
                        }
                    }
                }
            });

            expect(profile).toBeDefined();
            expect(profile.location.place.city).toBe('Калининград');
            expect(Array.isArray(profile.temporaryLocations)).toBe(true);
            expect(profile.temporaryLocations[0].location.place.city).toBe(
                'Екатеринбург'
            );
        });

        it('should return own profile', async () => {
            const accessToken = await registerUser();
            await fillProfile(accessToken);

            const res = await request(app.getHttpServer())
                .get('/users/profile')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(res.body).toHaveProperty('profile');
            expect(res.body.profile).toHaveProperty('location');
            expect(res.body.profile).toHaveProperty('activeTemporaryLocation');

            expect(res.body.profile.location.place.city).toBe('Калининград');

            const { startDate, endDate } = getTemporaryLocationDates();

            expect(res.body.profile.activeTemporaryLocation.startDate).toBe(
                startDate
            );
            expect(res.body.profile.activeTemporaryLocation.endDate).toBe(
                endDate
            );
            expect(
                res.body.profile.activeTemporaryLocation.location.place.city
            ).toBe('Екатеринбург');
        });

        it('should return user profile', async () => {
            const accessToken = await registerUser();
            const profileResponse = await fillProfile(accessToken);

            const res = await request(app.getHttpServer())
                .get(`/users/${profileResponse.body.profile.id}/profile`)
                .query({ latitude: 57.135959, longitude: 65.565027 })
                .expect(200);

            expect(res.body).toHaveProperty('profile');
            expect(res.body.profile).toHaveProperty('distance');

            // фактическое расстояние от Тмн до Екб ~304
            expect(res.body.profile.distance).toBeGreaterThanOrEqual(250);
            expect(res.body.profile.distance).toBeLessThanOrEqual(350);
        });
    });
});
