import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { DataSource } from 'typeorm';
import { BaseRepository } from 'src/common/base-repository';
import { OrderItem } from 'src/entities/order-item.entity';

@Injectable({ scope: Scope.REQUEST })
export class OrderItemsRepository extends BaseRepository {
    constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
        super(dataSource, req);
    }

    async saveOrderItem(orderItem: OrderItem): Promise<OrderItem> {
        return this.getRepository(OrderItem).save(orderItem);
    }
}
