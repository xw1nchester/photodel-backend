import { Controller } from '@nestjs/common';
import { SpecializationsService } from './specializations.service';

@Controller('specializations')
export class SpecializationsController {
  constructor(private readonly specializationsService: SpecializationsService) {}
}
