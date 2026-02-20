import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProCategoriesController } from './pro-categories.controller';
import { ProCategory } from './pro-categories.entity';
import { ProCategoriesService } from './pro-categories.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProCategory])
  ],
  controllers: [ProCategoriesController],
  providers: [ProCategoriesService],
  exports: [ProCategoriesService]
})
export class ProCategoriesModule {}
