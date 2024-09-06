import { IsString, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
// Enum definition for status
export enum OrderStatus {
    PENDING = 'pending',
    PAID = 'paid',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered'
}

export class CartItemDto {
    @IsNumber()
    id: number;

    @IsNumber()
    product_id: number;

    @IsNumber()
    quantity: number;

    @IsNumber()
    precio: number;

    @IsString()
    nombre: string;

    @IsString()
    description: string;
}

export class PostPaymentProcessDto {
    @IsString()
    name: string;

    @IsString()
    email: string;

    @IsOptional()
    @IsString()
    shipping_address_line1?: string;

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

    @IsOptional()
    @IsString()
    shipping_method?: string;

    @IsOptional()
    @IsNumber()
    shipping_price?: number;

    @IsString()
    stripe_payment_intent_id: string;

    @IsOptional()
    @IsString()
    status?: OrderStatus;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CartItemDto)
    cart_items: CartItemDto[];
}

