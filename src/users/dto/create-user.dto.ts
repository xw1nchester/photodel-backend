export class CreateUserDto {
    email: string;
    firstName: string;
    lastName: string;
    isAdult: boolean;
    isProfessional: boolean;
    passwordHash: string;
}
