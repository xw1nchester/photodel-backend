import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SpecializationsController } from './specializations.controller';
import { Specialization } from './specializations.entity';
import { SpecializationsService } from './specializations.service';

@Module({
    imports: [TypeOrmModule.forFeature([Specialization])],
    controllers: [SpecializationsController],
    providers: [SpecializationsService],
    exports: [SpecializationsService],
})
export class SpecializationsModule {}
