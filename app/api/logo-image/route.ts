import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const imagePath = path.join(
    process.cwd(),
    "assets",
    "c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_7465701dbcaaa42619be9d912ff65c04_images_64625-5cd8d599-da28-4eb2-ab72-0f72094885b3.png",
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
