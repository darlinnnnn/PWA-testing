import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check environment variables
    const envVars = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET',
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT_SET',
      firebaseServiceAccount: process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 ? 'SET' : 'NOT_SET',
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ? 'SET' : 'NOT_SET',
      firebaseApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'SET' : 'NOT_SET',
      firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'SET' : 'NOT_SET',
    };

    return NextResponse.json({
      success: true,
      message: 'Debug information',
      environment: envVars,
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 