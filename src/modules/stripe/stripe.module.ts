import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { Product } from 'src/entities/products.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product])
  ],
  controllers: [StripeController],
  providers: [StripeService],
})
export class StripeModule {}
