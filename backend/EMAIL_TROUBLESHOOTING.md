# Email Notification Troubleshooting

## Current Issue
Email notifications are not being sent when drivers update delivery status.

## Quick Fixes

### 1. Check Email Configuration
Create or update `.env` file in Backend directory:

```env
# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
```

### 2. Test Email Functionality
Use the test endpoint to verify email is working:

```bash
POST http://localhost:3000/parcels/test-email
```

### 3. Check Backend Logs
Look for these console messages:
- `📧 Email notification sent to recipient@example.com`
- `📧 Driver assignment notification sent to recipient@example.com`
- `Error sending email notification:`

## Email Setup Steps

### Gmail Setup (Recommended)
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Use app password** as `MAIL_PASS` in `.env`

### Alternative: Use Gmail App Password
If you don't want to enable 2FA, you can use:
- `MAIL_USER=your-email@gmail.com`
- `MAIL_PASS=your-regular-password`
- `MAIL_HOST=smtp.gmail.com`
- `MAIL_PORT=587`

## Debugging Steps

### 1. Check if Emails are Being Sent
Look for these logs in backend console:
```
📧 Email notification sent to recipient@example.com for status: PICKED_UP
📧 Driver assignment notification sent to recipient@example.com
```

### 2. Check for Email Errors
Look for error messages:
```
Error sending email notification: [error details]
Error sending driver assignment notification: [error details]
```

### 3. Test Email Configuration
Use the test endpoint:
```bash
curl -X POST http://localhost:3000/parcels/test-email
```

### 4. Check SMTP Settings
Common issues:
- Wrong port (should be 587 for Gmail)
- Wrong host (should be smtp.gmail.com)
- Wrong credentials
- Firewall blocking port 587

## Email Notification Triggers

Emails are sent when:
1. **Driver Assignment**: Admin assigns driver to delivery
2. **Status Updates**: Driver changes delivery status:
   - PENDING → PICKED_UP
   - PICKED_UP → IN_TRANSIT
   - IN_TRANSIT → DELIVERED

## Email Content

The emails include:
- Recipient's name and email
- Tracking ID
- Current status with color-coded badge
- Pickup and destination locations
- Package description
- Driver name (if assigned)
- Estimated delivery date (if available)

## Common Issues

### 1. "Invalid login" Error
- Check email and password in `.env`
- Make sure you're using app password if 2FA is enabled
- Verify email exists and is correct

### 2. "Connection timeout" Error
- Check internet connection
- Verify SMTP host and port
- Check firewall settings

### 3. "Authentication failed" Error
- Double-check email and password
- Try generating new app password
- Verify 2FA settings

### 4. No emails being sent
- Check backend logs for errors
- Verify `.env` file exists and is loaded
- Test with the test endpoint

## Testing Commands

### Test Email Configuration
```bash
curl -X POST http://localhost:3000/parcels/test-email
```

### Test Driver Assignment
1. Go to Admin Dashboard → Approved Deliveries
2. Assign a driver to a delivery
3. Check backend logs for email notification

### Test Status Update
1. Go to Driver Dashboard → My Deliveries
2. Update delivery status
3. Check backend logs for email notification

## Next Steps

1. **Set up email configuration** in `.env` file
2. **Test email functionality** with test endpoint
3. **Check backend logs** for email notifications
4. **Verify recipient emails** are correct in database
5. **Test driver assignment** and status updates

## Fallback Solution

If email setup is complex, you can:
1. Use a free email service like Mailtrap for testing
2. Implement email logging to file instead of sending
3. Use a different email provider (Outlook, Yahoo, etc.) 