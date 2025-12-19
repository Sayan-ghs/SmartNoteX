# Upstash Redis Setup Guide

## Overview

SmartNoteX uses **Upstash Redis** as the message broker for Celery background tasks and for caching. Upstash provides a serverless Redis solution that's perfect for production deployments.

## Why Upstash Redis?

1. **Serverless**: No infrastructure management needed
2. **Global**: Low-latency access from anywhere
3. **Scalable**: Automatically scales with your workload
4. **Free Tier**: Generous free tier for development
5. **Durable**: Built-in persistence and backups

## Setup Instructions

### 1. Create Upstash Redis Database

1. Go to [Upstash Console](https://console.upstash.com/)
2. Sign up or log in
3. Click **"Create Database"**
4. Choose:
   - **Region**: Select closest to your server
   - **Type**: Redis (or Redis with REST API)
   - **Name**: `smartnotex-redis` (or your preferred name)
5. Click **"Create"**

### 2. Get Your Redis URL

After creating the database:

1. Click on your database name
2. Go to the **"Details"** tab
3. Copy the **"Redis URL"** or **"Endpoint"**

The URL format will be:
```
redis://default:[PASSWORD]@[ENDPOINT]:[PORT]
```

Or with SSL:
```
rediss://default:[PASSWORD]@[ENDPOINT]:[PORT]
```

### 3. Configure Environment Variable

Update your `.env` file:

```env
REDIS_URL=redis://default:your-password@your-endpoint.upstash.io:6379
```

Or with SSL (recommended for production):
```env
REDIS_URL=rediss://default:your-password@your-endpoint.upstash.io:6379
```

**Important**: Replace:
- `your-password` with your actual Upstash Redis password
- `your-endpoint.upstash.io` with your actual endpoint
- `6379` with your actual port (usually 6379)

### 4. Test Connection

You can test the connection with Python:

```python
import redis

# Use your Upstash Redis URL
r = redis.from_url("redis://default:your-password@your-endpoint.upstash.io:6379")

# Test connection
r.ping()  # Should return True
print("✓ Connected to Upstash Redis!")
```

## URL Formats

### Standard Redis URL
```
redis://default:[PASSWORD]@[ENDPOINT]:[PORT]
```

### SSL/TLS Redis URL (Recommended)
```
rediss://default:[PASSWORD]@[ENDPOINT]:[PORT]
```

### Example URLs
```
# Standard
redis://default:AbCdEf123456@usw1-xxx-xxx.upstash.io:6379

# SSL
rediss://default:AbCdEf123456@usw1-xxx-xxx.upstash.io:6379
```

## Using with Celery

Celery will automatically use the `REDIS_URL` from your environment:

```python
# In your Celery configuration
from app.config import settings

celery_app = Celery(
    'smartnotex',
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)
```

## Free Tier Limits

Upstash Free Tier includes:
- **10,000 commands/day**
- **256 MB storage**
- **Global replication**

For production, consider upgrading to a paid plan for:
- Higher command limits
- More storage
- Better performance
- SLA guarantees

## Security Best Practices

1. **Use SSL**: Always use `rediss://` (SSL) in production
2. **Rotate Passwords**: Regularly update your Redis password
3. **Restrict Access**: Use Upstash's IP whitelist feature
4. **Environment Variables**: Never commit Redis URLs to version control

## Troubleshooting

### Connection Timeout
- Check if your server's IP is whitelisted in Upstash
- Verify the endpoint URL is correct
- Ensure firewall allows outbound connections on Redis port

### Authentication Failed
- Verify the password is correct
- Check if password has special characters (may need URL encoding)
- Ensure you're using the correct database

### SSL Certificate Error
- Use `rediss://` for SSL connections
- Verify Upstash SSL certificate is valid
- Check system time is correct (SSL validation requires accurate time)

## Migration from Local Redis

If you're migrating from local Redis:

1. **Export data** (if needed):
   ```bash
   redis-cli --rdb dump.rdb
   ```

2. **Update `.env`** with Upstash URL

3. **Restart Celery workers**:
   ```bash
   celery -A app.celery_app worker --loglevel=info
   ```

4. **Test background tasks** to ensure they work

## Monitoring

Upstash provides built-in monitoring:

1. Go to your database in Upstash Console
2. View **Metrics** tab for:
   - Command count
   - Memory usage
   - Latency
   - Error rates

## Support

- **Upstash Docs**: https://docs.upstash.com/redis
- **Upstash Console**: https://console.upstash.com/
- **Support**: support@upstash.com

