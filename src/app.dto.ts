import { createZodDto } from 'nestjs-zod';
import { z } from 'zod/v4';

const UserDtoSchema = z.object({
    id: z.string(),
    username: z.string(),
    password: z.string(),
    email: z.email(),
});

export class UserDto extends createZodDto(UserDtoSchema) {}

const LoginDtoSchema = UserDtoSchema.pick({
    username: true,
    password: true,
});

export class LoginDto extends createZodDto(LoginDtoSchema) {}
