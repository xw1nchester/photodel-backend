import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';

import { CurrentUser } from '@auth/decorators';
import { JwtPayload } from '@auth/interfaces';

import { NotificationsCountResponseDto } from './dto/notifications-count-response.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @Get('count')
    @ApiBearerAuth()
    @ApiOkResponse({ type: NotificationsCountResponseDto })
    async getNotificationsCount(@CurrentUser() user: JwtPayload) {
        return this.notificationsService.getNotificationsCount(user.id);
    }
}
