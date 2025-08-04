import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

// Initialize Firebase Admin SDK
let firebaseApp: App | undefined;
if (!getApps().length) {
  try {
    console.log('🔧 Initializing Firebase Admin SDK...');
    console.log('🔍 FIREBASE_SERVICE_ACCOUNT_BASE64 exists:', !!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64);
    console.log('🔍 FIREBASE_SERVICE_ACCOUNT_BASE64 length:', process.env.FIREBASE_SERVICE_ACCOUNT_BASE64?.length || 0);
    
    // Try to load service account from environment variable (production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      console.log('🔧 Loading service account from environment variable...');
      const serviceAccount = JSON.parse(
        Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString()
      );
      console.log('🔧 Service account loaded successfully, project_id:', serviceAccount.project_id);
      firebaseApp = initializeApp({
        credential: cert(serviceAccount),
      });
      console.log('✅ Firebase Admin SDK initialized successfully');
    } else {
      console.log('🔧 Loading service account from local file...');
      // Try to load from local file (development)
      const serviceAccount = require('../../../firebase-service-account.json');
      firebaseApp = initializeApp({
        credential: cert(serviceAccount),
      });
      console.log('✅ Firebase Admin SDK initialized successfully (local)');
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error');
  }
} else {
  console.log('✅ Firebase Admin SDK already initialized');
}

const messaging = firebaseApp ? getMessaging(firebaseApp) : undefined;

export async function POST(request: NextRequest) {
  try {
    const { token, title, body, data } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Device token is required' },
        { status: 400 }
      );
    }

    if (!messaging) {
      return NextResponse.json(
        { error: 'Firebase Admin not initialized' },
        { status: 500 }
      );
    }

    console.log('🔥 Sending real notification to:', token);
    console.log('📱 Title:', title || '🎉 Real Push Notification!');
    console.log('📝 Body:', body || 'This is a REAL Firebase push notification from your PWA!');

    const message = {
      token,
      notification: {
        title: title || '🎉 Real Push Notification!',
        body: body || 'This is a REAL Firebase push notification from your PWA!',
      },
      data: {
        url: 'https://pwa-testingssss.vercel.app/',
        click_action: 'https://pwa-testingssss.vercel.app/',
        source: data?.source || 'api',
        ...data,
      },
      webpush: {
        notification: {
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
            url: 'https://pwa-testingssss.vercel.app/',
            click_action: 'https://pwa-testingssss.vercel.app/',
            source: data?.source || 'api'
          }
        },
        fcm_options: {
          link: 'https://pwa-testingssss.vercel.app/'
        }
      },
      android: {
        notification: {
          icon: '/icon-192x192.svg',
          color: '#667eea',
          clickAction: 'https://pwa-testingssss.vercel.app/'
        }
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: title || '🎉 Real Push Notification!',
              body: body || 'This is a REAL Firebase push notification from your PWA!'
            },
            badge: 1,
            sound: 'default'
          }
        }
      }
    };

    const response = await messaging.send(message);
    console.log('✅ Notification sent successfully:', response);

    return NextResponse.json({
      success: true,
      messageId: response,
      message: 'Notification sent successfully'
    });

  } catch (error) {
    console.error('❌ Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // This endpoint can be used to test if the API is working
    return NextResponse.json({
      message: 'PWA Notification API is working!',
      timestamp: new Date().toISOString(),
      endpoints: {
        POST: '/api/send-notification - Send push notification',
        GET: '/api/send-notification - API status'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'API error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 