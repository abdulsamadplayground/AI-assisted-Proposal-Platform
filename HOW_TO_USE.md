# 🎯 HOW TO USE YOUR APP

## Your App is Live! Here's How to Use It

---

## 🌐 Access Your Application

**Open this URL in your browser:**
```
https://frontend-psi-swart-m9fuy6vv91.vercel.app
```

---

## 👤 Login Credentials

### Admin Account (Full Access)
- **Email:** `admin@example.com`
- **Password:** `admin123`
- **Access:** Everything (users, schemas, proposals, settings)

### Regular User Account
- **Email:** `user@example.com`
- **Password:** `user123`
- **Access:** Create and view own proposals

---

## 📱 What You Can Do

### As Admin:

1. **Dashboard** (`/admin/dashboard`)
   - View all proposals
   - See system statistics
   - Monitor user activity

2. **Manage Schemas** (`/admin/schemas`)
   - Create new proposal schemas
   - Edit existing schemas
   - Define required fields
   - Set validation rules

3. **Review Proposals** (`/admin/proposals`)
   - View all submitted proposals
   - Approve or reject proposals
   - Provide feedback
   - Track proposal status

4. **Manage Users** (`/admin/users`)
   - View all users
   - See user activity
   - Manage permissions

### As User:

1. **Dashboard** (`/user/dashboard`)
   - View your proposals
   - See proposal status
   - Quick actions

2. **Create Proposal** (`/user/proposals/create`)
   - Fill out proposal form
   - Use AI assistance
   - Submit for review

3. **View Proposals** (`/user/proposals`)
   - See all your proposals
   - Check status
   - View feedback

---

## 🤖 AI Features

The platform includes AI-powered features:
- **Smart Suggestions:** AI helps fill out proposals
- **Validation:** AI checks proposal quality
- **Feedback:** AI provides improvement suggestions

---

## 🔄 How It Works

```
1. User logs in
   ↓
2. User creates proposal
   ↓
3. AI assists with content
   ↓
4. User submits proposal
   ↓
5. Admin reviews proposal
   ↓
6. Admin approves/rejects
   ↓
7. User receives feedback
```

---

## 🛠️ Backend API (For Developers)

Your backend API is running at:
```
https://aai-proposal-production.up.railway.app
```

### API Endpoints:

**Authentication:**
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Get current user

**Proposals:**
- `GET /api/proposals` - List proposals
- `POST /api/proposals` - Create proposal
- `GET /api/proposals/:id` - Get proposal
- `PUT /api/proposals/:id` - Update proposal
- `DELETE /api/proposals/:id` - Delete proposal

**Schemas:**
- `GET /api/schemas` - List schemas
- `POST /api/schemas` - Create schema
- `GET /api/schemas/:id` - Get schema
- `PUT /api/schemas/:id` - Update schema

**Users:**
- `GET /api/users` - List users (admin only)
- `GET /api/users/:id` - Get user
- `PUT /api/users/:id` - Update user

**Health Check:**
- `GET /health` - Check backend health
- `GET /api/status` - Check database status

---

## 📊 Monitoring

### Check Backend Health
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

### Check Database Connection
```powershell
curl https://aai-proposal-production.up.railway.app/api/status
```

Should return:
```json
{
  "status": "configured",
  "message": "Database is configured"
}
```

---

## 🔐 Security Notes

1. **Change Default Passwords!**
   - Login as admin
   - Go to user management
   - Change admin password
   - Change user password

2. **JWT Secret**
   - Currently using default secret
   - Change in Railway environment variables
   - Use a strong random string

3. **HTTPS**
   - All services use HTTPS ✅
   - Secure by default ✅

---

## 📱 Mobile Access

The app is responsive and works on:
- ✅ Desktop browsers
- ✅ Tablets
- ✅ Mobile phones

Just open the URL on any device!

---

## 🎨 Customization

### Change Branding
Edit: `packages/frontend/src/app/layout.tsx`

### Modify Schemas
Login as admin → Schemas → Create/Edit

### Add Features
- Frontend: `packages/frontend/src/`
- Backend: `packages/backend/src/`
- AI Service: `packages/ai-service/`

---

## 🐛 Troubleshooting

### Can't Login?
1. Check backend is running: `curl https://aai-proposal-production.up.railway.app/health`
2. Check browser console (F12) for errors
3. Try clearing browser cache

### Proposal Not Submitting?
1. Check all required fields are filled
2. Check browser console for errors
3. Verify backend connection

### AI Not Working?
1. Check AI service: `curl https://ai-proposal-ai-service.vercel.app/health`
2. Check backend logs in Railway
3. Verify AI_SERVICE_URL in backend env vars

---

## 📞 Support

### View Logs

**Frontend Logs:**
```
https://vercel.com/abdul-samads-projects-818a9123/frontend
```

**Backend Logs:**
```powershell
cd packages/backend
railway logs
```

**Database:**
```
https://console.neon.tech
```

---

## 🎉 You're All Set!

Your AI Proposal Platform is:
- ✅ Deployed
- ✅ Connected
- ✅ Working
- ✅ Ready to use

**Start using it now at:**
```
https://frontend-psi-swart-m9fuy6vv91.vercel.app
```

**Login with:** `admin@example.com` / `admin123`

Enjoy! 🚀
