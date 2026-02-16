import { Public } from '@auth/decorators';
import { Controller, Get, HttpStatus } from '@nestjs/common';

@Controller()
export class AppController {
    constructor() {}

    @Public()
    @Get('health')
    getHello() {
        return HttpStatus.OK;
    }
}
