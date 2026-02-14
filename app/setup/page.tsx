"use client";

import { useEffect, useState } from "react";

const SERVICE_ACCOUNT_EMAIL = "telegramcat@chat-teregram.iam.gserviceaccount.com";

interface UserInfo {
  displayName: string;
  pictureUrl?: string;
}

interface ExistingConfig {
  sheetId: string;
  driveFolderId: string;
  sheetVerified: boolean;
  driveVerified: boolean;
}

export default function SetupPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [sheetInput, setSheetInput] = useState("");
  const [driveInput, setDriveInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ sheetTitle: string; folderName: string } | null>(null);
  const [existingConfig, setExistingConfig] = useState<ExistingConfig | null>(null);

  useEffect(() => {
    fetch("/api/session")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          window.location.href = "/";
          return;
        }
        setUser(data.user);
        if (data.config) {
          setExistingConfig(data.config);
          setSheetInput(data.config.sheetId);
          setDriveInput(data.config.driveFolderId);
        }
        setLoading(false);
      })
      .catch(() => {
        window.location.href = "/";
      });
  }, []);

  function parseGoogleId(input: string): string {
    const trimmed = input.trim();
    // Try to extract Sheet ID from URL: /spreadsheets/d/{ID}/
    const sheetMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    if (sheetMatch) return sheetMatch[1];
    // Try to extract Drive Folder ID from URL: /folders/{ID}
    const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (folderMatch) return folderMatch[1];
    // Assume it's already an ID
    return trimmed;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(null);
    setSaving(true);

    const sheetId = parseGoogleId(sheetInput);
    const driveFolderId = parseGoogleId(driveInput);

    try {
      const res = await fetch("/api/save-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheetId, driveFolderId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "เกิดข้อผิดพลาด");
        setSaving(false);
        return;
      }

      setSuccess({ sheetTitle: data.sheetTitle, folderName: data.folderName });
      setExistingConfig({
        sheetId,
        driveFolderId,
        sheetVerified: true,
        driveVerified: true,
      });
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">กำลังโหลด...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          {user?.pictureUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.pictureUrl}
              alt=""
              className="w-10 h-10 rounded-full"
            />
          )}
          <div>
            <p className="text-sm text-gray-500">สวัสดี</p>
            <p className="font-semibold text-gray-900">{user?.displayName}</p>
          </div>
        </div>

        {/* Success message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-2">
            <p className="text-green-800 font-semibold text-lg">
              ตั้งค่าสำเร็จ!
            </p>
            <p className="text-green-700 text-sm">
              Sheet: {success.sheetTitle}
            </p>
            <p className="text-green-700 text-sm">
              Folder: {success.folderName}
            </p>
            <p className="text-green-700 mt-3">
              กลับไป LINE แล้วส่งรูปใบเสร็จได้เลย!
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">
            ขั้นตอนการตั้งค่า
          </h2>

          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex gap-3">
              <span className="bg-green-100 text-green-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
                1
              </span>
              <div>
                <p className="font-medium text-gray-800">สร้าง Google Sheet</p>
                <p>สร้าง Spreadsheet ใหม่ใน Google Sheets</p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="bg-green-100 text-green-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
                2
              </span>
              <div>
                <p className="font-medium text-gray-800">สร้าง Google Drive Folder</p>
                <p>สร้างโฟลเดอร์ใหม่ใน Google Drive สำหรับเก็บรูปใบเสร็จ</p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="bg-green-100 text-green-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
                3
              </span>
              <div>
                <p className="font-medium text-gray-800">แชร์ให้บอท (Editor)</p>
                <p>
                  แชร์ทั้ง Sheet และ Folder ให้อีเมล:
                </p>
                <button
                  type="button"
                  className="mt-1 bg-gray-100 text-gray-800 px-3 py-1.5 rounded-lg text-xs font-mono break-all text-left hover:bg-gray-200 transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(SERVICE_ACCOUNT_EMAIL);
                  }}
                  title="คลิกเพื่อคัดลอก"
                >
                  {SERVICE_ACCOUNT_EMAIL}
                  <span className="ml-2 text-gray-400">คัดลอก</span>
                </button>
                <p className="mt-1 text-amber-600">
                  สิทธิ์: Editor (ผู้แก้ไข)
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="bg-green-100 text-green-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
                4
              </span>
              <div>
                <p className="font-medium text-gray-800">วาง ID ด้านล่าง</p>
                <p>
                  คัดลอก URL หรือ ID ของ Sheet และ Folder มาวางด้านล่าง
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google Sheet ID หรือ URL
            </label>
            <input
              type="text"
              value={sheetInput}
              onChange={(e) => setSheetInput(e.target.value)}
              placeholder="วาง URL หรือ ID ของ Google Sheet"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              เช่น https://docs.google.com/spreadsheets/d/abc123.../edit
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google Drive Folder ID หรือ URL
            </label>
            <input
              type="text"
              value={driveInput}
              onChange={(e) => setDriveInput(e.target.value)}
              placeholder="วาง URL หรือ ID ของ Google Drive Folder"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              เช่น https://drive.google.com/drive/folders/abc123...
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            {saving ? "กำลังตรวจสอบ..." : existingConfig ? "อัปเดตและตรวจสอบ" : "ตรวจสอบและบันทึก"}
          </button>
        </form>

        {/* Existing config badge */}
        {existingConfig && !success && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
            คุณเคยตั้งค่าไว้แล้ว สามารถอัปเดตได้
          </div>
        )}
      </div>
    </main>
  );
}
