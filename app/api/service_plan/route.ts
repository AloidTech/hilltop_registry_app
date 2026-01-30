import { google } from "googleapis";
import { JWT } from "google-auth-library";
import { NextRequest, NextResponse } from "next/server";
import { serverCache, CACHE_KEYS, CACHE_TTL } from "@/lib/cache";
import { adminDb } from "@/lib/serverapp";

interface ServicePlanProp {
  id: string;
  TimePeriod: string;
  Program: string;
  Anchors: Array<string>;
  BackupAnchors: Array<string>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const Date = body["date"];
    const org_id = body["org_id"];
    const Headers = Object.keys(body["programs"][0]);

    console.log("Headers", Headers);

    const plans = [];
    plans.push(Headers);

    for (const plan of body["programs"]) {
      const anchors = plan["Anchors"];
      const BackupAnchors = plan["BackupAnchors"];
      const anchorString = Array.isArray(anchors)
        ? anchors.join(", ")
        : anchors || "";
      const backAnchorString = Array.isArray(BackupAnchors)
        ? BackupAnchors.join(", ")
        : BackupAnchors || "";
      const program = [
        plan["TimePeriod"],
        plan["Program"],
        anchorString,
        backAnchorString,
      ];
      plans.push(program);
    }
    console.log(`Sheet Name: ${Date}\n Service Plan: ` + plans);
    let spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    // Decode org_id if it's encoded or contains extra characters
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
      email:
        process.env.GOOGLE_CLIENT_EMAIL ||
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_EMAIL,
      key: private_key?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.batchUpdate({
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
      range: `${Date}!A:D`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: plans,
      },
    });

    return NextResponse.json({
      message: "successfully created Service Plan",
      Date: response,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Error posting service plan: ", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  console.log("🚀 Service Plans API route called");

  try {
    const { searchParams } = new URL(request.url);
    const org_id = searchParams.get("org_id");

    const cacheKey = org_id
      ? `${CACHE_KEYS.SERVICE_PLANS}_${org_id}`
      : CACHE_KEYS.SERVICE_PLANS;

    // Check server cache first
    const cachedPlans = serverCache.get(cacheKey);
    if (cachedPlans) {
      console.log("✅ Returning cached service plan data");
      return NextResponse.json({
        data: cachedPlans,
        source: "cache",
        timestamp: new Date().toISOString(),
      });
    }

    console.log("📡 Fetching fresh service plan data from Google Sheets");

    let spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    // Decode org_id if it's encoded or contains extra characters
    const clean_org_id = org_id ? decodeURIComponent(org_id).trim() : null;
    console.log(`Processing org_id: '${org_id}', clean: '${clean_org_id}'`);

    if (clean_org_id) {
      try {
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
        } else {
          console.warn(
            `Organization document not found for id: ${clean_org_id}`,
          );
        }
      } catch (error) {
        console.error(`Error fetching organization doc: ${error}`);
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

    const sheets = google.sheets({ version: "v4", auth });

    //Get sheet names
    const meta = await sheets.spreadsheets.get({
      spreadsheetId,
    });
    console.log("Made it");
    const ranges = "!A:D";
    const sheetNames = meta.data.sheets
      ?.map((s) => s?.properties?.title ?? "")
      ?.slice(1);
    console.log(sheetNames);
    const sheetDates = sheetNames
      ?.filter((name) => name && name.length === 10) // YYYY-MM-DD format
      ?.sort((a, b) => b.localeCompare(a)) // Newest first
      ?.slice(0, 10); // Get more plan
    const sheetsToGet: string[] = [];

    for (const sName of sheetDates ?? []) {
      sheetsToGet.push(sName + ranges);
    }
    console.log(sheetsToGet);
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges: sheetsToGet,
    });

    const ServicePlans: { [key: string]: ServicePlanProp[] } = {};

    response?.data?.valueRanges?.forEach((range) => {
      const date = range?.range?.split("!")[0]?.replace(/'/g, "") || "";

      if (range.values && range.values.length > 1) {
        // Convert raw data to proper format
        const programs = range.values.slice(1).map((row, index) => ({
          id: index.toString(),
          TimePeriod: row[0] || "",
          Program: row[1] || "",
          Anchors: row[2] ? row[2].split(", ") : [],
          BackupAnchors: row[3] ? row[3].split(", ") : [],
        }));
        console.log("Data: ", programs);
        ServicePlans[date] = programs;
      }
    });

    console.log("Final ServicePlans:", ServicePlans);

    // Cache the service plan data
    serverCache.set(cacheKey, ServicePlans, CACHE_TTL.SERVICE_PLANS);
    console.log(
      "💾 Service plan data cached for",
      CACHE_TTL.SERVICE_PLANS,
      "seconds",
    );

    return NextResponse.json({
      data: ServicePlans,
      source: "fresh",
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Failed to fetch service plan:", e);
    return NextResponse.json(
      {
        error: `Failed to fetch service plan: ${e instanceof Error ? e.message : String(e)}`,
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { originalDate, date, programs } = body;

    if (!originalDate) {
      return NextResponse.json(
        { error: "Original date is required" },
        { status: 400 },
      );
    }

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
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
      email:
        process.env.GOOGLE_CLIENT_EMAIL ||
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_EMAIL,
      key: private_key?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // If date changed, rename the sheet
    if (originalDate !== date) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              updateSheetProperties: {
                properties: {
                  sheetId: await getSheetId(
                    sheets,
                    spreadsheetId,
                    originalDate,
                  ),
                  title: date,
                },
                fields: "title",
              },
            },
          ],
        },
      });
    }

    // Prepare data rows
    const Headers = ["TimePeriod", "Program", "Anchors", "BackupAnchors"];
    const plans = [Headers];

    for (const plan of programs) {
      const anchors = plan.Anchors;
      const BackupAnchors = plan.BackupAnchors;
      const anchorString = Array.isArray(anchors)
        ? anchors.join(", ")
        : anchors || "";
      const backAnchorString = Array.isArray(BackupAnchors)
        ? BackupAnchors.join(", ")
        : BackupAnchors || "";
      const program = [
        plan.TimePeriod,
        plan.Program,
        anchorString,
        backAnchorString,
      ];
      plans.push(program);
    }

    // Clear existing data and write new data
    const sheetName = date;
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${sheetName}!A:D`,
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1:D${plans.length}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: plans,
      },
    });

    // Invalidate cache by setting the key to undefined with zero TTL so it expires immediately
    serverCache.set(CACHE_KEYS.SERVICE_PLANS, undefined, 0);

    return NextResponse.json({
      message: "Service plan updated successfully",
      date: sheetName,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Error updating service plan:", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Helper to get sheet ID by title
async function getSheetId(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  title: string,
): Promise<number> {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = meta.data.sheets?.find((s) => s.properties?.title === title);
  if (!sheet?.properties?.sheetId) {
    throw new Error(`Sheet with title "${title}" not found`);
  }
  return sheet.properties.sheetId;
}
