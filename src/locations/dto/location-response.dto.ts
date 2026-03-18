import { ApiProperty } from '@nestjs/swagger';

export class PlaceResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({
        example: 'Раша',
        nullable: true
    })
    country: string;

    @ApiProperty({
        example: 'Калининград',
        nullable: true
    })
    city: string;
}

export class LocationResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({
        example: 55.7558,
        minimum: -90,
        maximum: 90
    })
    latitude: number;

    @ApiProperty({
        example: 37.6173,
        minimum: -180,
        maximum: 180
    })
    longitude: number;

    @ApiProperty({
        example: 'Лесозаготовительная база (ну или просто лесобаза)',
        nullable: true
    })
    address: string;

    @ApiProperty({ type: PlaceResponseDto })
    place: PlaceResponseDto;
}
