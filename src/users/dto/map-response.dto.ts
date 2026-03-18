import { ApiProperty } from '@nestjs/swagger';

import { LocationResponseDto } from '@locations/dto/location-response.dto';

class MapResponseDto {
    @ApiProperty({ example: 1 })
    userId: number;

    @ApiProperty({ type: LocationResponseDto })
    location: LocationResponseDto;
}

export class MapWrapperResponseDto {
    @ApiProperty({ type: [MapResponseDto] })
    data: MapResponseDto[];
}
