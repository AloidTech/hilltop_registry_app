import { google } from "googleapis";
import { JWT } from "google-auth-library";
import { NextRequest, NextResponse } from "next/server";
import { serverCache, CACHE_KEYS, CACHE_TTL } from "@/lib/cache";
import { adminDb } from "@/lib/serverapp";

export async function DELETE(request: NextRequest) {
  console.log("Deleting member");

  try {
    const body = await request.json();
    const memebers = body["members"];
    const org_id = body["org_id"];

    // Get spreadsheet ID from environment variables OR org_id
    let spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    // Decode org_id if it's encoded
    const clean_org_id = org_id ? decodeURIComponent(org_id).trim() : null;
    console.log("Org id: ", org_id);
    if (clean_org_id) {
      const doc = await adminDb
        .collection("organisations")
        .doc(clean_org_id)
        .get();
      if (doc.exists) {
        const data = doc.data();
        const url = data?.registry_sheet?.url;
        const match = url?.match(/\/d\/(.*?)(\/|$)/);
        if (match && match[1]) {
          spreadsheetId = match[1];
        }
      }
    }
    if (!process.env.GOOGLE_PRIVATE_KEY_BASE64) {
      throw new Error(
        "GOOGLE_PRIVATE_KEY_BASE64 environment variable is not set",
      );
    }
    if (!spreadsheetId) {
      throw new Error("GOOGLE_SPREADSHEET_ID environment variable is not set");
    }
    const private_key = Buffer.from(
      process.env.GOOGLE_PRIVATE_KEY_BASE64,
      "base64",
    ).toString("utf8");

    const auth = new JWT({
      email: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_EMAIL,
      key: private_key?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    // Create a new Sheets API client.
    const sheet = google.sheets({ version: "v4", auth });

    const response = sheet.spreadsheets.values.get({
      spreadsheetId,
      range: "A:F",
    });
    const rows = (await response).data.values || [];
    const dataRows = rows.slice(1);

    const findRowIndex = (searchValue: string, columnIndex: number) => {
      return dataRows.findIndex((row) => row[columnIndex] === searchValue);
    };

    const rowsToDelete: number[] = [];
    memebers.array.forEach((member: string) => {
      const memberIndex = findRowIndex(member, 1);
      if (memberIndex != -1) {
        rowsToDelete.push(memberIndex + 1); //To offset Header slice and base 1 indexing
      }
    });

    rowsToDelete.sort((a, b) => b - a);

    const requests = rowsToDelete.map((rowNumber) => ({
      deleteDimension: {
        range: {
          sheetId: 0,
          dimension: "ROWS",
          startIndex: rowNumber,
          endIndex: rowNumber + 1,
        },
      },
    }));

    //Execute Delete
    await sheet.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: requests },
    });
  } catch (e) {
    console.error("Error deleting members: ", e);
    return NextResponse.json(
      { error: "Failed to delete members" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  console.log("🚀 Members API route called");

  try {
    const { searchParams } = new URL(request.url);
    const org_id = searchParams.get("org_id");

    const cacheKey = org_id
      ? `${CACHE_KEYS.ALL_MEMBERS}_${org_id}`
      : CACHE_KEYS.ALL_MEMBERS;

    // Check server cache first
    const cachedMembers = serverCache.get(cacheKey);
    if (cachedMembers) {
      console.log("✅ Returning cached members data");
      return NextResponse.json({
        data: cachedMembers,
        source: "cache",
        timestamp: new Date().toISOString(),
      });
    }

    console.log("📡 Fetching fresh members data from Google Sheets");

    // Get spreadsheet ID from environment variables OR org_id
    let spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    // Decode org_id if it's encoded
    const clean_org_id = org_id ? decodeURIComponent(org_id).trim() : null;

    if (clean_org_id) {
      const doc = await adminDb
        .collection("organisations")
        .doc(clean_org_id)
        .get();
      if (doc.exists) {
        const data = doc.data();
        const url = data?.registry_sheet?.url;
        const match = url?.match(/\/d\/(.*?)(\/|$)/);
        if (match && match[1]) {
          spreadsheetId = match[1];
        }
      }
    }
    if (!process.env.GOOGLE_PRIVATE_KEY_BASE64) {
      throw new Error(
        "GOOGLE_PRIVATE_KEY_BASE64 environment variable is not set",
      );
    }
    if (!spreadsheetId) {
      throw new Error("GOOGLE_SPREADSHEET_ID environment variable is not set");
    }
    const private_key = Buffer.from(
      process.env.GOOGLE_PRIVATE_KEY_BASE64,
      "base64",
    ).toString("utf8");

    const auth = new JWT({
      email: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_EMAIL,
      key: private_key?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    }); /*
    const auth = new google.auth.GoogleAuth({
      keyFile: "./cred3.json",
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });*/

    // Create a new Sheets API client.
    const service = google.sheets({ version: "v4", auth });

    const response = await service.spreadsheets.values.get({
      spreadsheetId,
      range: "A:M",
    });

    const rows = response.data.values ?? [];

    const members =
      rows?.slice(1).map((row, index) => ({
        id: (index + 1).toString(),
        name: row[1] || "", // ✅ Correct: first column
        email: row[2] || "",
        number: row[3] || null,
        maleGNum: row[4] || null,
        maleGName: row[5] || null,
        femaleGName: row[6] || null,
        femaleGNum: row[7] || null,
        houseAddress: row[8] || null,
        birthDay: row[9] || null,
        sex: row[10] || null,
        role: row[11] || null,
        team: row[12] || null,
      })) || [];

    // Cache the members data
    serverCache.set(cacheKey, members, CACHE_TTL.MEMBERS);
    console.log("💾 Members data cached for", CACHE_TTL.MEMBERS, "seconds");
    console.log("📡 Response received:", members, "rows: ", rows);
    return NextResponse.json({
      data: members,
      source: "fresh",
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Error fetching members: ", e);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 },
    );
  }
}
