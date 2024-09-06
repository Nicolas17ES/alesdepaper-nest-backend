import { Controller, Get, UsePipes, ValidationPipe, Post, Body } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { PaymentIntentDto} from '../../dto/payment-intent.dto';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Get()
  async getStripePublishableKey(): Promise<{ publishableKey: string }> {
    return this.stripeService.getStripePublishableKey();
  }

  @Post()
  @UsePipes(ValidationPipe)
  async createPaymentIntent(@Body() paymentIntentDto: PaymentIntentDto): Promise<{ clientSecret: string }> {
    return this.stripeService.createPaymentIntent(paymentIntentDto);
  }
}
