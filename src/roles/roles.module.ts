import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './roles.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Role])],
    providers: [RolesService]
})
export class RolesModule {}
