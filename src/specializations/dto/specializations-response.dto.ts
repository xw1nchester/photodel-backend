import { ApiProperty } from '@nestjs/swagger';

export class SpecializationDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'Архитектура' })
    name: string;
}

export class SpecializationsResponseDto {
    @ApiProperty({ type: SpecializationDto, isArray: true })
    specializations: SpecializationDto[];
}
