import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/mock-db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productId,
      weightGrams,
      quantity,
      grindType,
      finalPrice,
      customerName,
      customerPhone,
      customerAddress,
    } = body;

    if (
      !productId ||
      !weightGrams ||
      !quantity ||
      !grindType ||
      !finalPrice ||
      !customerName ||
      !customerPhone ||
      !customerAddress
    ) {
      return NextResponse.json(
        { success: false, error: "تمامی فیلدهای ستاره‌دار الزامی هستند" },
        { status: 400 },
      );
    }

    const newOrder = createOrder({
      productId,
      weightGrams: Number(weightGrams),
      quantity: Number(quantity),
      grindType,
      finalPrice: Number(finalPrice),
      customerName,
      customerPhone,
      customerAddress,
    });

    return NextResponse.json({
      success: true,
      data: newOrder,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "خطایی در ثبت اطلاعات سفارش رخ داده است" },
      { status: 500 },
    );
  }
}
