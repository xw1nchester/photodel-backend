import { Module } from '@nestjs/common';
import { SpecializationsService } from './specializations.service';
import { SpecializationsController } from './specializations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Specialization } from './specializations.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Specialization])],
    controllers: [SpecializationsController],
    providers: [SpecializationsService]
})
export class SpecializationsModule {}
