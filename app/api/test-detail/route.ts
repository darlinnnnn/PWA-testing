import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🧪 Testing detailed base64 decode...');
    
    const base64Data = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    console.log('🔍 Base64 length:', base64Data?.length || 0);
    
    if (!base64Data) {
      return NextResponse.json({
        success: false,
        error: 'FIREBASE_SERVICE_ACCOUNT_BASE64 not found'
      });
    }
    
    // Check if base64 is complete
    const expectedEnd = 'Y29tIgp9Cg=='; // Expected end of our base64
    const actualEnd = base64Data.substring(base64Data.length - 20);
    
    console.log('🔍 Expected end:', expectedEnd);
    console.log('🔍 Actual end:', actualEnd);
    console.log('🔍 Base64 complete:', base64Data.endsWith(expectedEnd));
    
    try {
      // Try to decode the base64
      const decoded = Buffer.from(base64Data, 'base64').toString();
      console.log('🔧 Decoded length:', decoded.length);
      
      // Check for JSON structure
      const lines = decoded.split('\n');
      console.log('🔧 Number of lines:', lines.length);
      console.log('🔧 First line:', lines[0]);
      console.log('🔧 Last line:', lines[lines.length - 1]);
      
      // Try to parse as JSON
      const jsonData = JSON.parse(decoded);
      console.log('🔧 JSON parsed successfully, project_id:', jsonData.project_id);
      
      return NextResponse.json({
        success: true,
        decodedLength: decoded.length,
        projectId: jsonData.project_id,
        hasPrivateKey: !!jsonData.private_key,
        base64Complete: base64Data.endsWith(expectedEnd),
        expectedEnd,
        actualEnd,
        timestamp: new Date().toISOString()
      });
      
    } catch (decodeError) {
      console.error('❌ Decode/parse error:', decodeError);
      
      // Try to find where the JSON breaks
      const decoded = Buffer.from(base64Data, 'base64').toString();
      const lines = decoded.split('\n');
      
      return NextResponse.json({
        success: false,
        error: 'Failed to decode or parse base64',
        details: decodeError instanceof Error ? decodeError.message : 'Unknown error',
        base64Length: base64Data.length,
        base64Start: base64Data.substring(0, 50),
        base64End: base64Data.substring(base64Data.length - 50),
        decodedLength: decoded.length,
        numberOfLines: lines.length,
        firstLine: lines[0],
        lastLine: lines[lines.length - 1],
        expectedEnd,
        actualEnd: base64Data.substring(base64Data.length - 20)
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