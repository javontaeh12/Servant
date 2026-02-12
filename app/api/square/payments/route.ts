import { NextRequest, NextResponse } from "next/server";
import { getSquareClient, SQUARE_LOCATION_ID } from "@/lib/square";
import { SquarePayment } from "@/lib/types";
import { getSessionFromRequest } from "@/lib/session";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const squareClient = await getSquareClient();
    const page = await squareClient.payments.list({
      locationId: SQUARE_LOCATION_ID,
      sortOrder: "DESC",
    });

    const payments: SquarePayment[] = page.data.map((p) => ({
      id: p.id || "",
      amount: Number(p.amountMoney?.amount || 0) / 100,
      currency: p.amountMoney?.currency || "USD",
      status: p.status || "UNKNOWN",
      description: p.note || "",
      receiptUrl: p.receiptUrl || "",
      createdAt: p.createdAt || "",
    }));

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sourceId, amount, note } = await request.json();

    if (!sourceId || !amount) {
      return NextResponse.json(
        { error: "sourceId and amount are required" },
        { status: 400 }
      );
    }

    const squareClient = await getSquareClient();
    const result = await squareClient.payments.create({
      sourceId,
      idempotencyKey: crypto.randomUUID(),
      amountMoney: {
        amount: BigInt(Math.round(amount * 100)),
        currency: "USD",
      },
      locationId: SQUARE_LOCATION_ID,
      note: note || "",
    });

    return NextResponse.json({
      success: true,
      paymentId: result.payment?.id,
      status: result.payment?.status,
      receiptUrl: result.payment?.receiptUrl,
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      { error: "Failed to process payment" },
      { status: 500 }
    );
  }
}
