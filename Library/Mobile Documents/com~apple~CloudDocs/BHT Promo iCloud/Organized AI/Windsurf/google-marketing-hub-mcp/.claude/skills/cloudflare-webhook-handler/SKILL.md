# Cloudflare Webhook Handler & Workers Orchestration Skill

Comprehensive patterns for building, deploying, and orchestrating Cloudflare Workers for edge webhook processing.

## Trigger Phrases
- "deploy to cloudflare", "setup cloudflare worker", "wrangler setup"
- "create webhook handler", "cloudflare webhook", "edge function"
- "deploy worker", "cloudflare orchestration"

---

## 1. CLI Tool Installation & Setup

### Install Wrangler CLI
```bash
# Install globally (recommended)
npm install -g wrangler

# Or as project dependency
npm install --save-dev wrangler

# Verify installation
wrangler --version
```

### Authentication
```bash
# Interactive login (opens browser)
wrangler login

# Check auth status
wrangler whoami

# Logout if needed
wrangler logout
```

### API Token Setup (CI/CD)
```bash
# Set token for non-interactive environments
export CLOUDFLARE_API_TOKEN="your-api-token"

# Or use wrangler config
wrangler config
```

---

## 2. Project Scaffolding

### Initialize New Worker
```bash
# Interactive setup
wrangler init my-webhook-handler

# Quick setup with defaults
wrangler init my-webhook-handler --yes

# From template
wrangler init my-webhook-handler --template https://github.com/cloudflare/worker-template
```

### Recommended Directory Structure
```
my-webhook-handler/
├── src/
│   ├── index.js          # Main entry point
│   ├── handlers/
│   │   ├── contacts.js   # Contact event handlers
│   │   ├── payments.js   # Payment event handlers
│   │   └── appointments.js
│   ├── utils/
│   │   ├── validation.js # Signature verification
│   │   ├── formatting.js # Data transformers
│   │   └── errors.js     # Custom error classes
│   └── config.js         # Environment config
├── test/
│   └── handler.test.js
├── wrangler.toml         # Wrangler configuration
├── package.json
└── .dev.vars             # Local dev secrets (gitignored)
```

### package.json Setup
```json
{
  "name": "my-webhook-handler",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "deploy:staging": "wrangler deploy --env staging",
    "deploy:production": "wrangler deploy --env production",
    "tail": "wrangler tail",
    "test": "vitest",
    "types": "wrangler types"
  },
  "devDependencies": {
    "wrangler": "^3.0.0",
    "vitest": "^1.0.0",
    "@cloudflare/workers-types": "^4.0.0"
  }
}
```

---

## 3. Wrangler Configuration

### Basic wrangler.toml
```toml
name = "my-webhook-handler"
main = "src/index.js"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

# Account settings (optional - can use CLOUDFLARE_ACCOUNT_ID env var)
# account_id = "your-account-id"

[vars]
ENVIRONMENT = "development"
API_VERSION = "v2"

# KV Namespaces
[[kv_namespaces]]
binding = "IDEMPOTENCY_KV"
id = "your-kv-id"
preview_id = "your-preview-kv-id"

# Durable Objects
[[durable_objects.bindings]]
name = "RATE_LIMITER"
class_name = "RateLimiter"

[[migrations]]
tag = "v1"
new_classes = ["RateLimiter"]

# Queues
[[queues.producers]]
queue = "webhook-events"
binding = "EVENT_QUEUE"

[[queues.consumers]]
queue = "webhook-events"
max_batch_size = 10
max_batch_timeout = 30

# R2 Storage
[[r2_buckets]]
binding = "LOGS_BUCKET"
bucket_name = "webhook-logs"

# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "webhook-db"
database_id = "your-d1-id"
```

### Multi-Environment Configuration
```toml
name = "my-webhook-handler"
main = "src/index.js"
compatibility_date = "2024-01-01"

[vars]
ENVIRONMENT = "development"

# Staging environment
[env.staging]
name = "my-webhook-handler-staging"
vars = { ENVIRONMENT = "staging" }

[[env.staging.kv_namespaces]]
binding = "IDEMPOTENCY_KV"
id = "staging-kv-id"

# Production environment
[env.production]
name = "my-webhook-handler-production"
vars = { ENVIRONMENT = "production" }
routes = [
  { pattern = "webhooks.example.com/*", zone_name = "example.com" }
]

[[env.production.kv_namespaces]]
binding = "IDEMPOTENCY_KV"
id = "production-kv-id"
```

### Local Development Secrets (.dev.vars)
```bash
# .dev.vars (add to .gitignore!)
GHL_API_KEY=your-dev-api-key
TW_API_KEY=your-dev-tw-key
WEBHOOK_SECRET=local-test-secret
```

---

## 4. Core Webhook Handler Pattern

### Main Entry Point (src/index.js)
```javascript
import { handleContact } from './handlers/contacts';
import { handlePayment } from './handlers/payments';
import { handleAppointment } from './handlers/appointments';
import { verifySignature, checkIdempotency } from './utils/validation';
import { TransientError, PermanentError } from './utils/errors';

export default {
  async fetch(request, env, ctx) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    // Method check
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Health check endpoint
    const url = new URL(request.url);
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'healthy', timestamp: Date.now() }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      // Clone request for signature verification (body can only be read once)
      const bodyText = await request.text();

      // Verify webhook signature
      if (env.WEBHOOK_SECRET) {
        const isValid = await verifySignature(request, bodyText, env.WEBHOOK_SECRET);
        if (!isValid) {
          console.error('Invalid webhook signature');
          return new Response('Unauthorized', { status: 401 });
        }
      }

      const payload = JSON.parse(bodyText);
      const eventType = payload.type || payload.event || payload.eventType;
      const eventId = payload.id || payload.eventId || crypto.randomUUID();

      // Idempotency check
      const isDuplicate = await checkIdempotency(eventId, env);
      if (isDuplicate) {
        console.log(`Duplicate event: ${eventId}`);
        return new Response(JSON.stringify({ status: 'duplicate', eventId }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Route by event type
      let result;
      switch (eventType) {
        case 'ContactCreate':
        case 'ContactUpdate':
        case 'contact.created':
          result = await handleContact(payload, env, ctx);
          break;
        case 'AppointmentCreate':
        case 'appointment.scheduled':
          result = await handleAppointment(payload, env, ctx);
          break;
        case 'PaymentReceived':
        case 'payment.completed':
          result = await handlePayment(payload, env, ctx);
          break;
        default:
          console.log(`Unhandled event type: ${eventType}`);
          result = { status: 'ignored', eventType };
      }

      return new Response(JSON.stringify({ status: 'success', eventId, result }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Webhook error:', error.message, error.stack);

      // Transient errors - return 500 to trigger retry
      if (error instanceof TransientError || error.retryable) {
        return new Response(JSON.stringify({
          status: 'error',
          message: error.message,
          retryable: true
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Permanent errors - return 200 to prevent infinite retries
      return new Response(JSON.stringify({
        status: 'error',
        message: error.message,
        retryable: false
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },

  // Queue consumer handler
  async queue(batch, env) {
    for (const message of batch.messages) {
      try {
        const { type, payload } = message.body;
        console.log(`Processing queued event: ${type}`);

        // Process async tasks here
        await processQueuedEvent(type, payload, env);

        message.ack();
      } catch (error) {
        console.error('Queue processing error:', error);
        message.retry();
      }
    }
  },

  // Scheduled handler (cron)
  async scheduled(event, env, ctx) {
    console.log(`Cron triggered: ${event.cron}`);
    // Handle scheduled tasks
  }
};

function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-GHL-Signature',
      'Access-Control-Max-Age': '86400'
    }
  });
}
```

---

## 5. Utility Functions

### Validation (src/utils/validation.js)
```javascript
export async function verifySignature(request, body, secret) {
  const signature = request.headers.get('X-GHL-Signature')
    || request.headers.get('X-Webhook-Signature')
    || request.headers.get('X-Hub-Signature-256');

  if (!signature) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signed = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const expected = 'sha256=' + Array.from(new Uint8Array(signed))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return signature === expected;
}

export async function checkIdempotency(key, env) {
  if (!env.IDEMPOTENCY_KV) return false;

  const existing = await env.IDEMPOTENCY_KV.get(key);
  if (existing) return true;

  await env.IDEMPOTENCY_KV.put(key, JSON.stringify({
    processedAt: new Date().toISOString()
  }), { expirationTtl: 86400 }); // 24 hours

  return false;
}

export function validatePayload(payload, requiredFields) {
  const missing = requiredFields.filter(field => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], payload);
    return value === undefined || value === null;
  });

  if (missing.length > 0) {
    throw new PermanentError(`Missing required fields: ${missing.join(', ')}`);
  }

  return true;
}
```

### Formatting (src/utils/formatting.js)
```javascript
export function formatE164(phone, defaultCountry = 'US') {
  if (!phone) return null;

  const digits = phone.replace(/\D/g, '');

  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  if (digits.startsWith('+')) {
    return phone;
  }
  return `+${digits}`;
}

export function normalizeEmail(email) {
  if (!email) return null;
  return email.toLowerCase().trim();
}

export function extractUTMParams(url) {
  try {
    const parsed = new URL(url);
    return {
      utm_source: parsed.searchParams.get('utm_source'),
      utm_medium: parsed.searchParams.get('utm_medium'),
      utm_campaign: parsed.searchParams.get('utm_campaign'),
      utm_content: parsed.searchParams.get('utm_content'),
      utm_term: parsed.searchParams.get('utm_term'),
      gclid: parsed.searchParams.get('gclid'),
      fbclid: parsed.searchParams.get('fbclid')
    };
  } catch {
    return {};
  }
}

export function sanitizeForAPI(obj) {
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    if (value === undefined || value === '') return undefined;
    return value;
  }));
}
```

### Error Classes (src/utils/errors.js)
```javascript
export class TransientError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'TransientError';
    this.retryable = true;
    this.cause = cause;
  }
}

export class PermanentError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'PermanentError';
    this.retryable = false;
    this.cause = cause;
  }
}

export class RateLimitError extends TransientError {
  constructor(retryAfter = 60) {
    super(`Rate limited. Retry after ${retryAfter}s`);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class ValidationError extends PermanentError {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}
```

---

## 6. Handler Examples

### Contact Handler (src/handlers/contacts.js)
```javascript
import { formatE164, normalizeEmail } from '../utils/formatting';
import { TransientError, PermanentError } from '../utils/errors';

export async function handleContact(payload, env, ctx) {
  const contact = payload.contact || payload.data || payload;

  const normalized = {
    id: contact.id,
    email: normalizeEmail(contact.email),
    phone: formatE164(contact.phone),
    firstName: contact.firstName || contact.first_name,
    lastName: contact.lastName || contact.last_name,
    source: contact.source || 'webhook',
    tags: contact.tags || [],
    customFields: contact.customFields || contact.custom_fields || {}
  };

  // Forward to external API
  if (env.EXTERNAL_API_URL) {
    const response = await fetch(`${env.EXTERNAL_API_URL}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.EXTERNAL_API_KEY}`
      },
      body: JSON.stringify(normalized)
    });

    if (!response.ok) {
      if (response.status >= 500) {
        throw new TransientError(`External API error: ${response.status}`);
      }
      throw new PermanentError(`External API rejected: ${response.status}`);
    }

    return await response.json();
  }

  // Queue for async processing
  if (env.EVENT_QUEUE) {
    await env.EVENT_QUEUE.send({
      type: 'contact.process',
      payload: normalized,
      timestamp: Date.now()
    });
  }

  return { processed: true, contactId: normalized.id };
}
```

### Payment Handler (src/handlers/payments.js)
```javascript
import { TransientError } from '../utils/errors';

export async function handlePayment(payload, env, ctx) {
  const payment = payload.payment || payload.data || payload;

  const orderData = {
    orderId: payment.id || payment.transactionId,
    email: payment.email || payment.customer?.email,
    phone: payment.phone || payment.customer?.phone,
    amount: parseFloat(payment.amount || payment.total),
    currency: payment.currency || 'USD',
    items: payment.items || payment.lineItems || [],
    source: payment.source || 'webhook',
    metadata: {
      gclid: payment.gclid,
      fbclid: payment.fbclid,
      utm_source: payment.utm_source
    }
  };

  // Send to Triple Whale
  if (env.TW_API_KEY) {
    const twResponse = await fetch('https://api.triplewhale.com/api/v2/attribution/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.TW_API_KEY
      },
      body: JSON.stringify({
        orders: [orderData]
      })
    });

    if (!twResponse.ok) {
      const error = await twResponse.text();
      if (twResponse.status >= 500) {
        throw new TransientError(`Triple Whale API error: ${error}`);
      }
      console.error('Triple Whale rejected order:', error);
    }
  }

  // Log to R2
  if (env.LOGS_BUCKET) {
    const logKey = `payments/${new Date().toISOString().split('T')[0]}/${orderData.orderId}.json`;
    ctx.waitUntil(
      env.LOGS_BUCKET.put(logKey, JSON.stringify(orderData, null, 2))
    );
  }

  return { processed: true, orderId: orderData.orderId };
}
```

---

## 7. Durable Objects (Rate Limiting)

### Rate Limiter Class
```javascript
// Add to src/index.js or separate file
export class RateLimiter {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);
    const key = url.searchParams.get('key');
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const window = parseInt(url.searchParams.get('window') || '60');

    const now = Date.now();
    const windowStart = now - (window * 1000);

    // Get current requests in window
    let requests = await this.state.storage.get('requests') || [];
    requests = requests.filter(t => t > windowStart);

    if (requests.length >= limit) {
      return new Response(JSON.stringify({
        allowed: false,
        remaining: 0,
        resetAt: Math.min(...requests) + (window * 1000)
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    requests.push(now);
    await this.state.storage.put('requests', requests);

    return new Response(JSON.stringify({
      allowed: true,
      remaining: limit - requests.length
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Usage in main handler:
async function checkRateLimit(clientId, env) {
  const id = env.RATE_LIMITER.idFromName(clientId);
  const limiter = env.RATE_LIMITER.get(id);
  const response = await limiter.fetch(`https://rate-limiter/?key=${clientId}&limit=100&window=60`);
  const result = await response.json();
  return result.allowed;
}
```

---

## 8. CLI Commands Reference

### Development
```bash
# Start local dev server
wrangler dev

# Dev with specific environment
wrangler dev --env staging

# Dev with local persistence
wrangler dev --persist

# Dev on specific port
wrangler dev --port 8787

# Test with remote resources
wrangler dev --remote
```

### Deployment
```bash
# Deploy to default environment
wrangler deploy

# Deploy to specific environment
wrangler deploy --env production

# Deploy dry run (see what would change)
wrangler deploy --dry-run

# Deploy with specific config
wrangler deploy --config wrangler.production.toml
```

### Secrets Management
```bash
# Add a secret
wrangler secret put GHL_API_KEY

# Add secret to specific environment
wrangler secret put GHL_API_KEY --env production

# List secrets
wrangler secret list

# Delete a secret
wrangler secret delete GHL_API_KEY

# Bulk secrets from file
cat secrets.json | wrangler secret:bulk
```

### KV Namespace
```bash
# Create KV namespace
wrangler kv:namespace create IDEMPOTENCY_KV

# Create preview namespace
wrangler kv:namespace create IDEMPOTENCY_KV --preview

# List namespaces
wrangler kv:namespace list

# Put a value
wrangler kv:key put --namespace-id=xxx "mykey" "myvalue"

# Get a value
wrangler kv:key get --namespace-id=xxx "mykey"

# Delete a key
wrangler kv:key delete --namespace-id=xxx "mykey"
```

### D1 Database
```bash
# Create database
wrangler d1 create webhook-db

# Execute SQL
wrangler d1 execute webhook-db --command "SELECT * FROM events LIMIT 10"

# Run migrations
wrangler d1 migrations apply webhook-db

# Export database
wrangler d1 export webhook-db --output backup.sql
```

### R2 Storage
```bash
# Create bucket
wrangler r2 bucket create webhook-logs

# List buckets
wrangler r2 bucket list

# Upload file
wrangler r2 object put webhook-logs/test.json --file ./test.json
```

### Queues
```bash
# Create queue
wrangler queues create webhook-events

# List queues
wrangler queues list

# Delete queue
wrangler queues delete webhook-events
```

### Monitoring
```bash
# Stream live logs
wrangler tail

# Tail specific environment
wrangler tail --env production

# Filter logs by status
wrangler tail --status error

# Filter by search string
wrangler tail --search "PaymentReceived"

# JSON output
wrangler tail --format json
```

### Debugging
```bash
# Check worker status
wrangler deployments list

# View deployment details
wrangler deployments view

# Rollback deployment
wrangler rollback

# Generate types from bindings
wrangler types
```

---

## 9. Testing Patterns

### Local Testing with Vitest
```javascript
// test/handler.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import worker from '../src/index';

describe('Webhook Handler', () => {
  const mockEnv = {
    IDEMPOTENCY_KV: {
      get: async () => null,
      put: async () => {}
    },
    WEBHOOK_SECRET: 'test-secret'
  };

  const mockCtx = {
    waitUntil: () => {}
  };

  it('should handle ContactCreate event', async () => {
    const request = new Request('https://worker.dev/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'ContactCreate',
        id: 'evt_123',
        contact: {
          id: 'contact_123',
          email: 'test@example.com',
          phone: '5551234567'
        }
      })
    });

    const response = await worker.fetch(request, mockEnv, mockCtx);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('success');
  });

  it('should reject non-POST requests', async () => {
    const request = new Request('https://worker.dev/webhook', {
      method: 'GET'
    });

    const response = await worker.fetch(request, mockEnv, mockCtx);
    expect(response.status).toBe(405);
  });

  it('should handle duplicate events', async () => {
    const mockEnvWithDupe = {
      ...mockEnv,
      IDEMPOTENCY_KV: {
        get: async () => 'processed',
        put: async () => {}
      }
    };

    const request = new Request('https://worker.dev/webhook', {
      method: 'POST',
      body: JSON.stringify({ type: 'ContactCreate', id: 'evt_123' })
    });

    const response = await worker.fetch(request, mockEnvWithDupe, mockCtx);
    const data = await response.json();

    expect(data.status).toBe('duplicate');
  });
});
```

### Integration Testing
```bash
# Test with curl
curl -X POST https://my-webhook.workers.dev/webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"ContactCreate","contact":{"email":"test@test.com"}}'

# Test with httpie
http POST https://my-webhook.workers.dev/webhook \
  type=ContactCreate \
  contact:='{"email":"test@test.com"}'
```

---

## 10. Multi-Worker Orchestration

### Router Worker Pattern
```javascript
// router-worker/src/index.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Route to appropriate worker
    switch (true) {
      case url.pathname.startsWith('/ghl'):
        return env.GHL_WORKER.fetch(request);
      case url.pathname.startsWith('/stripe'):
        return env.STRIPE_WORKER.fetch(request);
      case url.pathname.startsWith('/shopify'):
        return env.SHOPIFY_WORKER.fetch(request);
      default:
        return new Response('Not found', { status: 404 });
    }
  }
};
```

### Service Bindings (wrangler.toml)
```toml
name = "webhook-router"
main = "src/index.js"
compatibility_date = "2024-01-01"

[[services]]
binding = "GHL_WORKER"
service = "ghl-webhook-handler"

[[services]]
binding = "STRIPE_WORKER"
service = "stripe-webhook-handler"

[[services]]
binding = "SHOPIFY_WORKER"
service = "shopify-webhook-handler"
```

---

## 11. Best Practices Checklist

### Security
- [ ] Verify webhook signatures on all incoming requests
- [ ] Use secrets for API keys (never hardcode)
- [ ] Implement rate limiting for public endpoints
- [ ] Validate and sanitize all input data
- [ ] Use HTTPS for all external API calls

### Reliability
- [ ] Implement idempotency checks
- [ ] Return 200 for permanent failures (prevents infinite retries)
- [ ] Return 5xx for transient failures (allows retry)
- [ ] Use queues for heavy/slow operations
- [ ] Log errors to external service (not just console)

### Performance
- [ ] Keep handler fast (< 50ms for simple operations)
- [ ] Use `ctx.waitUntil()` for non-critical async work
- [ ] Cache frequently accessed data in KV
- [ ] Batch operations when possible
- [ ] Use service bindings instead of HTTP for worker-to-worker

### Observability
- [ ] Log structured JSON for easy parsing
- [ ] Include correlation IDs in all logs
- [ ] Set up alerts for error rates
- [ ] Use `wrangler tail` for live debugging
- [ ] Store event logs in R2 for auditing

---

## Quick Start Checklist

```bash
# 1. Install and login
npm install -g wrangler
wrangler login

# 2. Create project
wrangler init my-webhook-handler
cd my-webhook-handler

# 3. Create KV namespace
wrangler kv:namespace create IDEMPOTENCY_KV
# Copy the id to wrangler.toml

# 4. Add secrets
wrangler secret put WEBHOOK_SECRET
wrangler secret put EXTERNAL_API_KEY

# 5. Develop locally
wrangler dev

# 6. Deploy
wrangler deploy

# 7. Monitor
wrangler tail
```
