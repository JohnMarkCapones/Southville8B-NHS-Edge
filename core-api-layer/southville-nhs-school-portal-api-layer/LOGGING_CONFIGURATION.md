# Logging Configuration Guide

## Problem Fixed

The excessive logging spam you were experiencing was caused by:

1. **Cache hit logging** - Every single request was logging cache hits
2. **Authentication logging** - User existence checks were logging on every request
3. **Role caching logging** - Role cache operations were being logged constantly

## Solution Applied

All excessive logging has been made conditional and will only show when specific debug flags are enabled.

## Environment Variables

Add these to your `.env` file to control logging:

```bash
# Development environment
NODE_ENV=development

# Debug flags (set to 'true' only when you need to debug)
DEBUG_ROLE_CACHE=false
DEBUG_AUTH=false
```

## Logging Levels

### Production (Default)
- **No debug logging** - Only errors and important warnings
- **Clean console output** - No spam
- **Better performance** - No string concatenation for logs

### Development with Debug Flags
```bash
# Enable role cache debugging
DEBUG_ROLE_CACHE=true

# Enable authentication debugging  
DEBUG_AUTH=true
```

### What Each Flag Controls

#### `DEBUG_ROLE_CACHE=true`
Shows:
- `🔍 Cache miss for user {id}, querying database...`
- `⚡ Cache hit for user {id}, role: "{role}"`
- `✅ Cached role "{role}" for user {id}`

#### `DEBUG_AUTH=true`
Shows:
- `🔍 Ensuring user exists in public.users: {id}`
- `📝 User not found, creating new user...`
- `📝 Inserting user data: {data}`
- `✅ User successfully inserted: {user}`
- `📝 User exists, checking if update needed...`
- `🔄 Updating user information...`
- `📝 Updating user data: {data}`
- `✅ User successfully updated: {user}`
- `✅ User is up to date`

## Recommended Settings

### For Development
```bash
NODE_ENV=development
DEBUG_ROLE_CACHE=false  # Only enable when debugging role issues
DEBUG_AUTH=false        # Only enable when debugging auth issues
```

### For Production
```bash
NODE_ENV=production
# Debug flags are ignored in production
```

### For Debugging Authentication Issues
```bash
NODE_ENV=development
DEBUG_AUTH=true
DEBUG_ROLE_CACHE=false
```

### For Debugging Role Cache Issues
```bash
NODE_ENV=development
DEBUG_ROLE_CACHE=true
DEBUG_AUTH=false
```

## Performance Impact

- **Before**: Logging on every request (hundreds of logs per second)
- **After**: No logging unless explicitly enabled
- **Result**: Cleaner console, better performance, easier debugging

## Files Modified

1. `src/auth/guards/roles.guard.ts` - Role cache logging
2. `src/auth/auth.service.ts` - Authentication logging

## Testing the Fix

1. **Restart your development server**
2. **Check console output** - Should be much cleaner
3. **Enable debug flags** when you need to troubleshoot
4. **Disable debug flags** for normal development

## Troubleshooting

If you still see excessive logging:

1. Check your `.env` file for debug flags
2. Restart the development server
3. Verify `NODE_ENV` is set correctly
4. Look for other `console.log` statements in your code

## Benefits

- ✅ **No more log spam**
- ✅ **Better performance**
- ✅ **Cleaner development experience**
- ✅ **Debug logging available when needed**
- ✅ **Production-ready logging levels**
