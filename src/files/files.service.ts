import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';

import { S3Service } from '@s3/s3.service';

import { CreateFileDto } from './dto/file-create.dto';
import { File } from './file.entity';

@Injectable()
export class FilesService {
    constructor(
        @InjectRepository(File)
        private readonly filesRepository: Repository<File>,
        private readonly s3Service: S3Service
    ) {}

    async saveFiles(dtos: CreateFileDto[]) {
        return await this.filesRepository.save(dtos);
    }

    // TODO: рефакторить:
    // 1) транзакционность между s3 и бд
    // 2) рассмотреть вариант передавать part.file
    async uploadFiles(parts: AsyncIterableIterator<any>, userId: number) {
        const uploadedFiles: (CreateFileDto & { url: string })[] = [];

        for await (const part of parts) {
            const buffer = await part.toBuffer();

            const { key, url } = await this.s3Service.uploadFile(
                buffer,
                part.mimetype
            );

            uploadedFiles.push({
                originalName: part.filename,
                mimeType: part.mimetype,
                size: buffer.length,
                key,
                url,
                userId
            });
        }

        const data = await this.saveFiles(uploadedFiles);

        const files = data.map((file, i) => ({
            id: file.id,
            originalName: file.originalName,
            mimeType: file.mimeType,
            size: file.size,
            key: file.key,
            url: uploadedFiles[i].url
        }));

        return { files };
    }

    async findAndvalidateByIdsAndUserId(
        ids: number[],
        userId: number,
        manager?: EntityManager
    ) {
        const repo = manager
            ? manager.getRepository(File)
            : this.filesRepository;

        ids = [...new Set(ids)];

        const files = await repo.find({
            where: { id: In(ids), userId }
        });

        if (ids.length != files.length) {
            throw new NotFoundException('Файл не найден');
        }

        return files;
    }

    getUrl(key: string) {
        return this.s3Service.getUrl(key);
    }

    createBasicDto(file: File) {
        return file
            ? {
                  id: file.id,
                  key: file.key,
                  url: this.s3Service.getUrl(file.key)
              }
            : null;
    }
}
