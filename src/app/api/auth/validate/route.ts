import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get token from request body
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    console.log('Validating token with backend API...');

    // Forward the token to the backend API for validation
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://backend:5005'}/api/auth/token`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('Backend token validation failed:', response.status, response.statusText);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: response.status }
      );
    }

    // Get the user data from the response
    const data = await response.json();
    console.log('Token validated successfully by backend');

    return NextResponse.json({
      user: data.user,
      token
    });
  } catch (error: any) {
    console.error("Error validating token:", error);

    return NextResponse.json(
      { error: error.message || "Failed to validate token" },
      { status: 500 }
    );
  }
}
