import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const imagePath = path.join(process.cwd(), "64625.webp");
  try {
    const data = await fs.readFile(imagePath);
    return new Response(data, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
