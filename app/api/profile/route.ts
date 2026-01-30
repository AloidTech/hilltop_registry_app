import { adminDb } from "@/lib/serverapp";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const user_id = searchParams.get("user_id");
    if (!user_id?.trim) {
      return NextResponse.json({ error: "No user id provided" });
    }
    const profileDoc = await adminDb.collection("profiles").doc(user_id).get();

    if (!profileDoc.exists) {
      return NextResponse.json({ ok: true, profile: null });
    }

    return NextResponse.json({ ok: true, profile: profileDoc.data() });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || e });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, ...updates } = body;

    if (!user_id) {
      return NextResponse.json(
        { ok: false, error: "No user id provided" },
        { status: 400 },
      );
    }

    // Update the profile in Firestore
    await adminDb
      .collection("profiles")
      .doc(user_id)
      .set(updates, { merge: true });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Error updating profile:", e);
    return NextResponse.json(
      { ok: false, error: e.message || e },
      { status: 500 },
    );
  }
}
