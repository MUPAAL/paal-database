import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    console.log('API test route called');
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
    
    // Test connection to backend
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/test`);
    
    return NextResponse.json({
      message: 'API test successful',
      backendResponse: response.data
    });
  } catch (error: any) {
    console.error('API test error:', error);
    
    return NextResponse.json({
      error: 'API test failed',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
