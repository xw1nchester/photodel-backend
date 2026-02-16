import { Module } from '@nestjs/common';
import { CodesService } from './codes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Code } from './codes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Code])],
  providers: [CodesService],
  exports: [CodesService]
})
export class CodesModule {}
