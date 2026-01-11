# How to Check Backend-Frontend Connection

## ✅ Quick Status Check

### Method 1: Use the Connection Test Component
I've created a visual connection test component. To access it:

1. **Navigate to the test page** by adding this code temporarily to your App:
   - In browser console, run: `window.location.hash = 'connection-test'`
   - OR modify your code to navigate to 'connection-test' page

2. **What it checks:**
   - ✅ Backend API (http://localhost:8000)
   - ✅ Supabase Database connection
   - Shows detailed error messages if something is wrong

### Method 2: Browser Console Tests

Open DevTools (F12) and run these commands:

```javascript
// Test 1: Check Backend API
fetch('http://localhost:8000/docs')
  .then(res => res.ok ? console.log('✅ Backend connected!') : console.error('❌ Backend error'))
  .catch(() => console.error('❌ Backend not running'));

// Test 2: Check Supabase
import('http://localhost:5174/src/lib/supabase.ts')
  .then(m => m.supabase.auth.getSession())
  .then(() => console.log('✅ Supabase connected!'))
  .catch(err => console.error('❌ Supabase error:', err));

// Test 3: Check Auth Store
localStorage.getItem('auth-storage') 
  ? console.log('✅ Auth data exists') 
  : console.log('⚠️ No auth data (need to login)');
```

### Method 3: Network Tab Check

1. Open DevTools → **Network** tab
2. Navigate to Messages page
3. You should see:
   - ✅ WebSocket connections to Supabase Realtime
   - ✅ API calls to Supabase
   - No CORS errors

### Method 4: Terminal Commands

```powershell
# Check if servers are running
Get-NetTCPConnection -LocalPort 8000,5174 | Select-Object LocalPort, State

# Test backend endpoint
Invoke-WebRequest -Uri "http://localhost:8000/docs" -UseBasicParsing

# Expected: StatusCode 200
```

## 🔍 What to Look For

### Backend Running ✅
- URL: http://localhost:8000/docs
- Should show FastAPI Swagger documentation
- No errors in terminal

### Frontend Running ✅
- URL: http://localhost:5174
- Should load the app
- No console errors

### Supabase Connected ✅
- Check browser console for errors
- Look for "Invalid API key" or "URL" errors
- Verify .env file has correct credentials

## 🐛 Common Issues

### Backend Not Responding
```bash
# Restart backend
cd C:\NoteX\backend
uvicorn app.main:app --reload
```

### CORS Errors
- Check backend `.env` has: `CORS_ORIGINS=http://localhost:5174`
- Restart backend after changing

### Supabase Errors
- Check `frontend/.env` has valid credentials:
  ```
  VITE_SUPABASE_URL=https://[project].supabase.co
  VITE_SUPABASE_ANON_KEY=your-key
  ```

## 🎯 Quick Verification Steps

1. **Backend Status:**
   - Visit: http://localhost:8000/docs
   - Should see API documentation

2. **Frontend Status:**
   - Visit: http://localhost:5174
   - App should load

3. **Integration Test:**
   - Login to the app
   - Navigate to Messages page
   - Try to send a message
   - Check browser console for errors

## 📊 Current Status

Based on the servers I just started:

- ✅ **Backend**: Running on http://localhost:8000
- ✅ **Frontend**: Running on http://localhost:5174
- ⏳ **Database**: Needs Supabase credentials in `.env`

## 🔗 Direct Links

- Frontend: http://localhost:5174
- Backend API Docs: http://localhost:8000/docs
- Backend Health: http://localhost:8000/api/health (if endpoint exists)

## 💡 Pro Tip

Add a "Connection Test" button to your UI:

```typescript
// In any component
const testConnection = async () => {
  try {
    const res = await fetch('http://localhost:8000/docs');
    console.log('Backend:', res.ok ? '✅ Connected' : '❌ Error');
  } catch {
    console.log('Backend: ❌ Not running');
  }
};
```

Then call `testConnection()` when you need to verify!
