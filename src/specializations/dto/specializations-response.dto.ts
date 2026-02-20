import { ApiProperty } from '@nestjs/swagger';

import { SpecializationDto } from './specialization.dto';

export class SpecializationsResponseDto {
    @ApiProperty({ type: SpecializationDto, isArray: true })
    specializations: SpecializationDto[];
}
