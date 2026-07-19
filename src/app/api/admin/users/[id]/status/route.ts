import { NextResponse } from "next/server";
import { db, auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userIdToUpdate = id;
    if (!userIdToUpdate) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const userSession = await auth.api.getSession({ headers: await headers() });
    const sessionUser = userSession?.user as any;

    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const usersCollection = db.collection("users");
    
    // Strict DB verification of admin role
    const dbAdminUser = await usersCollection.findOne({ email: sessionUser.email });
    
    if (!dbAdminUser || dbAdminUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden. Admin only." }, { status: 403 });
    }

    const body = await request.json();
    const { isBlocked } = body;

    if (typeof isBlocked !== "boolean") {
      return NextResponse.json({ error: "isBlocked must be a boolean" }, { status: 400 });
    }

    // Attempt to update by string `id` (Better-Auth format) or ObjectId if necessary
    // Better auth uses string IDs for MongoDB adapter usually.
    const updateResult = await usersCollection.updateOne(
      { id: userIdToUpdate },
      { $set: { isBlocked } }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`
    });
  } catch (error: any) {
    console.error("[admin/users/status] PATCH error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
