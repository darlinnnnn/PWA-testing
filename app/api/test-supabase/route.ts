import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test 1: Check if we can connect to Supabase
    const { data: testData, error: testError } = await supabase
      .from('data_items')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('Supabase connection test failed:', testError);
      return NextResponse.json({
        success: false,
        error: 'Supabase connection failed',
        details: testError.message
      }, { status: 500 });
    }
    
    // Test 2: Try to insert a test record
    const testRecord = {
      name: 'Test Record',
      description: 'This is a test record to verify database connection',
      device_token: 'test-token-123'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('data_items')
      .insert([testRecord])
      .select();
    
    if (insertError) {
      console.error('Supabase insert test failed:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Supabase insert failed',
        details: insertError.message
      }, { status: 500 });
    }
    
    // Test 3: Clean up test record
    if (insertData && insertData.length > 0) {
      const { error: deleteError } = await supabase
        .from('data_items')
        .delete()
        .eq('id', insertData[0].id);
      
      if (deleteError) {
        console.error('Failed to clean up test record:', deleteError);
      }
    }
    
    console.log('Supabase connection test successful');
    return NextResponse.json({
      success: true,
      message: 'Supabase connection and insert test successful',
      testRecord: insertData?.[0] || null
    });
    
  } catch (error) {
    console.error('Unexpected error in Supabase test:', error);
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 