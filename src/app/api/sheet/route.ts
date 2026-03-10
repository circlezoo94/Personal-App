import { NextResponse } from "next/server";
import { startPrefetch } from "@/lib/prefetch";

let cache: { data: string; fetchedAt: number } | null = null;
const CACHE_TTL = 24 * 60 * 60 * 1000;

export async function GET() {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
    const ageMin = Math.floor((Date.now() - cache.fetchedAt) / 1000 / 60);
    return new NextResponse(cache.data, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "X-Cache": "HIT",
        "X-Cache-Age": `${ageMin}min`,
      },
    });
  }

  try {
    const csv = await startPrefetch();
    cache = { data: csv, fetchedAt: Date.now() };
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "X-Cache": "MISS",
      },
    });
  } catch (e) {
    console.error("=== SHEET API ERROR ===", e);
    return NextResponse.json({ error: "SHEET_FETCH_FAILED" }, { status: 500 });
  }
}
