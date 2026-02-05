import { fetchLogoUrl } from "../../../lib/logoSearch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const fetched = await fetchLogoUrl("TinyFish Mino AI logo");
  const url = fetched ?? "/api/logo-image";
  return Response.json({ url });
}
