# Registration Token Expiry - Complete Guide

## Current Status ✅

**Your registration links are NOT expiring in 1 minute.** They are set to expire in **24 hours**.

### Investigation Results:
- ✅ Registration token system is working correctly
- ✅ Current token validity: **24 hours** (not 1 minute)
- ✅ Token validation endpoint working: `/api/registration/validate`
- ✅ Found 1 active token for Niranjan Mulam (expires in ~24 hours)

## Token Expiration Options

### Current Configuration (24 hours):
```typescript
// In src/utils/registrationToken.ts
export const createTokenExpiry = (hours = 24): Date => {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hours);
  return expiry;
};
```

### Available Options:
1. **24 hours** (default) - Good for most use cases
2. **1 hour** - For higher security
3. **5 minutes** - For very high security
4. **72 hours** - For extended access

## How to Change Token Expiry Time

### Option 1: Change Default Duration
```typescript
// Change the default parameter in createTokenExpiry
export const createTokenExpiry = (hours = 1): Date => { // 1 hour instead of 24
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hours);
  return expiry;
};
```

### Option 2: Use Alternative Functions
```typescript
// In employee.controller.ts, import and use:
import { createTokenExpiryShort, createTokenExpiryVeryShort } from "../../utils/registrationToken";

// For 1 hour expiry:
const expiresAt = createTokenExpiryShort();

// For 5 minutes expiry:
const expiresAt = createTokenExpiryVeryShort();
```

### Option 3: Environment Variable Configuration
```typescript
// Create configurable expiry:
export const createTokenExpiry = (): Date => {
  const hours = parseInt(process.env.REGISTRATION_TOKEN_HOURS) || 24;
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hours);
  return expiry;
};
```

Add to `.env`:
```
REGISTRATION_TOKEN_HOURS=1
```

## Current Token Status

### Active Token:
- **Employee**: Niranjan Mulam (niranjan.mulam@asaind.co.in)
- **Token**: 6b400600fd82bdf5... (valid)
- **Created**: March 13, 2026, 12:18:54 PM
- **Expires**: March 14, 2026, 12:18:54 PM
- **Status**: VALID (23+ hours remaining)

## Testing Registration Tokens

### Test Current Token:
```bash
node test-registration-token.js
```

### Check All Tokens:
```bash
node check-registration-tokens.js
```

### Token Validation Endpoint:
```bash
GET http://localhost:5003/api/registration/validate?token=TOKEN_HERE
```

## Common Issues & Solutions

### Issue: "Registration link invalid or expired"
**Possible Causes:**
1. Token actually expired (check creation time)
2. Token already used
3. Token doesn't exist in database
4. Wrong token being used

**Solution:**
```bash
node check-registration-tokens.js
```

### Issue: Token expires too quickly
**Solution:**
1. Check server time zone
2. Verify token creation time
3. Adjust expiry duration as shown above

### Issue: Need to extend existing token
**Solution:**
```javascript
// Extend token by 24 hours
await prisma.registrationToken.update({
  where: { token: "EXISTING_TOKEN" },
  data: { 
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  }
});
```

## Security Considerations

### Shorter Expiry (Recommended for Production):
- **1 hour**: Good balance of security and usability
- **5 minutes**: Maximum security, may frustrate users

### Longer Expiry (Use with Caution):
- **72 hours**: Convenient but less secure
- **24 hours**: Current setting, reasonable for most cases

## Frontend Integration

### Check Token Validity:
```typescript
// Before showing registration form
const response = await fetch(`/api/registration/validate?token=${token}`);
if (response.ok) {
  // Show registration form
} else {
  // Show "link expired" message
}
```

### Handle Expired Links:
```typescript
if (response.status === 400) {
  const error = await response.json();
  if (error.error.includes('expired')) {
    // Show "request new link" option
  }
}
```

## Recommendation

For most business applications, **1 hour** is a good balance:
- ✅ Secure enough to prevent abuse
- ✅ Long enough for users to complete registration
- ✅ Reduces risk of token sharing

To implement:
```typescript
// Change default in createTokenExpiry
export const createTokenExpiry = (hours = 1): Date => {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hours);
  return expiry;
};
```

## Summary

Your registration system is working correctly with **24-hour** token validity. If you want to change this to **1 minute** (as mentioned in your question), you would need to modify the `createTokenExpiry` function, but this would likely be too short for practical use.

**Current Status**: ✅ Working (24 hours)  
**Recommended Change**: 1 hour for better security  
**1 Minute**: Not recommended (too short for users)
