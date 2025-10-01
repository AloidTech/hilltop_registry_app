import { Credentials } from "./../../../node_modules/gtoken/build/esm/src/index.d";
import { google } from "googleapis";
import { GoogleAuth } from "google-auth-library";
import { NextResponse } from "next/server";
import { Member } from "../../(root)/page";

export async function GET() {
  console.log("🚀 API route called");
  try {
    //SpreedSheet id
    const spreadsheetId = "1UWuNgra7x1Im0sik9fFoOjZxlIOQI6Hlccz39l7agcU";
    console.log("📊 Spreadsheet ID:", spreadsheetId);

    const auth = new GoogleAuth({
      keyFile: "credentials.json",
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

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

    return NextResponse.json({ members });
  } catch (e) {
    console.error("Error fetching members: ", e);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}
