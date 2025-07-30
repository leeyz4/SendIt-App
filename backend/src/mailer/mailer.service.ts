import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ParcelStatus } from '../parcel/dto/create-parcel.dto';

export interface DeliveryNotificationData {
  recipientEmail: string;
  recipientName: string;
  trackingId: string;
  status: ParcelStatus;
  pickupLocation: string;
  destination: string;
  description: string;
  driverName?: string;
  estimatedDelivery?: string;
}

@Injectable()
export class MailerCustomService {
    constructor(private readonly mailerService: MailerService) {}

    async sendMail(options: any) {
        return this.mailerService.sendMail(options);
    }

    async sendDeliveryStatusNotification(data: DeliveryNotificationData) {
        const statusMessages = {
            [ParcelStatus.PENDING]: {
                subject: 'Your parcel is pending pickup',
                message: 'Your parcel has been created and is waiting for pickup.'
            },
            [ParcelStatus.PICKED_UP]: {
                subject: 'Your parcel has been picked up!',
                message: 'Great news! Your parcel has been picked up and is now in our system.'
            },
            [ParcelStatus.IN_TRANSIT]: {
                subject: 'Your parcel is on its way!',
                message: 'Your parcel is now in transit and heading to its destination.'
            },
            [ParcelStatus.DELIVERED]: {
                subject: 'Your parcel has been delivered!',
                message: 'Your parcel has been successfully delivered to its destination.'
            },
            [ParcelStatus.CANCELLED]: {
                subject: 'Your parcel delivery has been cancelled',
                message: 'Your parcel delivery has been cancelled. Please contact support for more information.'
            }
        };

        const statusInfo = statusMessages[data.status];
        
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Delivery Status Update</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #2067a1; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
                    .status-badge { 
                        display: inline-block; 
                        padding: 8px 16px; 
                        border-radius: 20px; 
                        font-weight: bold; 
                        text-transform: uppercase;
                        font-size: 12px;
                    }
                    .status-pending { background: #fff3cd; color: #856404; }
                    .status-picked-up { background: #d1ecf1; color: #0c5460; }
                    .status-in-transit { background: #d4edda; color: #155724; }
                    .status-delivered { background: #d4edda; color: #155724; }
                    .status-cancelled { background: #f8d7da; color: #721c24; }
                    .details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>SendIT Delivery Update</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${data.recipientName},</h2>
                        <p>${statusInfo.message}</p>
                        
                        <div class="details">
                            <h3>Delivery Details:</h3>
                            <p><strong>Tracking ID:</strong> ${data.trackingId}</p>
                            <p><strong>Status:</strong> 
                                <span class="status-badge status-${data.status.toLowerCase().replace('_', '-')}">
                                    ${data.status.replace('_', ' ')}
                                </span>
                            </p>
                            <p><strong>Description:</strong> ${data.description}</p>
                            <p><strong>From:</strong> ${data.pickupLocation}</p>
                            <p><strong>To:</strong> ${data.destination}</p>
                            ${data.driverName ? `<p><strong>Driver:</strong> ${data.driverName}</p>` : ''}
                            ${data.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>` : ''}
                        </div>
                        
                        <p>Thank you for choosing SendIT for your delivery needs!</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated message from SendIT. Please do not reply to this email.</p>
                        <p>For support, contact us at support@sendit.com</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.mailerService.sendMail({
            to: data.recipientEmail,
            subject: statusInfo.subject,
            html: htmlContent,
        });
    }
}
