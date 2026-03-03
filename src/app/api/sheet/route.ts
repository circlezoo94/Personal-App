import { NextResponse } from "next/server";
import { google } from "googleapis";

let cache: { data: string; fetchedAt: number } | null = null;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24시간

export async function GET() {
  try {
    // 캐시가 유효하면 바로 반환
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

    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = (process.env.GOOGLE_PRIVATE_KEY ?? "")
      .replace(/\\n/g, "\n")
      .replace(/^"|"$/g, ""); // 앞뒤 따옴표 제거
    const sheetId = process.env.SHEET_ID;
    const gid = process.env.SHEET_GID ?? "0";

    if (!email || !privateKey || !sheetId) {
      return NextResponse.json({ error: "SHEET_URL_NOT_CONFIGURED" }, { status: 500 });
    }

    const auth = new google.auth.JWT({
      email,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // gid로 시트 이름 찾기
    const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    const sheet = meta.data.sheets?.find(
      (s) => String(s.properties?.sheetId) === String(gid)
    );
    const sheetName = sheet?.properties?.title ?? "Sheet1";

    // 데이터 fetch
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: sheetName,
    });

    const rows = res.data.values ?? [];

    // 2D 배열 → CSV 변환
    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    cache = { data: csv, fetchedAt: Date.now() };

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "X-Cache": "MISS",
      },
    });
  } catch {
    return NextResponse.json({ error: "SHEET_FETCH_FAILED" }, { status: 500 });
  }
}
