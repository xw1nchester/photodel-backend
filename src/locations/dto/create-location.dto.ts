export class CreateLocationDto {
    latitude: number;
    longitude: number;
    country?: string | null;
    city?: string | null;
    street?: string | null;
    houseNumber?: string | null;
}
