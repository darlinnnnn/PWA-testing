// Firebase messaging service worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Your Firebase configuration
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
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  console.log('[firebase-messaging-sw.js] Payload data:', payload.data);
  console.log('[firebase-messaging-sw.js] Payload notification:', payload.notification);
  
  // Try to get title and body from different sources
  const notificationTitle = payload.notification?.title || payload.data?.title || 'New Notification';
  const notificationBody = payload.notification?.body || payload.data?.body || 'You have a new message';
  
  // Create data object with custom properties
  const dataObj = payload.data || {};
  dataObj.click_action = payload.data?.click_action || 'https://pwa-testingssss.vercel.app/';
  dataObj.url = payload.data?.url || 'https://pwa-testingssss.vercel.app/';
  dataObj.source = payload.data?.source || 'firebase';
  
  console.log('[firebase-messaging-sw.js] Created dataObj:', dataObj);
  console.log('[firebase-messaging-sw.js] Notification title:', notificationTitle);
  console.log('[firebase-messaging-sw.js] Notification body:', notificationBody);
  
  const notificationOptions = {
    body: notificationBody,
    icon: '/icon-192x192.svg',
    badge: '/icon-72x72.svg',
    tag: 'pwa-notification',
    requireInteraction: false,
    data: dataObj
  };

  console.log('[firebase-messaging-sw.js] Notification options:', notificationOptions);

  // Show the notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);
  console.log('[firebase-messaging-sw.js] Notification data:', event.notification.data);
  console.log('[firebase-messaging-sw.js] Notification title:', event.notification.title);
  console.log('[firebase-messaging-sw.js] Notification body:', event.notification.body);
  
  event.notification.close();

  // Get the URL to open from notification data (like in the image)
  const nUrl = event.notification.data?.click_action || event.notification.data?.url || 'https://pwa-testingssss.vercel.app/';
  console.log('[firebase-messaging-sw.js] Opening URL:', nUrl);
  console.log('[firebase-messaging-sw.js] click_action value:', event.notification.data?.click_action);
  console.log('[firebase-messaging-sw.js] url value:', event.notification.data?.url);

  // Always try to open/focus the app
  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    }).then((clientList) => {
      console.log('[firebase-messaging-sw.js] Found clients:', clientList.length);
      
      // First, try to find and focus an existing PWA window
      for (const client of clientList) {
        console.log('[firebase-messaging-sw.js] Checking client:', client.url);
        if (client.url.includes('pwa-testingssss.vercel.app')) {
          console.log('[firebase-messaging-sw.js] Found existing PWA client, focusing:', client.url);
          return client.focus();
        }
      }
      
      // If no PWA window found, try to open a new one
      console.log('[firebase-messaging-sw.js] No existing PWA client found, opening new window');
      return clients.openWindow(nUrl).catch((error) => {
        console.log('[firebase-messaging-sw.js] Failed to open window:', error);
        // Fallback: try to open in new tab
        return clients.openWindow(nUrl);
      });
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[firebase-messaging-sw.js] Notification closed:', event);
});

// Handle push events (fallback for older browsers)
self.addEventListener('push', (event) => {
  console.log('[firebase-messaging-sw.js] Push event received:', event);
  
  if (event.data) {
    try {
      const payload = event.data.json();
      const notificationTitle = payload.notification?.title || payload.data?.title || 'New Notification';
      const notificationOptions = {
        body: payload.notification?.body || payload.data?.body || 'You have a new message',
        icon: '/icon-192x192.svg',
        badge: '/icon-72x72.svg',
        tag: 'pwa-notification',
        requireInteraction: true,
                  data: {
            click_action: payload.data?.click_action || payload.data?.url || 'https://pwa-testingssss.vercel.app/',
            url: payload.data?.url || 'https://pwa-testingssss.vercel.app/',
            ...payload.data
          }
      };

      event.waitUntil(
        self.registration.showNotification(notificationTitle, notificationOptions)
      );
    } catch (error) {
      console.error('[firebase-messaging-sw.js] Error parsing push data:', error);
    }
  }
});

console.log('[firebase-messaging-sw.js] Service worker loaded successfully'); 