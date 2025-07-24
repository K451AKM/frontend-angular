import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private serviceId = 'service_n7i0dfe';
  private templateId = 'template_b0yo0ae';
  private publicKey = 'KMx0hdDeOwCQpWDl9';

  constructor() {
    // Inicializar EmailJS con tu public key
    emailjs.init(this.publicKey);
  }

  async sendOrderConfirmation(orderData: {
    customerName: string;
    customerEmail: string;
    orderNumber: string;
    orderTotal: string;
    orderItems: any[];
    shippingAddress: string;
    paymentMethod: string;
  }): Promise<boolean> {
    try {
      console.log('🚀 Enviando email de confirmación...', orderData);

      // Preparar los datos para el template de EmailJS
      const templateParams = {
        to_name: orderData.customerName,
        to_email: orderData.customerEmail,
        order_number: orderData.orderNumber,
        order_total: orderData.orderTotal,
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        shipping_address: orderData.shippingAddress,
        payment_method: this.getPaymentMethodText(orderData.paymentMethod),
        order_items: this.formatOrderItems(orderData.orderItems),
        order_date: new Date().toLocaleDateString('es-MX', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      const response = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams
      );

      console.log('✅ Email enviado exitosamente:', response);
      return true;

    } catch (error) {
      console.error('❌ Error enviando email:', error);
      return false;
    }
  }

  private getPaymentMethodText(method: string): string {
    const methods: { [key: string]: string } = {
      'cash': 'Efectivo (Pago contra entrega)',
      'transfer': 'Transferencia Bancaria',
      'card': 'Tarjeta de Crédito/Débito'
    };
    return methods[method] || method;
  }

  private formatOrderItems(items: any[]): string {
    return items.map(item => 
      `• ${item.product.name} - Cantidad: ${item.quantity} - Precio: $${item.price} - Subtotal: $${item.subtotal}`
    ).join('\n');
  }
}
