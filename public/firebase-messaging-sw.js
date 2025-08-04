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
  console.log('[firebase-messaging-sw.js] Notification data:', event.notification.data);
  
  event.notification.close();

  // Get the URL to open from notification data
  const urlToOpen = event.notification.data?.click_action || event.notification.data?.url || 'https://pwa-testingssss.vercel.app/';
  console.log('[firebase-messaging-sw.js] Opening URL:', urlToOpen);

  if (event.action === 'open' || event.action === undefined) {
    event.waitUntil(
      // First, try to find existing windows/tabs
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      }).then((clientList) => {
        console.log('[firebase-messaging-sw.js] Found clients:', clientList.length);
        
        // Look for existing window/tab with our domain
        for (const client of clientList) {
          console.log('[firebase-messaging-sw.js] Checking client:', client.url);
          if (client.url.includes('pwa-testingssss.vercel.app')) {
            console.log('[firebase-messaging-sw.js] Found existing client, focusing:', client.url);
            return client.focus();
          }
        }
        
        // If no existing window/tab, open new one
        console.log('[firebase-messaging-sw.js] No existing client found, opening new window/tab');
        
        // Try to open window/tab (works for both browser and PWA)
        return clients.openWindow(urlToOpen).then((windowClient) => {
          console.log('[firebase-messaging-sw.js] Window opened successfully:', windowClient);
          return windowClient;
        }).catch((error) => {
          console.error('[firebase-messaging-sw.js] Error opening window:', error);
          
          // Fallback: try to navigate existing window
          return clients.matchAll().then((clients) => {
            if (clients.length > 0) {
              console.log('[firebase-messaging-sw.js] Navigating existing client');
              return clients[0].navigate(urlToOpen);
            } else {
              console.log('[firebase-messaging-sw.js] No clients available, opening new window');
              return clients.openWindow(urlToOpen);
            }
          });
        });
      }).catch((error) => {
        console.error('[firebase-messaging-sw.js] Error in notification click handler:', error);
        // Fallback: try to open window directly
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