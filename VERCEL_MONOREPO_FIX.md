# Fix: Next.js Version Warning in Vercel Monorepo

## Problem
```
Warning: Could not identify Next.js version, ensure it is defined as a project dependency.
```

This happens because Vercel is looking at the root `package.json` but Next.js is in `packages/frontend`.

## Solution: Configure Root Directory in Vercel Dashboard

For each service, you need to set the correct root directory:

### Frontend Configuration

1. Go to: https://vercel.com/abdul-samads-projects-818a9123/frontend/settings
2. Navigate to **General** → **Root Directory**
3. Click **Edit**
4. Set to: `packages/frontend`
5. Click **Save**

### Backend Configuration

1. Go to: https://vercel.com/abdul-samads-projects-818a9123/ai-proposal-backend/settings
2. Navigate to **General** → **Root Directory**
3. Click **Edit**
4. Set to: `packages/backend`
5. Click **Save**

### AI Service Configuration

1. Go to: https://vercel.com/abdul-samads-projects-818a9123/ai-proposal-ai-service/settings
2. Navigate to **General** → **Root Directory**
3. Click **Edit**
4. Set to: `packages/ai-service`
5. Click **Save**

## Alternative: Deploy from Subdirectories

Instead of deploying from root, deploy directly from each package directory:

```bash
# Frontend
cd packages/frontend
vercel --prod

# Backend
cd packages/backend
vercel --prod

# AI Service
cd packages/ai-service
vercel --prod
```

This way, Vercel will automatically detect the correct framework and dependencies.

## Verify the Fix

After setting the root directory:

1. Go to the project settings
2. Check **Build & Development Settings**
3. Verify:
   - Framework Preset: Next.js (for frontend)
   - Build Command: `npm run build`
   - Output Directory: `.next` (for frontend)
   - Install Command: `npm install`

## Redeploy

After making changes, redeploy:

```bash
vercel --prod
```

Or trigger a redeploy from the Vercel dashboard:
1. Go to Deployments
2. Click the three dots on the latest deployment
3. Click "Redeploy"

## Expected Result

After the fix, you should see:
```
✓ Detected Next.js version: 14.2.0
✓ Building Next.js application...
```

No more warnings about missing Next.js version!
