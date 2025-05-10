import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get token from request body
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 400 });
    }
    
    // Create a response
    const response = NextResponse.json({ success: true });
    
    // Set the cookie
    response.cookies.set({
      name: "token",
      value: token,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
      httpOnly: false, // Allow JavaScript access
      secure: false, // Allow non-HTTPS
      sameSite: "lax"
    });
    
    console.log('API - Set cookie with token:', token.substring(0, 20) + '...');
    
    return response;
  } catch (error: any) {
    console.error("Error setting cookie:", error);
    
    return NextResponse.json(
      { error: error.message || "Failed to set cookie" },
      { status: 500 }
    );
  }
}
