// src/dto/order-data.dto.ts
import { IsString, IsNumber, IsOptional, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { CartItemDto, OrderStatus } from './post-payment-process.dto';


export class OrderDataDto {
    @IsString()
    customer_name: string;

    @IsString()
    customer_email: string;

    @IsString()
    shipping_address_line1: string;

    @IsOptional()
    @IsString()
    shipping_address_line2?: string;

    @IsOptional()
    @IsString()
    shipping_city?: string;

    @IsOptional()
    @IsString()
    shipping_state?: string;

    @IsOptional()
    @IsString()
    shipping_postal_code?: string;

    @IsOptional()
    @IsString()
    shipping_country?: string;

    @IsNumber()
    total_price: number;

    @IsOptional()
    @IsString()
    shipping_method?: string;

    @IsNumber()
    shipping_price: number;

    @IsString()
    stripe_payment_intent_id: string;

    @ValidateNested({ each: true })
    @Type(() => CartItemDto)
    uniqueCartItems: CartItemDto[];

    @IsEnum(OrderStatus)
    status: OrderStatus;
}
