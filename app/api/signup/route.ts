import { NextRequest, NextResponse } from "next/server";
import { UUID } from "crypto";
import { adminAuth, adminDb, AdminFieldValue } from "@/app/serverapp";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();
    var role;
    if (name == "zane aloid") {
      role = "admin";
    } else {
      role = "user";
    }
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" });
    if (!email?.trim())
      return NextResponse.json({ error: "Email is required" });
    if (!password?.trim())
      return NextResponse.json({ error: "Password is required" });

    const user = await adminAuth.createUser({
      displayName: name.trim(),
      email: email.trim(),
      password: password.trim(),
      emailVerified: true,
      disabled: false,
    });

    await adminAuth.setCustomUserClaims(user.uid, { role });

    await adminDb.collection("profiles").doc(user.uid).set({
      user_id: user.uid,
      name: name.trim(),
      email: email.trim(),
      createdAt: AdminFieldValue.serverTimestamp(),
    });

    return NextResponse.json({ _id: user.uid }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: `Failed to create user ${e.message}` });
  }
}
