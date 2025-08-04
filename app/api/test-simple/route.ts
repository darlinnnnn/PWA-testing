import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🧪 Testing simple base64 decode...');
    
    const base64Data = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    console.log('🔍 Base64 length:', base64Data?.length || 0);
    
    if (!base64Data) {
      return NextResponse.json({
        success: false,
        error: 'FIREBASE_SERVICE_ACCOUNT_BASE64 not found'
      });
    }
    
    try {
      // Try to decode the base64
      const decoded = Buffer.from(base64Data, 'base64').toString();
      console.log('🔧 Decoded length:', decoded.length);
      console.log('🔧 First 100 chars:', decoded.substring(0, 100));
      console.log('🔧 Last 100 chars:', decoded.substring(decoded.length - 100));
      
      // Try to parse as JSON
      const jsonData = JSON.parse(decoded);
      console.log('🔧 JSON parsed successfully, project_id:', jsonData.project_id);
      
      return NextResponse.json({
        success: true,
        decodedLength: decoded.length,
        projectId: jsonData.project_id,
        hasPrivateKey: !!jsonData.private_key,
        timestamp: new Date().toISOString()
      });
      
    } catch (decodeError) {
      console.error('❌ Decode/parse error:', decodeError);
      return NextResponse.json({
        success: false,
        error: 'Failed to decode or parse base64',
        details: decodeError instanceof Error ? decodeError.message : 'Unknown error',
        base64Length: base64Data.length,
        base64Start: base64Data.substring(0, 50),
        base64End: base64Data.substring(base64Data.length - 50)
      });
    }
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 