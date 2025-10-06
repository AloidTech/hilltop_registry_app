import { google } from "googleapis";
import { JWT } from "google-auth-library";
import { NextResponse } from "next/server";
import { serverCache, CACHE_KEYS, CACHE_TTL } from "@/lib/cache";

export async function GET() {
  console.log("🚀 Members API route called");

  try {
    // Check server cache first
    const cachedMembers = serverCache.get(CACHE_KEYS.ALL_MEMBERS);
    if (cachedMembers) {
      console.log("✅ Returning cached members data");
      return NextResponse.json({
        data: cachedMembers,
        source: "cache",
        timestamp: new Date().toISOString(),
      });
    }

    console.log("📡 Fetching fresh members data from Google Sheets");

    // Get spreadsheet ID from environment variables
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!process.env.GOOGLE_PRIVATE_KEY_BASE64) {
      throw new Error(
        "GOOGLE_PRIVATE_KEY_BASE64 environment variable is not set"
      );
    }
    if (!spreadsheetId) {
      throw new Error("GOOGLE_SPREADSHEET_ID environment variable is not set");
    }
    const private_key = Buffer.from(
      process.env.GOOGLE_PRIVATE_KEY_BASE64,
      "base64"
    ).toString("utf8");

    const auth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
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
      range: "A:F",
    });
    console.log("📡 Response received:", response.data);

    const rows = response.data.values ?? [];

    const members =
      rows?.slice(1).map((row, index) => ({
        id: (index + 1).toString(),
        name: row[1] || "", // ✅ Correct: first column
        email: row[2] || "",
        number: row[3] || null, // ✅ Correct: second column
        parentNum: row[4] || null,
        role: row[5] || null, // ✅ Correct: fourth column
        team: row[6] || null, // ✅ Correct: fifth column
      })) || [];

    // Cache the members data
    serverCache.set(CACHE_KEYS.ALL_MEMBERS, members, CACHE_TTL.MEMBERS);
    console.log("💾 Members data cached for", CACHE_TTL.MEMBERS, "seconds");

    return NextResponse.json({
      data: members,
      source: "fresh",
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Error fetching members: ", e);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}
