import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

export async function GET() {
  try {
    console.log('🧪 Testing Firebase Admin initialization...');
    console.log('🔍 Environment variables:');
    console.log('- FIREBASE_SERVICE_ACCOUNT_BASE64 exists:', !!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64);
    console.log('- FIREBASE_SERVICE_ACCOUNT_BASE64 length:', process.env.FIREBASE_SERVICE_ACCOUNT_BASE64?.length || 0);
    console.log('- NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    
    let firebaseApp: App | undefined;
    let errorMessage = '';
    
    if (!getApps().length) {
      try {
        if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
          console.log('🔧 Loading service account from environment variable...');
          const serviceAccount = JSON.parse(
            Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString()
          );
          console.log('🔧 Service account loaded, project_id:', serviceAccount.project_id);
          
          firebaseApp = initializeApp({
            credential: cert(serviceAccount),
          });
          console.log('✅ Firebase Admin SDK initialized successfully');
        } else {
          errorMessage = 'FIREBASE_SERVICE_ACCOUNT_BASE64 not found';
          console.error('❌', errorMessage);
        }
      } catch (error) {
        errorMessage = `Firebase Admin initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error('❌', errorMessage);
      }
    } else {
      console.log('✅ Firebase Admin SDK already initialized');
    }
    
    const messaging = firebaseApp ? getMessaging(firebaseApp) : undefined;
    
    return NextResponse.json({
      success: !!messaging,
      firebaseInitialized: !!messaging,
      error: errorMessage || null,
      environment: {
        serviceAccountExists: !!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
        serviceAccountLength: process.env.FIREBASE_SERVICE_ACCOUNT_BASE64?.length || 0,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        appsCount: getApps().length
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 