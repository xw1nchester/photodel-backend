import { User } from "@users/users.entity";

export class UserDto {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    isAdult: boolean;
    isProfessional: boolean;
    isVerified: boolean;
    createdAt: Date;

    constructor(user: User) {
        this.id = user.id;
        this.email = user.email;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.phone = user.phone;
        this.isAdult = user.isAdult;
        this.isProfessional = user.isProfessional;
        this.isVerified = user.isVerified;
        this.createdAt = user.createdAt;
    }
}
