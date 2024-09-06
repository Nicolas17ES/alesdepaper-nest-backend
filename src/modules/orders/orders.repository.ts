import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { DataSource } from 'typeorm';
import { BaseRepository } from 'src/common/base-repository';
import { Order } from 'src/entities/order.entity';

@Injectable({ scope: Scope.REQUEST })
export class OrdersRepository extends BaseRepository {
    constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
        super(dataSource, req);
    }

    async saveOrder(order: Order): Promise<Order> {
        return this.getRepository(Order).save(order);
    }
}
