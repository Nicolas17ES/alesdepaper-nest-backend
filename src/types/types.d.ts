import { OrderStatus } from "src/dto/post-payment-process.dto";

// src/types/jwt-payload.interface.ts
export interface JwtPayload {
    sub: number;
    username: string;
    email: string;
    role: string;
}


export interface CreateOrderResponse {
    message: string;
    orderId: number;
}

export interface MessageResponse {
    message: string;
}

interface AmdinPanelOrderItem {
    product_name: string;
    product_price: number;
    quantity: number;
}

export interface AdminPanelOrder {
    order_id: number;
    customer_name: string;
    customer_email: string;
    shipping_address_line1?: string;
    shipping_address_line2?: string; // Optional, as it can be nullable
    shipping_city?: string;
    shipping_state?: string;
    shipping_postal_code?: string;
    shipping_country?: string;
    order_total_price: number;
    shipping_method: string;
    shipping_price: number;
    stripe_payment_intent_id: string;
    order_status: OrderStatus; // Assuming it's a string like "paid", otherwise, you can use an enum for the status
    order_created_at: Date; // Or use `Date` if you want to work with Date objects
    order_items: OrderItem[]; // Array of order items
}

