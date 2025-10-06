import { NextResponse } from "next/server";
import { serverCache } from "@/lib/cache";

export async function POST() {
  try {
    // Clear all cache
    serverCache.clear();
    console.log("🗑️ All server cache cleared");

    return NextResponse.json({
      message: "Cache cleared successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error clearing cache:", error);
    return NextResponse.json(
      { error: "Failed to clear cache" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // Run cleanup to remove expired items
    serverCache.cleanup();
    console.log("🧹 Cache cleanup completed");

    return NextResponse.json({
      message: "Cache cleanup completed",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error during cache cleanup:", error);
    return NextResponse.json(
      { error: "Failed to cleanup cache" },
      { status: 500 }
    );
  }
}
