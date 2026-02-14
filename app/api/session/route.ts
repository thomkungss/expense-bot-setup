import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUserConfig } from "@/lib/config-store";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const config = await getUserConfig(session.lineUserId);

  return NextResponse.json({
    authenticated: true,
    user: {
      displayName: session.displayName,
      pictureUrl: session.pictureUrl,
    },
    config: config
      ? {
          sheetId: config.google_sheet_id,
          driveFolderId: config.google_drive_folder_id,
          sheetVerified: config.sheet_verified,
          driveVerified: config.drive_verified,
        }
      : null,
  });
}
