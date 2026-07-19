import { NextResponse } from "next/server";
import { db, auth } from "@/lib/auth";
import { headers } from "next/headers";

// Default system settings
const DEFAULT_SETTINGS = {
  maintenanceMode: false,
  registrationsOpen: true,
  strictModeration: false,
};

export async function GET() {
  try {
    const userSession = await auth.api.getSession({ headers: await headers() });
    const sessionUser = userSession?.user as any;

    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const usersCollection = db.collection("users");
    const dbAdminUser = await usersCollection.findOne({ email: sessionUser.email });
    
    if (!dbAdminUser || dbAdminUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden. Admin only." }, { status: 403 });
    }

    const settingsCollection = db.collection("settings");
    let currentSettings = await settingsCollection.findOne({ type: "global" });

    if (!currentSettings) {
      // Seed default settings if they don't exist
      await settingsCollection.insertOne({ type: "global", ...DEFAULT_SETTINGS });
      currentSettings = { type: "global", ...DEFAULT_SETTINGS } as any;
    }

    return NextResponse.json({
      success: true,
      settings: currentSettings,
    });
  } catch (error: any) {
    console.error("[admin/settings] GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const userSession = await auth.api.getSession({ headers: await headers() });
    const sessionUser = userSession?.user as any;

    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const usersCollection = db.collection("users");
    const dbAdminUser = await usersCollection.findOne({ email: sessionUser.email });
    
    if (!dbAdminUser || dbAdminUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden. Admin only." }, { status: 403 });
    }

    const body = await request.json();
    
    // Whitelist allowed fields to update
    const updatePayload: Record<string, boolean> = {};
    if (typeof body.maintenanceMode === "boolean") updatePayload.maintenanceMode = body.maintenanceMode;
    if (typeof body.registrationsOpen === "boolean") updatePayload.registrationsOpen = body.registrationsOpen;
    if (typeof body.strictModeration === "boolean") updatePayload.strictModeration = body.strictModeration;

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: "No valid settings provided for update" }, { status: 400 });
    }

    const settingsCollection = db.collection("settings");
    
    const updateResult = await settingsCollection.updateOne(
      { type: "global" },
      { $set: updatePayload },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      updated: updatePayload
    });

  } catch (error: any) {
    console.error("[admin/settings] PATCH error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
