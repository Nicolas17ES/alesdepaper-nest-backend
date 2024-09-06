// stripe-utils.ts

import { Product } from 'src/entities/products.entity';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
/**
 * Calculate the frequency of each id in the array
 * @param ids Array of numbers
 * @returns A record where the key is the number and the value is its frequency
 */
export function calculateNumberFrequencies(ids: number[]): Record<number, number> {
    return ids.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);
}

/**
 * Find products by their ids using the product repository
 * @param productRepository Repository of the Product entity
 * @param ids Array of product ids
 * @returns Promise resolving to an array of Product entities
 */
export async function findProductsByIds(productRepository: Repository<Product>, ids: number[]): Promise<Product[]> {
    // Ensure ids is not empty to avoid SQL errors
    if (ids.length === 0) {
        throw new NotFoundException('Products not found');
    }

    // Use QueryBuilder to build the query
    const products = await productRepository
        .createQueryBuilder('product')
        .where('product.id IN (:...ids)', { ids })
        .getMany();

    return products;
}

/**
 * Calculate the total price of the products based on their occurrences
 * @param productsArray Array of Product entities
 * @param countOccurrences Record where key is product id and value is the count of occurrences
 * @returns The total price of all products
 */
export function calculateTotalPrice(productsArray: Product[], countOccurrences: Record<number, number>): number {
    return productsArray.reduce((acc, product) => {
        acc += product.precio * (countOccurrences[product.id] || 1);
        return acc;
    }, 0);
}
