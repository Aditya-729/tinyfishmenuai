import { fetchLogoUrl } from "../../../lib/logoSearch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const url =
    (await fetchLogoUrl("TinyFishMenuAI logo")) ??
    "/api/logo-image" ??
    "/logo.svg";
  return Response.json({ url });
}
