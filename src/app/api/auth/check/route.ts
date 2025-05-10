import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Get token from cookies or authorization header
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.split(' ')[1];
  
  // Log the token for debugging
  console.log('API - Token from cookies:', request.cookies.get('token')?.value ? 'Found' : 'Not found');
  console.log('API - Token from headers:', request.headers.get('authorization') ? 'Found' : 'Not found');
  console.log('API - Final token:', token ? 'Found' : 'Not found');
  
  // Get all cookies for debugging
  const cookies = request.cookies.getAll();
  console.log('API - All cookies:', cookies.map(c => `${c.name}=${c.value.substring(0, 10)}...`));
  
  // Get all headers for debugging
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  console.log('API - All headers:', headers);
  
  // Return the authentication state
  return NextResponse.json({
    authenticated: !!token,
    tokenFromCookie: !!request.cookies.get('token')?.value,
    tokenFromHeader: !!request.headers.get('authorization'),
    cookies: cookies.map(c => ({ name: c.name, value: c.value.substring(0, 10) + '...' })),
    headers: Object.entries(headers).map(([key, value]) => ({ 
      name: key, 
      value: typeof value === 'string' ? (value.length > 10 ? value.substring(0, 10) + '...' : value) : '[complex value]'
    }))
  });
}
