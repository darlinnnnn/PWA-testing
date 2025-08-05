import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { device_token, user_agent } = await request.json();

    if (!device_token) {
      return NextResponse.json(
        { error: 'Device token is required' },
        { status: 400 }
      );
    }

    console.log('🔧 Saving/updating PWA device token:', device_token.substring(0, 20) + '...');

    // Check if token already exists
    const { data: existingToken } = await supabase
      .from('pwa_device_tokens')
      .select('id, is_active')
      .eq('device_token', device_token)
      .single();

    if (existingToken) {
      // Update existing token
      const { data, error } = await supabase
        .from('pwa_device_tokens')
        .update({ 
          is_active: true,
          user_agent: user_agent || null
        })
        .eq('device_token', device_token)
        .select();

      if (error) {
        console.error('❌ Error updating token:', error);
        return NextResponse.json(
          { error: 'Failed to update token' },
          { status: 500 }
        );
      }

      console.log('✅ Token updated successfully');
      return NextResponse.json({
        success: true,
        message: 'Token updated successfully',
        action: 'updated'
      });
    } else {
      // Insert new token
      const { data, error } = await supabase
        .from('pwa_device_tokens')
        .insert({
          device_token,
          user_agent: user_agent || null
        })
        .select();

      if (error) {
        console.error('❌ Error inserting token:', error);
        return NextResponse.json(
          { error: 'Failed to save token' },
          { status: 500 }
        );
      }

      console.log('✅ Token saved successfully');
      return NextResponse.json({
        success: true,
        message: 'Token saved successfully',
        action: 'inserted'
      });
    }
  } catch (error) {
    console.error('❌ Error in PWA token API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { device_token } = await request.json();

    if (!device_token) {
      return NextResponse.json(
        { error: 'Device token is required' },
        { status: 400 }
      );
    }

    console.log('🗑️ Deactivating PWA device token:', device_token.substring(0, 20) + '...');

    // Deactivate token (soft delete)
    const { error } = await supabase
      .from('pwa_device_tokens')
      .update({ is_active: false })
      .eq('device_token', device_token);

    if (error) {
      console.error('❌ Error deactivating token:', error);
      return NextResponse.json(
        { error: 'Failed to deactivate token' },
        { status: 500 }
      );
    }

    console.log('✅ Token deactivated successfully');
    return NextResponse.json({
      success: true,
      message: 'Token deactivated successfully'
    });
  } catch (error) {
    console.error('❌ Error in PWA token deactivation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get all active tokens (for admin purposes)
    const { data, error } = await supabase
      .from('pwa_device_tokens')
      .select('id, created_at, updated_at, is_active, user_agent')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching tokens:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tokens' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tokens: data,
      count: data.length
    });
  } catch (error) {
    console.error('❌ Error in PWA token fetch:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 