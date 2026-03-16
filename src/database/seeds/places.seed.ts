import { DataSource } from 'typeorm';
import { Point } from 'typeorm';
import { Seeder } from 'typeorm-extension';

import { Place } from '@locations/entities/place.entity';

import * as placesData from './places.json';

export default class PlaceSeeder implements Seeder {
    public async run(dataSource: DataSource): Promise<void> {
        const repo = dataSource.getRepository(Place);

        const places = placesData.map(place => ({
            country: place.country,
            city: place.city,
            coordinates: {
                type: 'Point',
                coordinates: [place.longitude, place.latitude]
            } as Point
        }));

        await repo.upsert(places, ['city', 'country']);
    }
}
