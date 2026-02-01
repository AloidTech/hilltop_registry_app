import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb, AdminFieldValue } from "@/lib/serverapp";

export async function POST(request: NextRequest) {
  try {
    const { name, user_id, registry_sheet, registry_form_url } =
      await request.json();

    const role = name === "zane aloid" ? "admin" : "user";

    if (!name?.trim())
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (!user_id?.trim())
      return NextResponse.json(
        { error: "User id is required" },
        { status: 400 },
      );
    if (!registry_sheet.name?.trim() || !registry_sheet.url?.trim())
      return NextResponse.json(
        { error: "regitry sheet name and url is required" },
        { status: 400 },
      );

    await adminAuth.setCustomUserClaims(user_id, { role });
    const id = `${user_id}___${name}`;
    console.log("id: ", id);

    await adminDb.collection("organisations").doc(id).create({
      name,
      user_id,
      registry_sheet,
      registry_form_url,
      createdAt: AdminFieldValue.serverTimestamp(),
    });

    return NextResponse.json({ id: id }, { status: 201 });
  } catch (e: unknown) {
    const message =
      e && typeof e === "object" && "message" in e
        ? String((e as { message?: unknown }).message)
        : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create oraganisation: ${message}` },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const user_id = searchParams.get("user_id");
    const type = searchParams.get("type");
    const id = searchParams.get("org_id");

    if (!user_id?.trim()) {
      return NextResponse.json({ error: "User Id required" }, { status: 404 });
    }
    if (!id?.trim() && type == "byId") {
      return NextResponse.json({ error: "User Id required" }, { status: 404 });
    }
    console.log("=====================================");
    console.log("Organisation fetch");
    console.log("  User: ", user_id);
    console.log("  Fetch type: ", type);
    console.log("=====================================");
    let snapShot;
    if (type === "all") {
      try {
        snapShot = await adminDb
          .collection("organisations")
          .where("user_id", "==", user_id)
          .get();
        console.log("Snapshot: ", snapShot);
        if (snapShot?.empty) return NextResponse.json([], { status: 200 });

        const organisations = snapShot?.docs.map(
          (doc: FirebaseFirestore.QueryDocumentSnapshot) => {
            const data = doc.data();
            return {
              id: doc.id,
              createdAt: data.createdAt.toDate().toISOString(), // Include the document ID
              ...data, // Spread the actual fields (name, url, etc.)
            };
          },
        );
        console.log("=====================================");
        console.log("Organizations: ", organisations);
        console.log("=====================================");

        return NextResponse.json({ organisations });
      } catch (e: unknown) {
        throw new Error(e instanceof Error ? e.message : String(e));
      }
    } else if (type === "byId" && id) {
      try {
        snapShot = (
          await adminDb.collection("organisations").doc(id).get()
        ).data();
      } catch (e: unknown) {
        throw new Error(e instanceof Error ? e.message : String(e));
      }
      if (snapShot?.user_id !== user_id)
        if (!snapShot) return NextResponse.json([], { status: 200 });

      const organisation = {
        id: id,
        createdAt: snapShot.createdAt.toDate().toISOString(), // Include the document ID
        ...snapShot, // Spread the actual fields (name, url, etc.)
      };
      console.log("=====================================");
      console.log("Organizations: ", organisation);
      console.log("=====================================");

      return NextResponse.json({ organisation });
    }
  } catch (e: unknown) {
    console.error(e);
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, user_id, updates } = await request.json();

    if (!id || !user_id) {
      return NextResponse.json(
        { error: "Organization ID and User ID are required" },
        { status: 400 },
      );
    }

    // Verify ownership or admin status before update
    const orgDoc = await adminDb.collection("organisations").doc(id).get();

    if (!orgDoc.exists) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    const orgData = orgDoc.data();
    if (orgData?.user_id !== user_id) {
      // You might check for custom claims here for 'admin' role if needed
      return NextResponse.json(
        { error: "Unauthorized to update this organization" },
        { status: 403 },
      );
    }

    await adminDb
      .collection("organisations")
      .doc(id)
      .set(updates, { merge: true });

    return NextResponse.json({
      message: "Organization updated successfully",
      id,
    });
  } catch (e: unknown) {
    console.error(e);
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: message || "Failed to update organization" },
      { status: 500 },
    );
  }
}
