import { Module } from '@nestjs/common';
import { CodesService } from './codes.service';

@Module({
  providers: [CodesService],
})
export class CodesModule {}
