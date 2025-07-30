# Authentication Troubleshooting Guide

## Current Issues

### 1. 403 Forbidden Error on Login
**Problem**: Getting 403 Forbidden when trying to login.

**Possible Causes**:
- User not verified (needs email verification)
- Wrong password
- User doesn't exist
- Driver account deactivated

### 2. "Email Already Exists" on Registration
**Problem**: Getting "email already exists" when trying to register.

**Possible Causes**:
- User already exists in database
- Email verification pending
- Database constraint issues

## Quick Fixes

### Option 1: Create Test User (Recommended)
Use this endpoint to create a pre-verified user:

```bash
POST /auth/create-simple-user
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "role": "USER"
}
```

### Option 2: Verify Existing User
If user exists but isn't verified:

```bash
POST /auth/verify-user
{
  "email": "user@example.com"
}
```

### Option 3: Test Registration Endpoint
Test if registration data is being received:

```bash
POST /auth/test-registration
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

## Debugging Steps

### 1. Check Backend Logs
Look for these console messages:
- `🔐 Login attempt for email:`
- `🔐 Registration attempt for:`
- `✅ User/Driver found:`
- `❌ No user or driver found with email:`
- `❌ User not verified and not admin/driver:`
- `❌ Invalid password for user:`

### 2. Check Database
Verify if users exist in the database:
```sql
SELECT id, name, email, role, "isVerified" FROM "User";
```

### 3. Test Login with Known Credentials
Try logging in with a user you know exists.

## Common Solutions

### For 403 Login Error:

1. **User Not Verified**:
   - Use `/auth/verify-user` endpoint
   - Or create new user with `/auth/create-simple-user`

2. **Wrong Password**:
   - Reset password or create new user
   - Check password requirements (min 5 chars, letters + numbers)

3. **User Doesn't Exist**:
   - Create new user with `/auth/create-simple-user`
   - Or register normally and verify email

### For "Email Already Exists":

1. **User Already Verified**:
   - Try logging in directly
   - Use existing credentials

2. **User Not Verified**:
   - Use `/auth/verify-user` endpoint
   - Or create new user with different email

3. **Database Issue**:
   - Check database for duplicate entries
   - Clear database if needed for testing

## Testing Endpoints

### Create Test User
```bash
curl -X POST http://localhost:3000/auth/create-simple-user \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "USER"
  }'
```

### Login with Test User
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Verify User
```bash
curl -X POST http://localhost:3000/auth/verify-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

## Password Requirements

- Minimum 5 characters
- Must contain both letters and numbers
- Can include: @$!%*?&

## Role Types

- `USER` - Regular user
- `ADMIN` - Administrator
- `DRIVER` - Delivery driver

## Email Verification

- Regular users need email verification
- Admins and drivers can login without verification
- Verification codes are logged to console during development

## Frontend Testing

1. **Clear localStorage**:
   ```javascript
   localStorage.clear();
   ```

2. **Test with simple user**:
   - Create user with `/auth/create-simple-user`
   - Try login with those credentials

3. **Check network tab**:
   - Look for 403/400 errors
   - Check request/response data

## Database Reset (Development Only)

If you need to start fresh:

```sql
DELETE FROM "User" WHERE email LIKE '%test%';
DELETE FROM "Driver" WHERE email LIKE '%test%';
```

## Next Steps

1. Try creating a test user with the endpoint above
2. Try logging in with those credentials
3. Check console logs for detailed error messages
4. If still having issues, check database state 