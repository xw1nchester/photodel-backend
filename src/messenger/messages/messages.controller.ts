import { Controller, Delete, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@auth/decorators';
import { JwtPayload } from '@auth/interfaces';

import { MessageWrapperResponseDto } from './dto/message-response.dto';
import { MessagesService } from './messages.service';

@ApiTags('Messenger')
@Controller('messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) {}

    @Patch(':id/read')
    @ApiBearerAuth()
    @ApiOkResponse({ type: MessageWrapperResponseDto })
    async readMessage(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.messagesService.readMessage(id, user.id);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOkResponse({ type: MessageWrapperResponseDto })
    async remove(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload
    ) {
        return await this.messagesService.remove(id, user.id);
    }
}
