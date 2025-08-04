# 🚀 Deployment Guide - Vercel

## Prerequisites

1. **GitHub Account** - Push your code to GitHub
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Firebase Service Account** - Already configured

## Step 1: Push to GitHub

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: PWA with Firebase notifications"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## Step 2: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign in
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Configure the project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

## Step 3: Add Environment Variables

In your Vercel project dashboard, go to **Settings → Environment Variables** and add:

```
NEXT_PUBLIC_SUPABASE_URL=https://frbzgrlmybtswumofouj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyYnpncmxteWJ0c3d1bW9mb3VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDk2MzAsImV4cCI6MjA2OTc4NTYzMH0.hE8tp3f9JAXo7YJ_uq3-vCxXukqgUvQUsesBtNG1ecM
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCjYsAUwlQjhrF-rWnkmcT_ReGBlu3AQdM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=pwa-konni.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=pwa-konni
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=pwa-konni.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=298807443878
NEXT_PUBLIC_FIREBASE_APP_ID=1:298807443878:web:436f61140a9b7a0f080f67
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-DSZK9JD1TD
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BD1ejTEMrZ2tDGD7GHM99OrskaJwiUFv18rRHTgISbq-alZmHmkWW71dAL_VkNzwHyLHrWkcXicQ7gS0YOLLJ4U
```

## Step 4: Add Firebase Service Account

For the Firebase Admin SDK to work in production, you need to add the service account as an environment variable:

1. **Convert your service account JSON to base64**:
   ```bash
   base64 -i firebase-service-account.json
   ```

2. **Add as environment variable** in Vercel:
   - **Name**: `FIREBASE_SERVICE_ACCOUNT_BASE64`
   - **Value**: (paste the base64 output from above)

3. **Update the API route** to use the environment variable:

```typescript
// In app/api/send-notification/route.ts
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64!, 'base64').toString()
)
```

## Step 5: Deploy

1. **Click "Deploy"** in Vercel
2. **Wait for build to complete**
3. **Your app will be live at**: `https://your-project-name.vercel.app`

## Step 6: Test Production

1. **Open your deployed URL**
2. **Test PWA installation**:
   - Desktop: Look for install button in browser
   - Mobile: Add to home screen
3. **Test push notifications**:
   - Enable notifications
   - Add data to see notifications
4. **Test API endpoint**:
   ```bash
   curl -X POST https://your-project-name.vercel.app/api/send-notification \
     -H "Content-Type: application/json" \
     -d '{
       "deviceToken": "YOUR_DEVICE_TOKEN",
       "title": "Production Test",
       "body": "Testing from production!"
     }'
   ```

## 🎯 Expected Results

- ✅ **PWA Installable** on mobile and desktop
- ✅ **Real push notifications** working
- ✅ **HTTPS enabled** (required for PWA)
- ✅ **Offline support** working
- ✅ **Device tokens** being generated and stored

## 🔧 Troubleshooting

### Build Errors
- Check that all environment variables are set
- Ensure Firebase service account is properly encoded

### Push Notifications Not Working
- Verify VAPID key is correct
- Check browser console for errors
- Ensure HTTPS is working

### PWA Not Installable
- Check manifest.json is accessible
- Verify all icons are present
- Ensure HTTPS is enabled

## 📱 Production Testing Checklist

- [ ] App loads correctly
- [ ] PWA can be installed
- [ ] Push notifications work
- [ ] Data can be added to table
- [ ] Device tokens are generated
- [ ] API endpoint works
- [ ] Offline functionality works

Your PWA will be much more reliable in production with HTTPS! 🚀 