import { ApiProperty } from '@nestjs/swagger';

export class SocialDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;
}
