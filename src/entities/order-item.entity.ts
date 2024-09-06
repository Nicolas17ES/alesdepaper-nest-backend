import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from './products.entity';

@Entity('order_items')
export class OrderItem {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Order, order => order.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'order_id' }) // Specifies the foreign key column in 'order_items' table
    order: Order;

    @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'product_id' }) // Specifies the foreign key column in 'order_items' table
    product: Product;

    @Column({ type: 'int' })
    quantity: number;

    @Column({ type: 'int' })
    price: number;
}
