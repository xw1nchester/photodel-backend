import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SocialsController } from './socials.controller';
import { Social } from './socials.entity';
import { SocialsService } from './socials.service';

@Module({
    imports: [TypeOrmModule.forFeature([Social])],
    controllers: [SocialsController],
    providers: [SocialsService]
})
export class SocialsModule {}
