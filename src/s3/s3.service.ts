import {
    CreateBucketCommand,
    DeleteObjectCommand,
    PutBucketPolicyCommand,
    PutObjectCommand,
    S3Client
} from '@aws-sdk/client-s3';
import {
    Injectable,
    InternalServerErrorException,
    Logger,
    OnModuleInit
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 } from 'uuid';

@Injectable()
export class S3Service implements OnModuleInit {
    private logger = new Logger(S3Service.name);
    private s3: S3Client;

    constructor(private configService: ConfigService) {}

    private async createBucketIfNotExists() {
        try {
            await this.s3.send(
                new CreateBucketCommand({ Bucket: this.configService.get('S3_BUCKET') })
            );
            this.logger.debug(
                `Bucket '${this.configService.get('S3_BUCKET')}' created or already exists.`
            );
        } catch (err) {
            if (
                err?.name === 'BucketAlreadyOwnedByYou' ||
                err?.name === 'BucketAlreadyExists'
            ) {
                this.logger.debug(
                    `Bucket '${this.configService.get('S3_BUCKET')}' already exists.`
                );
            } else {
                this.logger.error('Error creating bucket:', err);
                throw err;
            }
        }
    }

    private async makeBucketPublic() {
        const policy = {
            Version: '2012-10-17',
            Statement: [
                {
                    Sid: 'PublicRead',
                    Effect: 'Allow',
                    Principal: '*',
                    Action: ['s3:GetObject'],
                    Resource: [`arn:aws:s3:::${this.configService.get('S3_BUCKET')}/*`]
                }
            ]
        };

        try {
            await this.s3.send(
                new PutBucketPolicyCommand({
                    Bucket: this.configService.get('S3_BUCKET'),
                    Policy: JSON.stringify(policy)
                })
            );
            this.logger.debug(`Bucket '${this.configService.get('S3_BUCKET')}' is now public.`);
        } catch (err) {
            this.logger.error('Error setting bucket policy:', err);
            throw err;
        }
    }

    async onModuleInit() {
        this.s3 = new S3Client({
            region: 'us-east-1',
            endpoint: this.configService.get('S3_URL'),
            credentials: {
                accessKeyId: this.configService.get('S3_ACCESS_KEY'),
                secretAccessKey: this.configService.get('S3_SECRET_KEY')
            },
            forcePathStyle: true
        });
        await this.createBucketIfNotExists();
        await this.makeBucketPublic();
    }

    // как вариант юзать @aws-sdk/s3-request-presigner (если бакет приватный)
    // async generateUploadUrl(bucket: string, key: string) {
    //     const command = new PutObjectCommand({
    //         Bucket: bucket,
    //         Key: key
    //     });

    //     return getSignedUrl(this.client, command, {
    //         expiresIn: 3600
    //     });
    // }
    getUrl(key: string) {
        return `${this.configService.get('S3_URL')}/${this.configService.get('S3_BUCKET')}/${key}`;
    }

    async uploadFile(body: Buffer, contentType: string) {
        try {
            const key = v4();

            await this.s3.send(
                new PutObjectCommand({
                    Bucket: this.configService.get('S3_BUCKET'),
                    Key: key,
                    Body: body,
                    ContentType: contentType
                })
            );

            const url = this.getUrl(key);

            this.logger.debug(`File uploaded.: ${url}`);

            return { key, url };
        } catch (err) {
            this.logger.error('Error uploading file:', err);
            throw new InternalServerErrorException('Failed to upload file');
        }
    }

    async deleteFile(key: string) {
        try {
            await this.s3.send(
                new DeleteObjectCommand({
                    Bucket: this.configService.get('S3_BUCKET'),
                    Key: key
                })
            );
            this.logger.debug('File deleted', key);
        } catch (err) {
            this.logger.error('Error delete file:', err);
            throw new InternalServerErrorException('Can not delete file');
        }
    }
}
