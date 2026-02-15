import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './tokens.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Token])],
    providers: [TokensService],
    exports: [TokensService]
})
export class TokensModule {}
