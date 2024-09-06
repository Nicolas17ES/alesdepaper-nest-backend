import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {

    @IsNotEmpty()
    @IsEmail()
    email: string

    @IsNotEmpty()
    @MinLength(2)
    username: string

    @IsNotEmpty()
    @MinLength(8)
    password: string

}