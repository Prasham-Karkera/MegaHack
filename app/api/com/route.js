import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const payload = await request.json();

    if (!payload.command || typeof payload.command !== "string") {
      return NextResponse.json(
        { error: "Invalid command format" },
        { status: 400 }
      );
    }

    if (!payload.timestamp) {
      payload.timestamp = new Date().toISOString();
    }

    const response = await fetch(
      "https://3cfc-103-208-226-238.ngrok-free.app/command",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }, 
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error forwarding command:", error);
    return NextResponse.json(
      { error: "Failed to process command", message: error.message },
      { status: 500 }
    );
  }
}
