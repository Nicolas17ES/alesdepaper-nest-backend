import { Controller, Post, Get, Body, UsePipes, ValidationPipe, UseInterceptors, Put, UseGuards } from '@nestjs/common';
import { PostPaymentProcessDto } from 'src/dto/post-payment-process.dto';
import { AdminPanelOrder, CreateOrderResponse, MessageResponse } from 'src/types/types';
import { OrdersService } from './orders.service';
import { TransactionInterceptor } from 'src/common/transaction.interceptor';
import { ChangeStatusDto } from 'src/dto/change-status.dto';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';


@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  @UsePipes(ValidationPipe)
  @UseInterceptors(TransactionInterceptor) // Apply the transaction interceptor
  async postPaymentProcess(@Body() postPaymentProcessDto: PostPaymentProcessDto): Promise<CreateOrderResponse> {
    return await this.ordersService.postPaymentProcess(postPaymentProcessDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  @UsePipes(ValidationPipe)
  async changeOrderStatus(@Body() changeStatusDto: ChangeStatusDto): Promise<MessageResponse> {
    return await this.ordersService.changeOrderStatus(changeStatusDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllOrders(): Promise<AdminPanelOrder[]> {
    return await this.ordersService.getAllOrders();
  }
}
