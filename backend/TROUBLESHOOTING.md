# Troubleshooting Guide

## Issues Fixed

### 1. Parcel Delete 404 Error ✅

**Problem**: Admin couldn't delete parcels due to 404 error.

**Root Cause**: Frontend was calling `/soft-delete` endpoint but backend only had `/hard-delete`.

**Solution**: 
- Fixed frontend to call `/hard-delete` endpoint
- Added `softDeleteParcel()` method for soft deletes if needed

**Files Changed**:
- `Frontend/src/app/services/parcel.service.ts` - Fixed delete endpoint

### 2. Wrong Credentials After Parcel Creation ✅

**Problem**: Users couldn't login after being created through parcel creation.

**Root Cause**: Users created during parcel creation need email verification before they can login.

**Solutions**:

#### Option A: Create Pre-verified Test Users
```bash
POST /auth/create-test-user
{
  "name": "Test User",
  "email": "test@example.com", 
  "password": "password123",
  "role": "USER"
}
```

#### Option B: Verify Existing Users
```bash
POST /auth/verify-user
{
  "email": "user@example.com"
}
```

#### Option C: Use Email Verification
1. Register normally
2. Check console for verification code
3. Use verification code to verify email

## Testing the Fixes

### Test Parcel Deletion
1. Go to Admin Dashboard → Parcels
2. Try to delete a parcel
3. Should work without 404 error

### Test User Login
1. Create a test user using the endpoint above
2. Try to login with the credentials
3. Should work without "wrong credentials" error

## Email Verification Codes

When users register normally, verification codes are logged to console:
```
Verification code for user@example.com: 123456
```

Use these codes to verify users via the normal verification process.

## API Endpoints

### Delete Parcels
- `DELETE /parcels/{id}/hard-delete` - Permanently delete parcel
- `PATCH /parcels/{id}/soft-delete` - Soft delete parcel

### User Management
- `POST /auth/create-test-user` - Create pre-verified test user
- `POST /auth/verify-user` - Verify existing user without email
- `POST /auth/verify-code` - Verify user with email code

## Common Issues

1. **404 on Delete**: Make sure you're using the correct endpoint
2. **Wrong Credentials**: Ensure user is verified or use test user creation
3. **Email Not Working**: Check SMTP configuration in `.env` file
4. **Token Issues**: Clear localStorage and login again

## Debugging

Check console logs for:
- User creation details
- Login attempts
- Verification codes
- Email sending status 