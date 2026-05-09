import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Social } from './entities/social.entity';
import { SocialsController } from './socials.controller';
import { SocialsService } from './socials.service';
import { SiteSocial } from './entities/site-social.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Social, SiteSocial])],
    controllers: [SocialsController],
    providers: [SocialsService],
    exports: [SocialsService]
})
export class SocialsModule {}
