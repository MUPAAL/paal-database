import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get token from request body
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    // Verify the token directly
    try {
      // Use the same secret as the backend
      const secret = process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production';
      console.log('Verifying token with secret:', secret ? '[SECRET SET]' : '[SECRET NOT SET]');

      const decoded: any = jwt.verify(token, secret);
      console.log('Token verified successfully');

      return NextResponse.json({
        user: {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          assignedFarm: decoded.assignedFarm,
          // Include any other properties from the token
        },
        token
      });
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("Error validating token:", error);

    return NextResponse.json(
      { error: error.message || "Failed to validate token" },
      { status: 500 }
    );
  }
}
