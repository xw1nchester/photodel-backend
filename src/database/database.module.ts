import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                // TODO: рассмотреть еще способы использования отдельной бд для тестов
                host: configService.get('DB_HOST'),
                port: configService.get('DB_PORT'),
                username: configService.get('DB_USER'),
                password: configService.get('DB_PASSWORD'),
                database:
                    configService.get('NODE_ENV') != 'test'
                        ? configService.get('DB_NAME')
                        : 'photodel_test',
                autoLoadEntities: true, // OR entities: [__dirname + '/../**/*.entity{.ts,.js}']
                synchronize: configService.get('NODE_ENV') == 'test'
            }),
            inject: [ConfigService]
        })
    ]
})
export class DatabaseModule {}
