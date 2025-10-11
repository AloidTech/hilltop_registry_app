import { google } from "googleapis";
import { JWT } from "google-auth-library";
import { NextRequest, NextResponse } from "next/server";
import { serverCache, CACHE_KEYS, CACHE_TTL } from "@/lib/cache";

export async function DELETE(request: NextRequest) {
  console.log("Deleting member");

  try {
    const body = await request.json();
    const memebers = body["members"];
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
      { status: 500 }
    );
  }
}

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
    serverCache.set(CACHE_KEYS.ALL_MEMBERS, members, CACHE_TTL.MEMBERS);
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
      { status: 500 }
    );
  }
}
