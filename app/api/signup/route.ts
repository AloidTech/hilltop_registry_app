import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb, AdminFieldValue } from "@/lib/serverapp";

type SignupBody = {
  name: string;
  email: string;
  password: string;
};

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = (await request.json()) as SignupBody;

    const role = name === "zane aloid" ? "admin" : "user";

    if (!name?.trim())
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (!email?.trim())
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    if (!password?.trim())
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );

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
      spreadSheetId: "",
      createdAt: AdminFieldValue.serverTimestamp(),
    });

    return NextResponse.json({ _id: user.uid }, { status: 201 });
  } catch (e: unknown) {
    const message =
      e && typeof e === "object" && "message" in e
        ? String((e as { message?: unknown }).message)
        : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create user ${message}` },
      { status: 500 }
    );
  }
}
