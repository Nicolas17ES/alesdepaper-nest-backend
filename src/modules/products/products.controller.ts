import { Controller, Get, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from 'src/entities/products.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getProducts(): Promise<Product[]> {
   return await this.productsService.getProducts();
  }

  @Get('/:id')
  async getSingleProduct(@Param('id') id: string): Promise<Product> {
    const productId = Number(id); 
    return await this.productsService.getSingleProduct(productId);
  }

}
