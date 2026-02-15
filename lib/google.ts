import { google } from "googleapis";

function getServiceAccountAuth() {
  const key = JSON.parse(
    Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!, "base64").toString()
  );
  return new google.auth.GoogleAuth({
    credentials: key,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
    ],
  });
}

export async function verifySheetAccess(
  sheetId: string
): Promise<{ ok: boolean; title?: string; error?: string }> {
  try {
    const auth = getServiceAccountAuth();
    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    return { ok: true, title: res.data.properties?.title || "" };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: message };
  }
}

export async function verifyDriveAccess(
  folderId: string
): Promise<{ ok: boolean; name?: string; error?: string }> {
  try {
    const auth = getServiceAccountAuth();
    const drive = google.drive({ version: "v3", auth });
    const res = await drive.files.get({
      fileId: folderId,
      fields: "id,name,mimeType",
    });
    if (
      res.data.mimeType !== "application/vnd.google-apps.folder"
    ) {
      return { ok: false, error: "ไม่ใช่โฟลเดอร์ กรุณาใส่ Folder ID" };
    }
    return { ok: true, name: res.data.name || "" };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: message };
  }
}
