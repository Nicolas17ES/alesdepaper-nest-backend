import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { MailService } from '../mail/mail.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/entities/order.entity';
import { Product } from 'src/entities/products.entity';
import { OrderItem } from 'src/entities/order-item.entity';
import { OrdersRepository } from './orders.repository';
import { OrderItemsRepository } from './order-items.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product])

  ],
  controllers: [OrdersController],
  providers: [OrdersService, MailService, OrdersRepository, OrderItemsRepository],
})
export class OrdersModule {}
