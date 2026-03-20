import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CDP_PAYMASTER_URL = process.env.CDP_PAYMASTER_URL;

export async function POST(req: NextRequest) {
  if (!CDP_PAYMASTER_URL) {
    return NextResponse.json({ error: "Paymaster not configured" }, { status: 500 });
  }

  try {
    const body = await req.json();

    const response = await fetch(CDP_PAYMASTER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Paymaster request failed" }, { status: 502 });
  }
}
