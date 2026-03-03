import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Specialization } from './specialization.entity';
import { SpecializationsController } from './specializations.controller';
import { SpecializationsService } from './specializations.service';

// TODO: как вариант перенести в pro-categories (и там же будут категории моделей)
@Module({
    imports: [TypeOrmModule.forFeature([Specialization])],
    controllers: [SpecializationsController],
    providers: [SpecializationsService],
    exports: [SpecializationsService]
})
export class SpecializationsModule {}
