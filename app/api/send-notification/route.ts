import { NextRequest, NextResponse } from 'next/server'
import { getData } from '@/lib/supabase'
import admin from 'firebase-admin'

// Initialize Firebase Admin SDK
let firebaseAdmin: admin.app.App

try {
  // Check if already initialized
  if (!admin.apps.length) {
    let serviceAccount: any
    
    // Use environment variable in production, local file in development
    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      // Production: decode from base64 environment variable
      serviceAccount = JSON.parse(
        Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString()
      )
    } else {
      // Development: use local file
      serviceAccount = require('../../../firebase-service-account.json')
    }
    
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    })
  } else {
    firebaseAdmin = admin.app()
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error)
}

export async function POST(request: NextRequest) {
  try {
    const { deviceToken, title, body } = await request.json()

    if (!deviceToken) {
      return NextResponse.json(
        { error: 'Device token is required' },
        { status: 400 }
      )
    }

    if (!firebaseAdmin) {
      return NextResponse.json(
        { error: 'Firebase Admin not initialized' },
        { status: 500 }
      )
    }

    console.log('🔥 Sending real notification to:', deviceToken)
    console.log('📱 Title:', title || 'Test Notification')
    console.log('📝 Body:', body || 'This is a test notification')

    const message = {
      token: deviceToken,
      notification: {
        title: title || 'Test Notification',
        body: body || 'This is a test notification'
      },
      webpush: {
        notification: {
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          actions: [
            {
              action: 'open',
              title: 'Open App'
            }
          ]
        },
        fcm_options: {
          link: '/'
        }
      }
    }

    const response = await firebaseAdmin.messaging().send(message)
    console.log('✅ Notification sent successfully:', response)

    return NextResponse.json({
      success: true,
      message: 'Real notification sent successfully!',
      deviceToken: deviceToken.substring(0, 20) + '...',
      title: title || 'Test Notification',
      body: body || 'This is a test notification',
      messageId: response
    })

  } catch (error) {
    console.error('❌ Error sending notification:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get all data items with device tokens
    const data = await getData()
    
    return NextResponse.json({
      success: true,
      data: data.filter(item => item.device_token),
      totalItems: data.length,
      itemsWithTokens: data.filter(item => item.device_token).length,
      sampleToken: data.find(item => item.device_token)?.device_token?.substring(0, 20) + '...'
    })
  } catch (error) {
    console.error('Error fetching data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
} 