import { fetchLogoUrl } from "../../../lib/logoSearch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const url = "/api/logo-image";
  return Response.json({ url });
}
