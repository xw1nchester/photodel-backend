import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Social } from './social.entity';
import { SocialsController } from './socials.controller';
import { SocialsService } from './socials.service';

@Module({
    imports: [TypeOrmModule.forFeature([Social])],
    controllers: [SocialsController],
    providers: [SocialsService],
    exports: [SocialsService]
})
export class SocialsModule {}
