import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const imagePath = path.join(
    process.cwd(),
    "assets",
    "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_7465701dbcaaa42619be9d912ff65c04_images_image-d4a8b809-3fb7-4a6f-b42d-18a9cf18f6ec.png",
  );
  try {
    const data = await fs.readFile(imagePath);
    return new Response(data, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
