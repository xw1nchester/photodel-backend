import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('DB_HOST'),
                port: configService.get('DB_PORT'),
                username: configService.get('DB_USER'),
                password: configService.get('DB_PASSWORD'),
                database: configService.get('DB_NAME'),
                autoLoadEntities: true, // OR entities: [__dirname + '/../**/*.entity{.ts,.js}']
                migrations: [__dirname + '/migrations/*{.ts,.js}'],
                // migrationsRun: configService.get('NODE_ENV') == 'test',
                synchronize: false
            }),
            inject: [ConfigService]
        })
    ]
})
export class DatabaseModule {}
