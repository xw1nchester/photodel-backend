import {
    ValidatorConstraint,
    ValidatorConstraintInterface
} from 'class-validator';

import { TemporaryLocationDto } from '@users/dto/profile-request.dto';

@ValidatorConstraint({ name: 'NoDateOverlap', async: false })
export class NoDateOverlapValidator implements ValidatorConstraintInterface {
    validate(locations: TemporaryLocationDto[]) {
        if (!locations || locations.length == 0) {
            return true;
        }

        const ranges = locations
            .map(l => ({
                start: new Date(l.startDate).getTime(),
                end: new Date(l.endDate).getTime()
            }))
            .sort((a, b) => a.start - b.start);

        for (const range of ranges) {
            if (range.end < range.start) {
                return false;
            }
        }

        for (let i = 1; i < ranges.length; i++) {
            const prev = ranges[i - 1];
            const current = ranges[i];

            if (current.start < prev.end) {
                return false;
            }
        }

        return true;
    }

    defaultMessage() {
        return 'temporaryLocations содержит пересекающиеся диапазоны дат';
    }
}
