import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, subject, message } = body ?? {};

    if (!name || !phone || !message) {
      return NextResponse.json(
        { error: "নাম, ফোন নম্বর এবং বার্তা অবশ্যই দিতে হবে।" },
        { status: 400 },
      );
    }

    await db.insert(contactMessages).values({
      name,
      phone,
      email: email || null,
      subject: subject || "",
      message,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "বার্তা পাঠানো যায়নি, আবার চেষ্টা করুন।" }, { status: 500 });
  }
}
