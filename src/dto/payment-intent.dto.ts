import { IsNotEmpty, IsArray, IsNumber } from 'class-validator';

export class PaymentIntentDto {
    @IsArray()
    @IsNotEmpty()
    ids: number[];

    @IsNumber()
    @IsNotEmpty()
    fees: number;
}