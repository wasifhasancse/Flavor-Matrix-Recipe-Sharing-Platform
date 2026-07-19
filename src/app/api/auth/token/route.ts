import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SignJWT } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "flavor-matrix-default-jwt-secret-key-change-in-prod";
const ENCODED_SECRET = new TextEncoder().encode(JWT_SECRET);

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = session;

    // Create a JWT that matches the backend's expected schema
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      role: (user as any).role || "user",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(ENCODED_SECRET);

    return NextResponse.json({ success: true, token });
  } catch (error: any) {
    console.error("Failed to generate JWT:", error);
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 });
  }
}
