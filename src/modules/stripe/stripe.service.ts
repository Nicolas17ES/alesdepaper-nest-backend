import { Injectable, InternalServerErrorException, HttpException, HttpStatus, NotFoundException  } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/entities/products.entity';
import Stripe from 'stripe'; // Import Stripe
import { PaymentIntentDto } from '../../dto/payment-intent.dto';
import { calculateNumberFrequencies, findProductsByIds, calculateTotalPrice } from './stripe.utils'; // Import the utils

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

    // Create a payment intent
    async createPaymentIntent(paymentIntentDto: PaymentIntentDto): Promise<{ clientSecret: string }> {

        const {ids, fees} = paymentIntentDto;

        if (!ids || ids.length === 0) {
            throw new PaymentIntentCreationException('PaymentIntentDto must include at least one ID.');
        }

        const countOccurrences = calculateNumberFrequencies(ids);

        try {

            const productsArray = await findProductsByIds(this.productRepository, ids);

            const totalPrice = calculateTotalPrice(productsArray, countOccurrences);

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

    
}
