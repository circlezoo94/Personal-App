import { google } from "googleapis";

let prefetchPromise: Promise<string> | null = null;

export async function prefetchSheetData(): Promise<string> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY ?? "")
    .replace(/\\n/g, "\n")
    .replace(/^"|"$/g, "");
  const sheetId = process.env.SHEET_ID;
  const gid = process.env.SHEET_GID ?? "0";

  if (!email || !privateKey || !sheetId) {
    throw new Error("SHEET_URL_NOT_CONFIGURED");
  }

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  const sheet = meta.data.sheets?.find(
    (s) => String(s.properties?.sheetId) === String(gid)
  );
  const sheetName = sheet?.properties?.title ?? "Sheet1";

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: sheetName,
  });

  const rows = res.data.values ?? [];
  return rows
    .map((row) =>
      row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");
}

export function startPrefetch() {
  if (!prefetchPromise) {
    console.log("=== PREFETCH STARTED ===");
    prefetchPromise = prefetchSheetData()
      .then((data) => {
        console.log("=== PREFETCH COMPLETE ===");
        return data;
      })
      .catch((e) => {
        console.error("=== PREFETCH FAILED ===", e);
        prefetchPromise = null;
        throw e;
      });
  }
  return prefetchPromise;
}

export function getPrefetchedData() {
  return prefetchPromise;
}
