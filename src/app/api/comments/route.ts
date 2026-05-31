import { NextRequest, NextResponse } from "next/server";
import { getCommentsByProductId, createComment } from "@/lib/mock-db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json(
      { success: false, error: "شناسه محصول ارسال نشده است" },
      { status: 400 },
    );
  }

  const comments = getCommentsByProductId(productId);
  return NextResponse.json({ success: true, data: comments });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, first_name, last_name, rating, comment_text } = body;

    if (!productId || !first_name || !last_name || !rating || !comment_text) {
      return NextResponse.json(
        { success: false, error: "تمامی اطلاعات اجباری هستند" },
        { status: 400 },
      );
    }

    const newComment = createComment(productId, {
      first_name,
      last_name,
      rating: Number(rating),
      comment_text,
    });

    return NextResponse.json({ success: true, data: newComment });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "خطایی رخ داده است" },
      { status: 500 },
    );
  }
}
