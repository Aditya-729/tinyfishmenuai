import { fetchLogoUrl } from "../../../lib/logoSearch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const url = "/tinyfish-logo.png";
  return Response.json({ url });
}
