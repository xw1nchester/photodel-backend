import { Controller, Post, Req } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOkResponse
} from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';

import { S3Service } from '@s3/s3.service';

import { FilesResponseDto } from './dto/files-response.dto';

@Controller('files')
export class FilesController {
    constructor(private readonly s3Service: S3Service) {}

    @Post('upload')
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary'
                    }
                }
            }
        }
    })
    @ApiOkResponse({ type: FilesResponseDto })
    public async uploadFiles(@Req() request: FastifyRequest) {
        if (!request.isMultipart()) {
            return { message: 'Request is not multipart' };
        }

        const parts = request.files();

        const uploadedFiles = [];
        for await (const part of parts) {
            const buffer = await part.toBuffer();

            const { key, url } = await this.s3Service.uploadFile(
                buffer,
                part.mimetype
            );

            uploadedFiles.push({
                filename: part.filename,
                mimetype: part.mimetype,
                size: buffer.length,
                key,
                url
            });
        }

        return { files: uploadedFiles };
    }
}
