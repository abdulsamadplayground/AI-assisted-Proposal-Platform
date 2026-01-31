# 🧪 Test Your Login

## The Issue You Saw

You saw this error:
```
localhost:3001/api/auth/login:1 Failed to load resource: net::ERR_CONNECTION_REFUSED
```

This means the frontend was trying to connect to `localhost:3001` instead of the Railway backend.

## What I Fixed

1. **Removed old environment variable** from Vercel
2. **Added new environment variable** with correct Railway URL:
   ```
   NEXT_PUBLIC_API_URL=https://aai-proposal-production.up.railway.app
   ```
3. **Redeployed frontend** to pick up the new variable

## Test Now

1. **Clear your browser cache:**
   - Press `Ctrl + Shift + Delete`
   - Or press `Ctrl + Shift + R` to hard refresh
   - Or open in **Incognito/Private mode**

2. **Open the app:**
   ```
   https://frontend-psi-swart-m9fuy6vv91.vercel.app
   ```

3. **Open browser console (F12)**
   - Go to "Network" tab
   - Try to login

4. **Check the API calls:**
   - You should see calls to `https://aai-proposal-production.up.railway.app`
   - NOT to `localhost:3001`

5. **Login with:**
   - Email: `admin@example.com`
   - Password: `admin123`

## If Still Seeing localhost:3001

This means your browser cached the old JavaScript. Try:

### Option 1: Hard Refresh
```
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

### Option 2: Clear Cache
1. Press `F12` to open DevTools
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Option 3: Incognito Mode
1. Press `Ctrl + Shift + N` (Chrome)
2. Open: `https://frontend-psi-swart-m9fuy6vv91.vercel.app`
3. Try login

### Option 4: Wait 5 Minutes
Vercel CDN might be caching the old version. Wait a few minutes and try again.

## Verify Backend is Working

Test the backend directly:
```powershell
curl https://aai-proposal-production.up.railway.app/health
```

Should return:
```json
{
  "status": "healthy",
  "database": "postgresql"
}
```

## Debug in Browser Console

1. Open browser console (F12)
2. Go to "Console" tab
3. Type this and press Enter:
   ```javascript
   console.log(process.env.NEXT_PUBLIC_API_URL)
   ```
4. Should show: `https://aai-proposal-production.up.railway.app`

If it shows `undefined` or `http://localhost:3001`, the cache needs to be cleared.

## Still Not Working?

If you're still seeing `localhost:3001` after clearing cache:

1. **Check Vercel deployment logs:**
   ```
   https://vercel.com/abdul-samads-projects-818a9123/frontend
   ```

2. **Verify environment variable in Vercel:**
   ```
   https://vercel.com/abdul-samads-projects-818a9123/frontend/settings/environment-variables
   ```
   Should see: `NEXT_PUBLIC_API_URL` = `https://aai-proposal-production.up.railway.app`

3. **Redeploy manually:**
   ```powershell
   cd packages/frontend
   vercel --prod --force
   ```

## Expected Behavior

After clearing cache, you should see:
- ✅ Login form loads
- ✅ Network tab shows calls to Railway backend
- ✅ Login works successfully
- ✅ No `localhost:3001` errors

## The Fix is Deployed

The environment variable is now set correctly in Vercel. You just need to clear your browser cache to see the changes!

**Try opening in Incognito mode first - that's the quickest way to test!**
