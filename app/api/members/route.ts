import { google } from "googleapis";
import { GoogleAuth } from "google-auth-library";
import { NextResponse } from "next/server";

export async function GET() {
  console.log("🚀 API route called");
  try {
    // Get spreadsheet ID from environment variables
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) {
      throw new Error("GOOGLE_SPREADSHEET_ID environment variable is not set");
    }
    console.log("📊 Spreadsheet ID:", spreadsheetId);

    const auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
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
