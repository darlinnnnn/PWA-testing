import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCjYsAUwlQjhrF-rWnkmcT_ReGBlu3AQdM",
  authDomain: "pwa-konni.firebaseapp.com",
  projectId: "pwa-konni",
  storageBucket: "pwa-konni.firebasestorage.app",
  messagingSenderId: "298807443878",
  appId: "1:298807443878:web:436f61140a9b7a0f080f67",
  measurementId: "G-DSZK9JD1TD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging: any = null;

if (typeof window !== 'undefined') {
  messaging = getMessaging(app);
}

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      return true;
    } else {
      console.log('Notification permission denied.');
      return false;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

export const getFCMToken = async () => {
  if (!messaging) {
    console.log('Messaging not available');
    return null;
  }

  try {
    // Get VAPID key from environment variable
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    
    console.log('🔍 Debug: VAPID key length:', vapidKey?.length || 0);
    console.log('🔍 Debug: VAPID key starts with:', vapidKey?.substring(0, 10) || 'undefined');
    
    if (!vapidKey || vapidKey === 'YOUR_VAPID_KEY_HERE') {
      console.error('⚠️ VAPID key not configured. Please add NEXT_PUBLIC_FIREBASE_VAPID_KEY to your .env.local file');
      return null;
    }

    console.log('🔍 Debug: Getting FCM token with VAPID key...');
    
    const currentToken = await getToken(messaging, {
      vapidKey: vapidKey
    });

    if (currentToken) {
      console.log('✅ FCM Token generated successfully:', currentToken.substring(0, 20) + '...');
      return currentToken;
    } else {
      console.log('❌ No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (error) {
    console.error('❌ Error occurred while retrieving token:', error);
    return null;
  }
};

export const onMessageListener = () => {
  if (!messaging) {
    return new Promise((resolve) => {
      resolve(null);
    });
  }

  return new Promise((resolve) => {
    onMessage(messaging, (payload: any) => {
      console.log('Message received:', payload);
      resolve(payload);
    });
  });
};

export { messaging }; 