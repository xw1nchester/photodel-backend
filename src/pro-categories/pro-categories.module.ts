import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProCategoriesController } from './pro-categories.controller';
import { ProCategoriesService } from './pro-categories.service';
import { ProCategory } from './pro-category.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ProCategory])],
    controllers: [ProCategoriesController],
    providers: [ProCategoriesService],
    exports: [ProCategoriesService]
})
export class ProCategoriesModule {}
