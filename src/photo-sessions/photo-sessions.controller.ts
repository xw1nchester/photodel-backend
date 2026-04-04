import { Body, Controller, Post } from '@nestjs/common';
import { PhotoSessionsService } from './photo-sessions.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '@auth/decorators';
import { JwtPayload } from '@auth/interfaces';
import { PhotoSessionRequestDto } from './dto/photo-session-request.dto';

@Controller('photo-sessions')
export class PhotoSessionsController {
    constructor(private readonly photoSessionsService: PhotoSessionsService) {}

    @Post()
    @ApiBearerAuth()
    // @ApiOkResponse({ type: FilmingLocationWrapperResponseDto })
    async create(
        @CurrentUser() user: JwtPayload,
        @Body() dto: PhotoSessionRequestDto
    ) {
        return await this.photoSessionsService.create(user.id, dto);
    }
}
