import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class TeamRequestQueryDto {
    @ApiProperty({ example: true, required: false })
    @IsBoolean()
    @IsOptional()
    @Transform(
        ({ value }) =>
            value === 'true' || value === true || value === 1 || value === '1'
    )
    accepted?: boolean;
}
