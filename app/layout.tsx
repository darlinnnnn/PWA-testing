import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PWA Notification App',
  description: 'A powerful Progressive Web App with Firebase push notifications and Supabase integration',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PWA App',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icon-16x16.svg', sizes: '16x16', type: 'image/svg+xml' },
      { url: '/icon-32x32.svg', sizes: '32x32', type: 'image/svg+xml' },
      { url: '/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icon-512x512.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
    ],
    other: [
      { url: '/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'PWA App',
    'application-name': 'PWA Notification App',
    'msapplication-TileColor': '#667eea',
    'msapplication-config': '/browserconfig.xml',
  },
}

export const viewport: Viewport = {
  themeColor: '#667eea',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="application-name" content="PWA Notification App" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PWA App" />
        <meta name="description" content="A powerful Progressive Web App with Firebase push notifications and Supabase integration" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#667eea" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#667eea" />
        
        {/* Chrome PWA specific meta tags */}
        <meta name="chrome-webstore-item" content="" />
        <meta name="google" content="notranslate" />
        <meta name="robots" content="noindex,nofollow" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />

        <link rel="apple-touch-icon" href="/icon-192x192.svg" />
        <link rel="icon" type="image/svg+xml" href="/icon-192x192.svg" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/icon-192x192.svg" />
        
        {/* PWA Install Handler */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Handle PWA install prompt
              window.addEventListener('beforeinstallprompt', (e) => {
                console.log('🎉 PWA Install prompt available!');
                console.log('Event details:', e);
                
                // Don't prevent default - let Chrome show native prompt
                // e.preventDefault();
                
                // Store the event for later use if needed
                window.deferredPrompt = e;
                
                // Trigger Chrome native prompt immediately
                console.log('🚀 Triggering Chrome native install prompt...');
                window.deferredPrompt.prompt();
                window.deferredPrompt.userChoice.then((choiceResult) => {
                  console.log('✅ User choice:', choiceResult.outcome);
                  window.deferredPrompt = null;
                }).catch((error) => {
                  console.error('❌ Error showing prompt:', error);
                });
              });

              // Handle PWA installed
              window.addEventListener('appinstalled', () => {
                console.log('🎊 PWA was installed successfully!');
                window.deferredPrompt = null;
              });

              // Debug: Check if PWA is installable
              console.log('🔍 Checking PWA installability...');
              console.log('Manifest:', document.querySelector('link[rel="manifest"]')?.href);
              console.log('Service Worker:', 'serviceWorker' in navigator);
            `
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
} 