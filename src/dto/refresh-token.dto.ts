import { IsString } from 'class-validator';

export class RefreshTokenDto {
    @IsString()
    readonly token: string;
}