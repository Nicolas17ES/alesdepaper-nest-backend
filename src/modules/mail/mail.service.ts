import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'Gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.APP_PASS,
            },
        });
    }

    private formatPrice(priceInCents: number): string {
        return (priceInCents / 100).toFixed(2).replace('.', ',');
    }

    async sendConfirmationEmails(emailData: any): Promise<boolean> {
        const name = emailData.customer_name;
        const email = emailData.customer_email;
        const uniqueCartItems = emailData.uniqueCartItems;
        const paymentId = emailData.stripe_payment_intent_id;
        const total_price = this.formatPrice(emailData.total_price);
        const shipping_price = this.formatPrice(emailData.shipping_price);
        const shippingPrice = parseFloat(shipping_price) > 0 ? shipping_price : '0,00';

        let emailStates = {
            customerEmail: false,
            selfEmail: false,
        };

        const productDetails = uniqueCartItems.map(item => {
            return `<p>${item.quantity} x ${item.nombre} (${item.description}) - $${(item.precio / 100).toFixed(2)}</p>`;
        }).join('');

        // Define mail options for the customer
        const customerMailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Ales de Paper - Purchase Confirmation",
            html: `
        <h1>Thank you for your purchase, ${name}!</h1>
        <p>Your payment ID is: ${paymentId}</p>
        <h2>Products:</h2>
        ${productDetails}
        <p>Shipping price: ${shippingPrice}</p>
        <p>Total price: ${total_price}</p>
        <p>If you have any questions, please contact us with your payment ID.</p>
        <p>Best regards,<br>Ales de Paper</p>
      `,
        };

        // Define mail options for self email
        const selfMailOptions = {
            from: process.env.EMAIL,
            to: process.env.EMAIL, // Your email address
            subject: "Ales de Paper - New Purchase Notification",
            html: `
        <h1>New Purchase Notification</h1>
        <p><strong>Customer Name:</strong> ${name}</p>
        <p><strong>Customer Email:</strong> ${email}</p>
        <p><strong>Payment ID:</strong> ${paymentId}</p>
        <h2>Products:</h2>
        ${productDetails}
        <p>Shipping price: ${shippingPrice}</p>
        <p>Total price: ${total_price}</p>
      `,
        };

        try {
            // Send both emails concurrently using Promise.all
            const [customerInfo, selfInfo] = await Promise.all([
                this.transporter.sendMail(customerMailOptions),
                this.transporter.sendMail(selfMailOptions),
            ]);

            // Set email states based on success
            if (customerInfo.accepted.length > 0) {
                emailStates.customerEmail = true;
            }

            if (selfInfo.accepted.length > 0) {
                emailStates.selfEmail = true;
            }

            // Return the email states
            return emailStates.customerEmail && emailStates.selfEmail;

        } catch (error) {
            // Handle errors
            this.logger.error(
                `Error sending emails:`,
                error.stack,
                "Error custom:", error
            );
            return false;
        }
    }
}
