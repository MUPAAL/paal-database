import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { sub: userId },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1h" }
    );
    
    return NextResponse.json({ token });
  } catch (error: any) {
    console.error("Error generating token:", error);
    
    return NextResponse.json(
      { error: error.message || "Failed to generate token" },
      { status: 500 }
    );
  }
}
