import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from '../dto/post-payment-process.dto';



@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    customer_name: string;

    @Column({ type: 'varchar', length: 255 })
    customer_email: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    shipping_address_line1: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    shipping_address_line2: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    shipping_city: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    shipping_state: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    shipping_postal_code: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    shipping_country: string;

    @Column({ type: 'int' })
    total_price: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    shipping_method: string;

    @Column({ type: 'int', nullable: true })
    shipping_price: number;

    @Column({ type: 'varchar', length: 255 })
    stripe_payment_intent_id: string;

    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
    status: OrderStatus;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @OneToMany(() => OrderItem, orderItem => orderItem.order)
    items: OrderItem[];
}
