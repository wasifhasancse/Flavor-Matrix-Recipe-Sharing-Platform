import { NextResponse } from "next/server";
import { mockRecipes } from "@/data/recipes";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { favorited } = body;

    const recipe = mockRecipes.find((r) => r.id === id);
    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      favorited: Boolean(favorited),
      recipeId: id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update favorite status" },
      { status: 500 }
    );
  }
}
