import { User } from "@users/entities/user.entity";

export const createUserDto = (
    user: User,
    avatarUrl: string
) => {
    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarKey: user.avatarKey,
        avatarUrl,
        isPro: user.isPro
    };
}