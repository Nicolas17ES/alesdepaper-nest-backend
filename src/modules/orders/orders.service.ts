import { Injectable, BadRequestException, InternalServerErrorException, HttpException, HttpStatus, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostPaymentProcessDto} from 'src/dto/post-payment-process.dto';
import { OrderDataDto } from 'src/dto/order-data.dto';
import { MailDataDto } from 'src/dto/mail-data.dto';
import { OrderItem } from 'src/entities/order-item.entity';
import { Order } from 'src/entities/order.entity';
import { MailService } from '../mail/mail.service'; // Adjust the import path as necessary
import { Product } from 'src/entities/products.entity';
import { AdminPanelOrder, CreateOrderResponse, MessageResponse } from 'src/types/types';
import { OrdersRepository } from './orders.repository';
import { OrderItemsRepository } from './order-items.repository';
import { ChangeStatusDto } from 'src/dto/change-status.dto';
import { calculateUniqueCartItems, calculateTotalPrice, createOrderDataDto, createMailDataDto } from './orders-utils';

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(OrderItem)
        private readonly orderItemRepository: Repository<OrderItem>,
        private readonly mailService: MailService,
        private readonly ordersRepository: OrdersRepository,
        private readonly orderItemsRepository: OrderItemsRepository
    ) { }

    async postPaymentProcess(postPaymentProcessDto: PostPaymentProcessDto): Promise<CreateOrderResponse> {

        const {
            name,
            email,
            shipping_address_line1,
            shipping_address_line2,
            shipping_city,
            shipping_state,
            shipping_postal_code,
            shipping_country,
            shipping_method,
            shipping_price,
            stripe_payment_intent_id,
            status,
            cart_items
        } = postPaymentProcessDto;

        try {

            const uniqueCartItems = calculateUniqueCartItems(cart_items);

            const total_price = calculateTotalPrice(uniqueCartItems, shipping_price);

            const orderData: OrderDataDto = createOrderDataDto(
                name, email, shipping_address_line1, shipping_address_line2,
                shipping_city, shipping_state, shipping_postal_code,
                shipping_country, total_price, shipping_method,
                shipping_price, stripe_payment_intent_id, uniqueCartItems, status
            );

            const mailData: MailDataDto = createMailDataDto(
                name, email, uniqueCartItems, stripe_payment_intent_id, total_price, shipping_price
            );

            const orderResponse = await this.createOrder(orderData, mailData);

            return orderResponse;

           
        } catch (error) {
            this.logger.error(
                `Postpayment general error`,
                error.stack,
            );
            // Handle error appropriately, log it, or throw a custom exception
            throw new Error(`Failed to process payment: ${error.message}`);
        }
    }


    private async createOrder(orderDataDto: OrderDataDto, mailData: MailDataDto): Promise<CreateOrderResponse> {
        try {
            const order = new Order(); // Create an instance of Order
            Object.assign(order, orderDataDto); // Assign properties from DTO to the order

            const savedOrder = await this.ordersRepository.saveOrder(order);

            if (savedOrder && savedOrder.id) {
                const orderId = savedOrder.id;
                const uniqueCartItems = orderDataDto.uniqueCartItems;

                for (let item of uniqueCartItems) {
                    const orderItem = new OrderItem(); // Create an instance of OrderItem
                    orderItem.order = { id: orderId } as Order,
                    orderItem.product = { id: item.id } as Product; // Associate with product
                    orderItem.quantity = item.quantity;
                    orderItem.price = item.precio;

                    await this.orderItemsRepository.saveOrderItem(orderItem);
                }

                const emailSuccess = await this.mailService.sendConfirmationEmails(mailData);

                if (emailSuccess) {
                    return {
                        message: 'Order created and confirmation emails sent successfully',
                        orderId: orderId,
                    };
                } else {
                    throw new Error('Error creating order or sending confirmation emails');
                }

                

            } else {
                throw new HttpException('Error creating order', HttpStatus.INTERNAL_SERVER_ERROR);
            }

        } catch (error) {
            if (error.code === '23505') {
                throw new BadRequestException('Order could not be created. Duplicate entry found.');
            }
            this.logger.error(
                `Error creating order`,
                error.stack,
                "Error custom:", error
            );
            throw new InternalServerErrorException('An unexpected error occurred while creating the order.');
        }
    }

    async changeOrderStatus(changeStatusDto: ChangeStatusDto): Promise<MessageResponse> {

        const { id, status } = changeStatusDto;

        try {

            const result = await this.orderRepository.createQueryBuilder()
                .update(Order)
                .set({ status })
                .where('id = :id', { id })
                .execute();

            if (result.affected > 0) {

                return {
                    message: `Changed status for ${id}`,
                };

            } else {

                throw new NotFoundException(`Order with id ${id} not found`);

            }

        } catch(error) {

            this.logger.error(
                `Failed to change order status for order ID: ${changeStatusDto.id}`,
                error.stack,
                "Error custom:", error
            );
            throw new InternalServerErrorException('An unexpected error occurred while changing the order status.');

        }
    }

    async getAllOrders(): Promise<AdminPanelOrder[]> {
        try {
            const orders = await this.orderRepository
                .createQueryBuilder('order')
                .select([
                    'order.id',
                    'order.customer_name',
                    'order.customer_email',
                    'order.shipping_address_line1',
                    'order.shipping_address_line2',
                    'order.shipping_city',
                    'order.shipping_state',
                    'order.shipping_postal_code',
                    'order.shipping_country',
                    'order.total_price',
                    'order.shipping_method',
                    'order.shipping_price',
                    'order.stripe_payment_intent_id',
                    'order.status',
                    'order.created_at',
                    'orderItem.id',
                    'orderItem.quantity',
                    'orderItem.price',
                    'product.nombre',
                    'product.precio'
                ])
                .innerJoin('order.items', 'orderItem')
                .innerJoin('orderItem.product', 'product')
                .getMany();

            if (!orders || orders.length === 0) {
                throw new NotFoundException('No orders found');
            }

            // Format the result to map the order and order items
            return orders.map(order => ({
                order_id: order.id,
                customer_name: order.customer_name,
                customer_email: order.customer_email,
                shipping_address_line1: order.shipping_address_line1,
                shipping_address_line2: order.shipping_address_line2,
                shipping_city: order.shipping_city,
                shipping_state: order.shipping_state,
                shipping_postal_code: order.shipping_postal_code,
                shipping_country: order.shipping_country,
                order_total_price: order.total_price,
                shipping_method: order.shipping_method,
                shipping_price: order.shipping_price,
                stripe_payment_intent_id: order.stripe_payment_intent_id,
                order_status: order.status,
                order_created_at: order.created_at,
                order_items: order.items.map(item => ({
                    product_name: item.product.nombre,
                    product_price: item.product.precio,
                    quantity: item.quantity
                }))
            }));

        } catch (error) {
            this.logger.error(
                'Failed to retrieve all orders',
                error.stack,
                'Error details:', error
            );

            if (error instanceof NotFoundException) {
                throw error;
            } else {
                throw new InternalServerErrorException('An error occurred while retrieving orders.');
            }
        }
    }

}
