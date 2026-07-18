import { NextResponse } from "next/server";
import { mockRecipes } from "@/data/recipes";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { action } = body;

    const recipe = mockRecipes.find((r) => r.id === id);
    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    if (action === "unlike") {
      recipe.likes = Math.max(0, recipe.likes - 1);
    } else {
      recipe.likes += 1;
    }

    return NextResponse.json({
      success: true,
      likes: recipe.likes,
      action: action || "like",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update like count" },
      { status: 500 }
    );
  }
}
