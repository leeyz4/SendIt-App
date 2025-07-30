# Password Fix Guide

## Current Issue
User `perus@gmail.com` exists but password `user123` is not working.

## Quick Fix Options

### Option 1: Reset Password (Recommended)
Reset the password for the existing user:

```bash
POST http://localhost:3000/auth/reset-user-password
{
  "email": "perus@gmail.com",
  "newPassword": "user123"
}
```

### Option 2: Create New User
Create a new user with known credentials:

```bash
POST http://localhost:3000/auth/create-simple-user
{
  "name": "Perus Peris",
  "email": "perus2@gmail.com",
  "password": "user123",
  "role": "USER"
}
```

### Option 3: Check User Status
Check if the user exists and their status:

```bash
POST http://localhost:3000/auth/check-user
{
  "email": "perus@gmail.com"
}
```

## Testing Steps

1. **Reset the password** using Option 1 above
2. **Try logging in** with:
   - Email: `perus@gmail.com`
   - Password: `user123`
3. **If that doesn't work**, create a new user with Option 2
4. **Use the new email** to login

## Why This Happened

The password hash in the database doesn't match the password you're entering. This can happen when:
- Password was stored incorrectly during registration
- Password was changed but not properly updated
- Database corruption or migration issues

## Prevention

For future testing, use the `/auth/create-simple-user` endpoint which:
- Creates pre-verified users
- Properly hashes passwords
- Ensures consistent password storage

## Debugging

The logs show:
- User exists and is verified ✅
- Password validation is failing ❌
- Input password: `user123`
- Stored hash: `$2b$10$s0/JluvOAj0kV...`

This confirms the password hash doesn't match the input password. 