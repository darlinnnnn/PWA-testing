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
  
  const notificationTitle = payload.notification?.title || payload.data?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'You have a new message',
    icon: '/icon-192x192.svg',
    badge: '/icon-72x72.svg',
    tag: 'pwa-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icon-72x72.svg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-72x72.svg'
      }
    ],
    data: {
      url: payload.data?.url || 'https://pwa-testing-mix2.vercel.app/',
      click_action: payload.data?.click_action || payload.notification?.click_action,
      ...payload.data
    }
  };

  // Show the notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);
  
  event.notification.close();

  // Get the URL to open from notification data
  const urlToOpen = event.notification.data?.url || 'https://pwa-testing-mix2.vercel.app/';
  console.log('[firebase-messaging-sw.js] Opening URL:', urlToOpen);

  if (event.action === 'open' || event.action === undefined) {
    event.waitUntil(
      // First, try to find an existing window/tab
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      }).then((clientList) => {
        console.log('[firebase-messaging-sw.js] Found clients:', clientList.length);
        
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          console.log('[firebase-messaging-sw.js] Checking client:', client.url);
          if (client.url.includes('pwa-testing-mix2.vercel.app') || client.url.includes(urlToOpen)) {
            console.log('[firebase-messaging-sw.js] Found existing client, focusing:', client.url);
            return client.focus();
          }
        }
        
        // If no existing window/tab, open a new one
        console.log('[firebase-messaging-sw.js] No existing client found, opening new window');
        return clients.openWindow(urlToOpen);
      }).catch((error) => {
        console.error('[firebase-messaging-sw.js] Error handling notification click:', error);
        // Fallback: try to open the URL anyway
        return clients.openWindow(urlToOpen);
      })
    );
  }
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
          url: payload.data?.url || 'https://pwa-testing-mix2.vercel.app/',
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