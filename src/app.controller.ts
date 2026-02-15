import { Public } from '@auth/decorators';
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
    constructor() {}

    @Public()
    @Get('health')
    getHello(): string {
        return;
    }
}
