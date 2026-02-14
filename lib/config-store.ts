import { google } from "googleapis";

const CONFIG_SHEET_ID = process.env.CONFIG_SHEET_ID!;
const CONFIGS_TAB = "configs";
const CONFIGS_HEADERS = [
  "LINE User ID",
  "Display Name",
  "Picture URL",
  "Sheet ID",
  "Drive Folder ID",
  "Sheet Verified",
  "Drive Verified",
  "Updated At",
];

interface UserConfig {
  line_user_id: string;
  display_name: string;
  picture_url?: string;
  google_sheet_id: string;
  google_drive_folder_id: string;
  sheet_verified: boolean;
  drive_verified: boolean;
}

function getAuth() {
  const key = JSON.parse(
    Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!, "base64").toString()
  );
  return new google.auth.GoogleAuth({
    credentials: key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

async function ensureConfigsTab(
  sheets: ReturnType<typeof google.sheets>
): Promise<void> {
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: CONFIG_SHEET_ID,
  });

  const exists = spreadsheet.data.sheets?.find(
    (s) => s.properties?.title === CONFIGS_TAB
  );
  if (exists) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: CONFIG_SHEET_ID,
    requestBody: {
      requests: [{ addSheet: { properties: { title: CONFIGS_TAB } } }],
    },
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: CONFIG_SHEET_ID,
    range: `'${CONFIGS_TAB}'!A1:H1`,
    valueInputOption: "RAW",
    requestBody: { values: [CONFIGS_HEADERS] },
  });
}

export async function getUserConfig(
  lineUserId: string
): Promise<UserConfig | null> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  await ensureConfigsTab(sheets);

  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: CONFIG_SHEET_ID,
    range: `'${CONFIGS_TAB}'!A2:H`,
  });

  const rows = result.data.values || [];
  const row = rows.find((r) => r[0] === lineUserId);
  if (!row) return null;

  return {
    line_user_id: row[0],
    display_name: row[1] || "",
    picture_url: row[2] || undefined,
    google_sheet_id: row[3] || "",
    google_drive_folder_id: row[4] || "",
    sheet_verified: row[5] === "true",
    drive_verified: row[6] === "true",
  };
}

export async function upsertUserConfig(config: {
  line_user_id: string;
  display_name: string;
  picture_url?: string;
  google_sheet_id: string;
  google_drive_folder_id: string;
  sheet_verified: boolean;
  drive_verified: boolean;
}): Promise<UserConfig | null> {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });
    await ensureConfigsTab(sheets);

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: CONFIG_SHEET_ID,
      range: `'${CONFIGS_TAB}'!A2:H`,
    });

    const rows = result.data.values || [];
    const rowIndex = rows.findIndex((r) => r[0] === config.line_user_id);
    const rowData = [
      config.line_user_id,
      config.display_name,
      config.picture_url || "",
      config.google_sheet_id,
      config.google_drive_folder_id,
      String(config.sheet_verified),
      String(config.drive_verified),
      new Date().toISOString(),
    ];

    if (rowIndex >= 0) {
      const sheetRow = rowIndex + 2;
      await sheets.spreadsheets.values.update({
        spreadsheetId: CONFIG_SHEET_ID,
        range: `'${CONFIGS_TAB}'!A${sheetRow}:H${sheetRow}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [rowData] },
      });
    } else {
      await sheets.spreadsheets.values.append({
        spreadsheetId: CONFIG_SHEET_ID,
        range: `'${CONFIGS_TAB}'!A:H`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [rowData] },
      });
    }

    return {
      line_user_id: config.line_user_id,
      display_name: config.display_name,
      picture_url: config.picture_url,
      google_sheet_id: config.google_sheet_id,
      google_drive_folder_id: config.google_drive_folder_id,
      sheet_verified: config.sheet_verified,
      drive_verified: config.drive_verified,
    };
  } catch (error) {
    console.error("Config upsert failed:", error);
    return null;
  }
}
