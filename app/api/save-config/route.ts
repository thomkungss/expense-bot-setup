import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { verifySheetAccess, verifyDriveAccess } from "@/lib/google";
import { upsertUserConfig } from "@/lib/config-store";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
  }

  const body = await request.json();
  const { sheetId, driveFolderId } = body;

  if (!sheetId || !driveFolderId) {
    return NextResponse.json(
      { error: "กรุณากรอก Sheet ID และ Drive Folder ID" },
      { status: 400 }
    );
  }

  // Verify Sheet access
  const sheetResult = await verifySheetAccess(sheetId);
  if (!sheetResult.ok) {
    return NextResponse.json(
      {
        error: `ไม่สามารถเข้าถึง Google Sheet ได้: ${sheetResult.error}`,
        field: "sheetId",
      },
      { status: 400 }
    );
  }

  // Verify Drive access
  const driveResult = await verifyDriveAccess(driveFolderId);
  if (!driveResult.ok) {
    return NextResponse.json(
      {
        error: `ไม่สามารถเข้าถึง Google Drive Folder ได้: ${driveResult.error}`,
        field: "driveFolderId",
      },
      { status: 400 }
    );
  }

  // Save to Supabase
  const saved = await upsertUserConfig({
    line_user_id: session.lineUserId,
    display_name: session.displayName,
    picture_url: session.pictureUrl,
    google_sheet_id: sheetId,
    google_drive_folder_id: driveFolderId,
    sheet_verified: true,
    drive_verified: true,
  });

  if (!saved) {
    return NextResponse.json(
      { error: "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    sheetTitle: sheetResult.title,
    folderName: driveResult.name,
  });
}
