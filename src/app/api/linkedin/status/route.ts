/**
 * LinkedIn API Status Check
 *
 * GET /api/linkedin/status
 * Validates Apify API key and returns status
 */

import { NextResponse } from "next/server";
import { isApifyConfigured, getApifyApiKey } from "@/lib/env";

interface StatusResponse {
  status: "valid" | "invalid" | "not_configured" | "error";
  message?: string;
  username?: string;
}

export async function GET(): Promise<NextResponse<StatusResponse>> {
  // Check if Apify is configured
  if (!isApifyConfigured()) {
    return NextResponse.json({
      status: "not_configured",
      message: "APIFY_API_KEY is not set in environment variables",
    });
  }

  try {
    const apiKey = getApifyApiKey();

    // Test API key validity against Apify users/me endpoint
    const response = await fetch("https://api.apify.com/v2/users/me", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        status: "valid",
        username: data.data?.username || "unknown",
        message: "Apify API key is valid and working",
      });
    }

    // Handle specific error codes
    if (response.status === 401) {
      return NextResponse.json({
        status: "invalid",
        message: "Apify API key is invalid or expired",
      });
    }

    return NextResponse.json({
      status: "invalid",
      message: `API key validation failed with status: ${response.status}`,
    });
  } catch (error) {
    console.error("[LinkedIn Status] Error checking API key:", error);
    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}
