# Email Notification Setup

This document explains how to set up email notifications for delivery status updates.

## Environment Variables

Create a `.env` file in the Backend directory with the following email configuration:

```env
# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
```

## Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. **Use the app password** as `MAIL_PASS` in your `.env` file

## Email Notifications

The system now sends email notifications to recipients when:

1. **Driver Assignment**: When a driver is assigned to a delivery
2. **Status Updates**: When the delivery status changes:
   - PENDING → PICKED_UP
   - PICKED_UP → IN_TRANSIT
   - IN_TRANSIT → DELIVERED
   - Any status → CANCELLED

## Email Template Features

- **Professional HTML design** with SendIT branding
- **Status-specific messages** and styling
- **Delivery details** including tracking ID, locations, driver info
- **Responsive design** that works on mobile and desktop

## Testing

Use the test endpoint to verify email functionality:

```bash
POST /parcels/test-email
```

This will send a test email to verify the configuration is working.

## Troubleshooting

1. **Check SMTP settings** - Ensure port 587 and TLS are enabled
2. **Verify app password** - Make sure you're using an app password, not your regular password
3. **Check firewall** - Ensure port 587 is not blocked
4. **Review logs** - Check console output for detailed error messages

## Email Content

The emails include:
- Recipient's name and email
- Tracking ID
- Current status with color-coded badge
- Pickup and destination locations
- Package description
- Driver name (if assigned)
- Estimated delivery date (if available) 