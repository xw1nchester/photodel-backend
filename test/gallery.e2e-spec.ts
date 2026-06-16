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

describe('Albums & Photos (e2e)', () => {
    // чтобы успел стартануть тестовый контейнер с бд
    jest.setTimeout(30000);

    let app: NestFastifyApplication;
    let container: StartedPostgreSqlContainer;
    let dataSource: DataSource;
    let accessToken: string;

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

    describe('User setup', () => {
        it('should register a new user with valid data and return access token', async () => {
            const res = await request(app.getHttpServer())
                .post('/auth/register')
                .set('User-Agent', 'Mozilla/5.0 (TestAgent)')
                .send({
                    email: 'test.user@example.com',
                    firstName: 'Test',
                    lastName: 'User',
                    isAdult: true,
                    isProfessional: false,
                    password: 'StrongPass123!'
                })
                .expect(201);

            accessToken = res.body.accessToken;
        });
    });

    describe('Albums - POST /albums (Create)', () => {
        it('should create a new album with valid data', async () => {
            const createAlbumDto = {
                title: 'My Travel Album',
                description: 'Photos from my trip',
                image: 'e7cb06e8-1335-4b5c-bb46-0edfd4015aa1.jpeg',
                isPublished: true,
                photoIds: []
            };

            const res = await request(app.getHttpServer())
                .post('/albums')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(createAlbumDto)
                .expect(201);

            expect(res.body.album).toHaveProperty('id');
            expect(res.body.album.title).toBe(createAlbumDto.title);
            expect(res.body.album.description).toBe(createAlbumDto.description);
            expect(res.body.album.imageKey).toBe(createAlbumDto.image);
            expect(res.body.album).toHaveProperty('imageUrl');
            expect(res.body.album.isPublished).toBe(createAlbumDto.isPublished);
            expect(res.body.album.photosCount).toBe(0);
            expect(res.body.album).toHaveProperty('createdAt');
            expect(res.body.album).toHaveProperty('updatedAt');
        });

        it('should create a new album with photos', async () => {
            // First create some photos to link to the album
            const photo1 = await request(app.getHttpServer())
                .post('/photos')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    image: 'photo1-for-album.jpg',
                    name: 'Photo 1 for Album',
                    isForSale: false,
                    isPublished: true,
                    specializationIds: [],
                    albumIds: []
                })
                .expect(201);

            const photo2 = await request(app.getHttpServer())
                .post('/photos')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    image: 'photo2-for-album.jpg',
                    name: 'Photo 2 for Album',
                    isForSale: false,
                    isPublished: true,
                    specializationIds: [],
                    albumIds: []
                })
                .expect(201);

            const photoIds = [photo1.body.photo.id, photo2.body.photo.id];

            // Then create album with those photo IDs
            const createAlbumDto = {
                title: 'Album With Photos',
                description: 'Album containing photos',
                image: 'album-cover.jpg',
                isPublished: true,
                photoIds
            };

            const res = await request(app.getHttpServer())
                .post('/albums')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(createAlbumDto)
                .expect(201);

            expect(res.body.album.photosCount).toBe(photoIds.length);
        });
    });

    describe('Albums - GET /albums (Get User Personal Albums)', () => {
        it('should return paginated list of user personal albums', async () => {
            const res = await request(app.getHttpServer())
                .get('/albums')
                .set('Authorization', `Bearer ${accessToken}`)
                .query({ page: 1, limit: 10 })
                .expect(200);

            expect(res.body).toHaveProperty('data');
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body).toHaveProperty('total');
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('isLast');
        });
    });

    describe('Albums - GET /albums/:id (Get Album by ID)', () => {
        let albumId: number;

        it('should get album by id', async () => {
            // First create an album to get its ID
            const createRes = await request(app.getHttpServer())
                .post('/albums')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    title: 'Test Album',
                    isPublished: true,
                    photoIds: []
                })
                .expect(201);

            albumId = createRes.body.album.id;

            const res = await request(app.getHttpServer())
                .get(`/albums/${albumId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(res.body.album.id).toBe(albumId);
            expect(res.body.album.title).toBe('Test Album');
        });
    });

    describe('Albums - PATCH /albums/:id (Update)', () => {
        let albumId: number;

        it('should update album', async () => {
            // Create album first
            const createRes = await request(app.getHttpServer())
                .post('/albums')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    title: 'Original Title',
                    isPublished: false,
                    photoIds: []
                })
                .expect(201);

            albumId = createRes.body.album.id;

            const res = await request(app.getHttpServer())
                .patch(`/albums/${albumId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    title: 'Updated Title',
                    description: 'Updated description',
                    isPublished: true
                })
                .expect(200);

            expect(res.body.album.title).toBe('Updated Title');
            expect(res.body.album.description).toBe('Updated description');
            expect(res.body.album.isPublished).toBe(true);
        });
    });

    describe('Albums - DELETE /albums/:id (Delete)', () => {
        let albumId: number;

        it('should delete album', async () => {
            // Create album first
            const createRes = await request(app.getHttpServer())
                .post('/albums')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    title: 'To Delete',
                    isPublished: true,
                    photoIds: []
                })
                .expect(201);

            albumId = createRes.body.album.id;

            await request(app.getHttpServer())
                .delete(`/albums/${albumId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            // Verify album is deleted
            await request(app.getHttpServer())
                .get(`/albums/${albumId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(404);
        });
    });

    describe('Albums - POST /albums/bulk-delete (Bulk Delete)', () => {
        it('should bulk delete albums', async () => {
            // Create multiple albums
            const album1 = await request(app.getHttpServer())
                .post('/albums')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ title: 'Album 1', isPublished: true, photoIds: [] })
                .expect(201);

            const album2 = await request(app.getHttpServer())
                .post('/albums')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ title: 'Album 2', isPublished: true, photoIds: [] })
                .expect(201);

            const ids = [album1.body.album.id, album2.body.album.id];

            await request(app.getHttpServer())
                .post('/albums/bulk-delete')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ ids })
                .expect(204);
        });
    });

    describe('Photos - POST /photos (Create)', () => {
        it('should create a new photo with valid data', async () => {
            const createPhotoDto = {
                image: 'test-image-key.jpg',
                name: 'My Photo',
                description: 'Beautiful sunset',
                location: {
                    latitude: 55.7558,
                    longitude: 37.6173,
                    address: 'Russia, Moscow, Tverskaya Street 1'
                },
                camera: 'Canon EOS 5D Mark IV',
                aperture: 'f/2.8',
                focalLength: '50mm',
                shutterSpeed: '1/200s',
                iso: 400,
                flash: 'On',
                isForSale: false,
                isPublished: true,
                specializationIds: [],
                albumIds: []
            };

            const res = await request(app.getHttpServer())
                .post('/photos')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(createPhotoDto)
                .expect(201);

            expect(res.body.photo).toHaveProperty('id');
            expect(res.body.photo.imageKey).toBe(createPhotoDto.image);
            expect(res.body.photo).toHaveProperty('imageUrl');
            expect(res.body.photo.name).toBe(createPhotoDto.name);
            expect(res.body.photo.description).toBe(createPhotoDto.description);
            expect(res.body.photo).toHaveProperty('location');
            expect(res.body.photo.camera).toBe(createPhotoDto.camera);
            expect(res.body.photo.aperture).toBe(createPhotoDto.aperture);
            expect(res.body.photo.focalLength).toBe(createPhotoDto.focalLength);
            expect(res.body.photo.shutterSpeed).toBe(
                createPhotoDto.shutterSpeed
            );
            expect(res.body.photo.iso).toBe(createPhotoDto.iso);
            expect(res.body.photo.flash).toBe(createPhotoDto.flash);
            expect(res.body.photo.isForSale).toBe(createPhotoDto.isForSale);
            expect(res.body.photo.isPublished).toBe(createPhotoDto.isPublished);
            expect(res.body.photo).toHaveProperty('specializations');
            expect(Array.isArray(res.body.photo.specializations)).toBe(true);
            expect(res.body.photo).toHaveProperty('albums');
            expect(Array.isArray(res.body.photo.albums)).toBe(true);
            expect(res.body.photo).toHaveProperty('createdAt');
            expect(res.body.photo).toHaveProperty('updatedAt');
            expect(res.body.photo).toHaveProperty('user');
        });

        it('should create a new photo with albums', async () => {
            // First create some albums to link to the photo
            const album1 = await request(app.getHttpServer())
                .post('/albums')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    title: 'Album 1 for Photo',
                    isPublished: true,
                    photoIds: []
                })
                .expect(201);

            const album2 = await request(app.getHttpServer())
                .post('/albums')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    title: 'Album 2 for Photo',
                    isPublished: true,
                    photoIds: []
                })
                .expect(201);

            const albumIds = [album1.body.album.id, album2.body.album.id];

            // Then create photo with those album IDs
            const createPhotoDto = {
                image: 'photo-with-albums.jpg',
                name: 'Photo in Albums',
                description: 'Photo linked to albums',
                isForSale: false,
                isPublished: true,
                specializationIds: [],
                albumIds
            };

            const res = await request(app.getHttpServer())
                .post('/photos')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(createPhotoDto)
                .expect(201);

            expect(res.body.photo.albums.length).toBe(albumIds.length);
        });
    });

    describe('Photos - GET /photos (Get User Personal Photos)', () => {
        it('should return paginated list of user personal photos', async () => {
            const res = await request(app.getHttpServer())
                .get('/photos')
                .set('Authorization', `Bearer ${accessToken}`)
                .query({ page: 1, limit: 10, my: true })
                .expect(200);

            expect(res.body).toHaveProperty('data');
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body).toHaveProperty('total');
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('isLast');
        });
    });

    describe('Photos - GET /photos/:id (Get User Public Photo by ID)', () => {
        let photoId: number;

        it('should get user public photo by id', async () => {
            // Create photo first
            const createRes = await request(app.getHttpServer())
                .post('/photos')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    image: 'test-key.jpg',
                    name: 'Test Photo',
                    isForSale: false,
                    isPublished: true,
                    specializationIds: [],
                    albumIds: []
                })
                .expect(201);

            photoId = createRes.body.photo.id;

            const res = await request(app.getHttpServer())
                .get(`/photos/${photoId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(res.body.photo.id).toBe(photoId);
            expect(res.body.photo.name).toBe('Test Photo');
        });
    });

    describe('Photos - GET /photos/:id (Public - Get Public Photo)', () => {
        let publicPhotoId: number;

        it('should get published photo without auth', async () => {
            // Create a published photo
            const createRes = await request(app.getHttpServer())
                .post('/photos')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    image: 'public-photo.jpg',
                    name: 'Public Photo',
                    isForSale: false,
                    isPublished: true,
                    specializationIds: [],
                    albumIds: []
                })
                .expect(201);

            publicPhotoId = createRes.body.photo.id;

            // Access without token (public endpoint)
            const res = await request(app.getHttpServer())
                .get(`/photos/${publicPhotoId}`)
                .expect(200);

            expect(res.body.photo.id).toBe(publicPhotoId);
            expect(res.body.photo.isPublished).toBe(true);
        });

        it('should NOT get unpublished photo without auth', async () => {
            // Create an unpublished photo
            const createRes = await request(app.getHttpServer())
                .post('/photos')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    image: 'private-photo.jpg',
                    name: 'Private Photo',
                    isForSale: false,
                    isPublished: false,
                    specializationIds: [],
                    albumIds: []
                })
                .expect(201);

            const privatePhotoId = createRes.body.photo.id;

            // Try to access without token (should fail - returns 404)
            await request(app.getHttpServer())
                .get(`/photos/${privatePhotoId}`)
                .expect(404);
        });

        it('should get unpublished photo WITH auth (owner)', async () => {
            // Create an unpublished photo
            const createRes = await request(app.getHttpServer())
                .post('/photos')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    image: 'private-photo.jpg',
                    name: 'Private Photo',
                    isForSale: false,
                    isPublished: false,
                    specializationIds: [],
                    albumIds: []
                })
                .expect(201);

            const privatePhotoId = createRes.body.photo.id;

            // Access WITH token (should work - owner can see own photos)
            const res = await request(app.getHttpServer())
                .get(`/photos/${privatePhotoId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(res.body.photo.id).toBe(privatePhotoId);
        });
    });

    describe('Photos - PATCH /photos/:id (Update)', () => {
        let photoId: number;

        it('should update photo', async () => {
            // Create photo first
            const createRes = await request(app.getHttpServer())
                .post('/photos')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    image: 'original.jpg',
                    name: 'Original Name',
                    isForSale: false,
                    isPublished: false,
                    specializationIds: [],
                    albumIds: []
                })
                .expect(201);

            photoId = createRes.body.photo.id;

            const res = await request(app.getHttpServer())
                .patch(`/photos/${photoId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    image: 'updated.jpg',
                    name: 'Updated Name',
                    isForSale: true,
                    isPublished: true,
                    specializationIds: [],
                    albumIds: []
                })
                .expect(200);

            expect(res.body.photo.name).toBe('Updated Name');
            expect(res.body.photo.isForSale).toBe(true);
            expect(res.body.photo.isPublished).toBe(true);
        });
    });

    describe('Photos - DELETE /photos/:id (Delete)', () => {
        let photoId: number;

        it('should delete photo', async () => {
            // Create photo first
            const createRes = await request(app.getHttpServer())
                .post('/photos')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    image: 'to-delete.jpg',
                    name: 'To Delete',
                    isForSale: false,
                    isPublished: true,
                    specializationIds: [],
                    albumIds: []
                })
                .expect(201);

            photoId = createRes.body.photo.id;

            await request(app.getHttpServer())
                .delete(`/photos/${photoId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            // Verify photo is deleted
            await request(app.getHttpServer())
                .get(`/photos/${photoId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(404);
        });
    });

    describe('Photos - POST /photos/bulk-delete (Bulk Delete)', () => {
        it('should bulk delete photos', async () => {
            // Create multiple photos
            const photo1 = await request(app.getHttpServer())
                .post('/photos')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    image: 'photo1.jpg',
                    name: 'Photo 1',
                    isForSale: false,
                    isPublished: true,
                    specializationIds: [],
                    albumIds: []
                })
                .expect(201);

            const photo2 = await request(app.getHttpServer())
                .post('/photos')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    image: 'photo2.jpg',
                    name: 'Photo 2',
                    isForSale: false,
                    isPublished: true,
                    specializationIds: [],
                    albumIds: []
                })
                .expect(201);

            const ids = [photo1.body.photo.id, photo2.body.photo.id];

            await request(app.getHttpServer())
                .post('/photos/bulk-delete')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ ids })
                .expect(204);
        });
    });

    describe('Albums - POST /albums/:id/photos (Add Photos to Album)', () => {
        let albumId: number;
        let photoId: number;

        it('should add photos to album', async () => {
            // Create album
            const albumRes = await request(app.getHttpServer())
                .post('/albums')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ title: 'Test Album', isPublished: true, photoIds: [] })
                .expect(201);

            albumId = albumRes.body.album.id;

            // Create photo
            const photoRes = await request(app.getHttpServer())
                .post('/photos')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    image: 'photo-for-album.jpg',
                    name: 'Photo for Album',
                    isForSale: false,
                    isPublished: true,
                    specializationIds: [],
                    albumIds: []
                })
                .expect(201);

            photoId = photoRes.body.photo.id;

            // Add photo to album
            await request(app.getHttpServer())
                .post(`/albums/${albumId}/photos`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ ids: [photoId] })
                .expect(201);
        });
    });

    describe('Albums - POST /albums/:id/photos/bulk-delete (Remove Photos from Album)', () => {
        let albumId: number;
        let photoId: number;

        it('should remove photos from album', async () => {
            // Create album
            const albumRes = await request(app.getHttpServer())
                .post('/albums')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    title: 'Album to Remove',
                    isPublished: true,
                    photoIds: []
                })
                .expect(201);

            albumId = albumRes.body.album.id;

            // Create photo
            const photoRes = await request(app.getHttpServer())
                .post('/photos')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    image: 'photo-to-remove.jpg',
                    name: 'Photo to Remove',
                    isForSale: false,
                    isPublished: true,
                    specializationIds: [],
                    albumIds: []
                })
                .expect(201);

            photoId = photoRes.body.photo.id;

            // Add photo to album first
            await request(app.getHttpServer())
                .post(`/albums/${albumId}/photos`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ ids: [photoId] })
                .expect(201);

            // Then remove it
            await request(app.getHttpServer())
                .post(`/albums/${albumId}/photos/bulk-delete`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ ids: [photoId] })
                .expect(204);
        });
    });
});
