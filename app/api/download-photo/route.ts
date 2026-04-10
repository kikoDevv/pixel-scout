import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { downloadUrl, filename } = await request.json();

    if (!downloadUrl) {
      return NextResponse.json({ error: "Download URL is required" }, { status: 400 });
    }

    // Fetch the file from Firebase Storage on the server
    const response = await fetch(downloadUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();

    // Return the file with proper headers
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": `attachment; filename="${filename || "photo.jpg"}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Content-Length": arrayBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("Error downloading photo:", error);
    return NextResponse.json({ error: "Failed to download photo" }, { status: 500 });
  }
}
