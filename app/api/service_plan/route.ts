import { google } from "googleapis";
import { GoogleAuth, JWT } from "google-auth-library";
import { NextRequest, NextResponse } from "next/server";
import { ServicePlanData } from "../../(root)/service_plan/page";
import { serverCache, CACHE_KEYS, CACHE_TTL } from "@/lib/cache";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const Date = body["date"];
    const Headers = Object.keys(body["programs"][0]);

    console.log("Headers", Headers);

    const plans = [];
    plans.push(Headers);

    for (const plan of body["programs"]) {
      const anchors = plan["Anchors"];
      const anchorString = Array.isArray(anchors)
        ? anchors.join(", ")
        : anchors || "";
      const program = [plan["TimePeriod"], plan["Program"], anchorString];
      plans.push(program);
    }
    console.log(`Sheet Name: ${Date}\n Service Plan: ` + plans);
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

    const sheets = google.sheets({ version: "v4", auth });

    const addSheet = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: Date,
                gridProperties: {
                  rowCount: plans.length,
                  columnCount: Headers.length,
                },
              },
            },
          },
        ],
      },
    });

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${Date}!A:C`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: plans,
      },
    });

    return NextResponse.json({
      message: "successfully created Service Plan",
      Date: response,
    });
  } catch (e) {
    console.error("Error fetching members: ", e);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}

export async function GET() {
  console.log("🚀 Service Plans API route called");

  try {
    // Check server cache first
    const cachedPlans = serverCache.get(CACHE_KEYS.SERVICE_PLANS);
    if (cachedPlans) {
      console.log("✅ Returning cached service plans data");
      return NextResponse.json({
        data: cachedPlans,
        source: "cache",
        timestamp: new Date().toISOString(),
      });
    }

    console.log("📡 Fetching fresh service plans data from Google Sheets");

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

    const sheets = google.sheets({ version: "v4", auth });

    //Get sheet names
    const meta = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    const ranges = "!A:C";
    const sheetNames = meta.data.sheets
      ?.map((s) => s?.properties?.title ?? "")
      ?.slice(1);
    console.log(sheetNames);
    const sheetDates = sheetNames
      ?.filter((name) => name && name.length === 10) // YYYY-MM-DD format
      ?.sort((a, b) => b.localeCompare(a)) // Newest first
      ?.slice(0, 10); // Get more plans
    const sheetsToGet: string[] = [];

    for (const sName of sheetDates ?? []) {
      sheetsToGet.push(sName + ranges);
    }
    console.log(sheetsToGet);
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges: sheetsToGet,
    });

    const ServicePlans: { [key: string]: any } = {};

    response?.data?.valueRanges?.forEach((range) => {
      const date = range?.range?.split("!")[0]?.replace(/'/g, "") || "";

      if (range.values && range.values.length > 1) {
        // Convert raw data to proper format
        const programs = range.values.slice(1).map((row, index) => ({
          id: index.toString(),
          TimePeriod: row[0] || "",
          Program: row[1] || "",
          Anchors: row[2] ? row[2].split(", ") : [],
        }));

        ServicePlans[date] = programs;
      }
    });

    console.log("Final ServicePlans:", ServicePlans);

    // Cache the service plans data
    serverCache.set(
      CACHE_KEYS.SERVICE_PLANS,
      ServicePlans,
      CACHE_TTL.SERVICE_PLANS
    );
    console.log(
      "💾 Service plans data cached for",
      CACHE_TTL.SERVICE_PLANS,
      "seconds"
    );

    return NextResponse.json({
      data: ServicePlans,
      source: "fresh",
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Failed to fetch service plans:", e);
    return NextResponse.json(
      {
        error: "Failed to fetch service plans",
      },
      { status: 500 }
    );
  }
}
