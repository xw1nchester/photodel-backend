import { Module } from '@nestjs/common';

import { S3Module } from '@s3/s3.module';

import { FilesController } from './files.controller';

@Module({
    imports: [S3Module],
    controllers: [FilesController]
})
export class FilesModule {}
