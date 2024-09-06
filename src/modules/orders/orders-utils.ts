
import { CartItemDto } from 'src/dto/post-payment-process.dto';
import { OrderDataDto } from 'src/dto/order-data.dto';
import { MailDataDto } from 'src/dto/mail-data.dto';
import { OrderStatus } from 'src/dto/post-payment-process.dto';


export function calculateUniqueCartItems(cartItems: CartItemDto[]): CartItemDto[] {
    const itemQuantities = cartItems.reduce((acc, item) => {
        if (acc[item.id]) {
            acc[item.id].quantity += item.quantity;
        } else {
            acc[item.id] = { ...item, quantity: item.quantity };
        }
        return acc;
    }, {} as { [key: number]: CartItemDto });

    return Object.values(itemQuantities);
}

export function calculateTotalPrice(cartItems: CartItemDto[], shippingPrice: number): number {
    let totalPrice = 0;
    cartItems.forEach(item => totalPrice += item.precio * item.quantity);
    totalPrice += shippingPrice;
    return totalPrice;
}

export function createOrderDataDto(
    customerName: string, customerEmail: string, shippingAddressLine1: string,
    shippingAddressLine2: string | undefined, shippingCity: string | undefined,
    shippingState: string | undefined, shippingPostalCode: string | undefined,
    shippingCountry: string | undefined, totalPrice: number, shippingMethod: string | undefined,
    shippingPrice: number, stripePaymentIntentId: string, uniqueCartItems: CartItemDto[],
    status: OrderStatus
): OrderDataDto {
    return {
        customer_name: customerName,
        customer_email: customerEmail,
        shipping_address_line1: shippingAddressLine1,
        shipping_address_line2: shippingAddressLine2,
        shipping_city: shippingCity,
        shipping_state: shippingState,
        shipping_postal_code: shippingPostalCode,
        shipping_country: shippingCountry,
        total_price: totalPrice,
        shipping_method: shippingMethod,
        shipping_price: shippingPrice,
        stripe_payment_intent_id: stripePaymentIntentId,
        uniqueCartItems,
        status
    };
}

export function createMailDataDto(
    customerName: string, customerEmail: string, uniqueCartItems: CartItemDto[],
    stripePaymentIntentId: string, totalPrice: number, shippingPrice: number
): MailDataDto {
    return {
        customer_name: customerName,
        customer_email: customerEmail,
        uniqueCartItems,
        stripe_payment_intent_id: stripePaymentIntentId,
        total_price: totalPrice,
        shipping_price: shippingPrice
    };
}