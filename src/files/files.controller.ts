import { Controller, Post, Req } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOkResponse
} from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';

import { CurrentUser } from '@auth/decorators';
import { JwtPayload } from '@auth/interfaces';
import { S3Service } from '@s3/s3.service';

import { FilesResponseDto } from './dto/files-response.dto';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
    constructor(
        private readonly filesService: FilesService,
        private readonly s3Service: S3Service
    ) {}

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
    public async uploadFiles(
        @Req() request: FastifyRequest,
        @CurrentUser() user: JwtPayload
    ) {
        if (!request.isMultipart()) {
            return { message: 'Request is not multipart' };
        }

        const parts = request.files();

        return await this.filesService.uploadFiles(parts, user.id);
    }
}
