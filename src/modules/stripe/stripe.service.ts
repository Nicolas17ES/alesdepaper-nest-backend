import { Injectable, InternalServerErrorException, HttpException, HttpStatus, NotFoundException  } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/entities/products.entity';
import Stripe from 'stripe'; // Import Stripe
import { PaymentIntentDto } from '../../dto/payment-intent.dto';

export class PaymentIntentCreationException extends HttpException {
    constructor(message: string) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}

@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>
        ) {
        // Initialize Stripe client with the secret key from environment variables
        const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');

        if (!secretKey) {
            throw new InternalServerErrorException('Stripe secret key is not configured');
        }

        this.stripe = new Stripe(secretKey, {
            apiVersion: '2024-06-20',
        });
    }

    // This function returns the Stripe publishable key to the client
    async getStripePublishableKey(): Promise<{ publishableKey: string }> {
        const publishableKey = this.configService.get<string>('STRIPE_PUBLISHABLE_KEY');

        // Ensure the key is available
        if (!publishableKey) {
            throw new InternalServerErrorException('Stripe publishable key is not configured');
        }

        return { publishableKey };
    }

    // Example method to create a payment intent
    async createPaymentIntent(paymentIntentDto: PaymentIntentDto): Promise<{ clientSecret: string }> {

        const {ids, fees} = paymentIntentDto;

        if (!ids || ids.length === 0) {
            throw new PaymentIntentCreationException('PaymentIntentDto must include at least one ID.');
        }

        const countOccurrences = this.calculateNumberFrequencies(ids);

        try {

            const productsArray = await this.findProductsByIds(ids);

            const totalPrice = this.calculateTotalPrice(productsArray, countOccurrences);

            let finalPrice;

            if (fees) {

                finalPrice = totalPrice + fees;

            } else {

                finalPrice = totalPrice;

            }

            const paymentIntent = await this.stripe.paymentIntents.create({
                currency: "EUR",
                amount: finalPrice,
                automatic_payment_methods: { enabled: true },
            });

            return { clientSecret: paymentIntent.client_secret }

        } catch (error) {
            throw new InternalServerErrorException('Failed to create payment intent');
        }
    }

    private calculateNumberFrequencies(ids: number[]): Record<number, number> {
        return ids.reduce((acc, val) => {
            acc[val] = (acc[val] || 0) + 1;
            return acc;
        }, {} as Record<number, number>);
    }

    private async findProductsByIds(ids: number[]): Promise<Product[]> {
        // Ensure ids is not empty to avoid SQL errors
        if (ids.length === 0) {
            throw new NotFoundException('Productsnot found');
        }

        // Use QueryBuilder to build the query
        const products = await this.productRepository
            .createQueryBuilder('product')
            .where('product.id IN (:...ids)', { ids })
            .getMany();

        return products;
    }

    private calculateTotalPrice(productsArray: Product[], countOccurrences: Record<number, number>): number {

        return productsArray.reduce((acc, product) => {
            if (countOccurrences[product.id] > 1) {

                acc += product.precio * countOccurrences[product.id];

            } else {

                acc += product.precio;

            }

            return acc; 
        }, 0)
    }
}
