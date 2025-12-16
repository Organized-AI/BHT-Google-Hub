# Deploy to Cloudflare Workers

Deploy the Google Marketing Hub MCP Server to Cloudflare Workers.

## Pre-Deployment Checklist
1. Verify wrangler.toml has correct D1 and KV bindings
2. Ensure all secrets are set (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
3. Run TypeScript check: `npx tsc --noEmit`

## Deployment Steps

```bash
# 1. Build and type check
npx tsc --noEmit

# 2. Deploy to Cloudflare
npx wrangler deploy

# 3. Verify deployment
npx wrangler tail --format json | head -5
```

## Post-Deployment Verification
- [ ] Worker responds at /health endpoint
- [ ] SSE connection works at /sse
- [ ] OAuth flow initiates at /oauth/authorize

## Rollback if Needed
```bash
npx wrangler rollback
```

## Environment-Specific Deployment
```bash
# Staging
npx wrangler deploy --env staging

# Production
npx wrangler deploy --env production
```
