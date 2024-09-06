import { Injectable, InternalServerErrorException, NotFoundException, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/entities/products.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProductsService {
    private readonly logger = new Logger(ProductsService.name);

    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>
    ) {}

    async getProducts(): Promise<Product[]> {

        try {
            return await this.productRepository.find();

        } catch (error) {
            this.logger.error(
                `Error getting all products:`,
                error.stack,
                "Error custom:", error
            );
            throw new InternalServerErrorException('Failed to retrieve products');
        }
    }

    async getSingleProduct(id: number): Promise<Product> {

        try {
            return await this.productRepository.findOne({where: {id}});

        } catch (error) {
            
            this.logger.error(
                `Error gettins ingle product:`,
                error.stack,
                "Error custom:", error
            );
            throw new NotFoundException(`Product with id ${id} not found`);        
        }
    }
}
