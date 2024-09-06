// src/dto/mail-data.dto.ts

import { IsString, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CartItemDto } from './post-payment-process.dto';


export class MailDataDto {
    @IsString()
    customer_name: string;

    @IsString()
    customer_email: string;

    @ValidateNested({ each: true })
    @Type(() => CartItemDto)
    uniqueCartItems: CartItemDto[];

    @IsString()
    stripe_payment_intent_id: string;

    @IsNumber()
    total_price: number;

    @IsNumber()
    shipping_price: number;
}
