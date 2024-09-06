import { IsString, IsNumber, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { CartItemDto, OrderStatus } from './post-payment-process.dto';


export class ChangeStatusDto {
    @IsNotEmpty()
    @IsString()
    status: OrderStatus;

    @IsNotEmpty()
    @IsNumber()
    id: number;
}
