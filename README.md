# PWA Notification App

A powerful Progressive Web App (PWA) with Firebase push notifications and Supabase integration. This app allows you to add data to a table and receive push notifications when new data is added.

## Features

- ✅ **Progressive Web App (PWA)** - Installable on mobile and desktop
- ✅ **Firebase Push Notifications** - Real-time notifications when data is added
- ✅ **Supabase Integration** - Database for storing data and device tokens
- ✅ **Modern UI** - Beautiful, responsive design with Tailwind CSS
- ✅ **Device Token Display** - Shows FCM token for API testing
- ✅ **Offline Support** - Works even when offline
- ✅ **Service Worker** - Handles background notifications

## Prerequisites

Before running this project, you need to:

1. **Set up Supabase Database**
   - Create a table called `data_items` with the following structure:
   ```sql
   CREATE TABLE data_items (
     id SERIAL PRIMARY KEY,
     name TEXT NOT NULL,
     description TEXT NOT NULL,
     device_token TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

2. **Configure Firebase**
   - Get your VAPID key from Firebase Console
   - Update the VAPID key in `lib/firebase.ts`

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory with your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://frbzgrlmybtswumofouj.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyYnpncmxteWJ0c3d1bW9mb3VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDk2MzAsImV4cCI6MjA2OTc4NTYzMH0.hE8tp3f9JAXo7YJ_uq3-vCxXukqgUvQUsesBtNG1ecM
   ```

3. **Update Firebase VAPID Key:**
   - Go to Firebase Console > Project Settings > Cloud Messaging
   - Generate a new Web Push certificate
   - Replace `YOUR_VAPID_KEY_HERE` in `lib/firebase.ts` with your actual VAPID key

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### 1. Enable Notifications
- Click the "Enable Notifications" button
- Grant permission when prompted by your browser
- The device token will be displayed for API testing

### 2. Add Data
- Click "Add Data" button
- Fill in the name and description
- Submit the form
- You'll receive a push notification confirming the data was added

### 3. View Data
- All data is displayed in a responsive table
- Device tokens are shown for each entry
- Data is automatically refreshed when new items are added

## PWA Features

### Installation
- **Desktop**: Click the install button in your browser's address bar
- **Mobile**: Add to home screen from your browser's menu
- **Chrome**: Look for the install icon in the address bar

### Offline Support
- The app works offline after the first load
- Data is cached for offline viewing
- Notifications work even when the app is closed

## API Testing

Use the device token displayed in the app to test push notifications via Firebase Admin SDK:

```javascript
// Example using Firebase Admin SDK
const admin = require('firebase-admin');

admin.messaging().send({
  token: 'DEVICE_TOKEN_FROM_APP',
  notification: {
    title: 'Test Notification',
    body: 'This is a test notification from your API'
  }
});
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout with PWA meta tags
│   └── page.tsx           # Main page component
├── components/            # React components
│   └── DataTable.tsx     # Main data table component
├── lib/                  # Utility libraries
│   ├── firebase.ts       # Firebase configuration
│   └── supabase.ts       # Supabase client and functions
├── public/               # Static assets
│   ├── manifest.json     # PWA manifest
│   └── firebase-messaging-sw.js # Service worker
└── package.json          # Dependencies and scripts
```

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Firebase** - Push notifications and messaging
- **Supabase** - Database and real-time features
- **Lucide React** - Beautiful icons
- **PWA** - Progressive Web App features

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
- **Netlify**: Add build command: `npm run build`
- **Firebase Hosting**: Use `npm run build` and deploy the `out` directory

## Troubleshooting

### Notifications not working?
1. Check if notifications are enabled in browser settings
2. Verify VAPID key is correct
3. Ensure service worker is registered
4. Check browser console for errors

### Database connection issues?
1. Verify Supabase credentials
2. Check if the `data_items` table exists
3. Ensure RLS policies allow read/write access

### PWA not installable?
1. Check if HTTPS is enabled (required for PWA)
2. Verify manifest.json is accessible
3. Ensure all required icons are present

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for your own applications! 