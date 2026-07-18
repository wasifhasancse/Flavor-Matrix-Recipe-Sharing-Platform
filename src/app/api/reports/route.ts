import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipeId, reason, details } = body;

    if (!recipeId || !reason) {
      return NextResponse.json(
        { error: "Recipe ID and reason are required." },
        { status: 400 }
      );
    }

    console.log("Recipe Report Received:", { recipeId, reason, details, timestamp: new Date() });

    return NextResponse.json({
      success: true,
      message: "Report submitted successfully. Thank you for keeping our platform safe.",
      reportId: `rep_${Date.now()}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to submit report." },
      { status: 500 }
    );
  }
}
