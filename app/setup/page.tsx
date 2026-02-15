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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ sheetTitle: string } | null>(null);
  const [existingConfig, setExistingConfig] = useState<ExistingConfig | null>(null);
  const [copied, setCopied] = useState(false);

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
        }
        setLoading(false);
      })
      .catch(() => {
        window.location.href = "/";
      });
  }, []);

  function parseGoogleId(input: string): string {
    const trimmed = input.trim();
    const sheetMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    if (sheetMatch) return sheetMatch[1];
    const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (folderMatch) return folderMatch[1];
    return trimmed;
  }

  function handleCopyEmail() {
    const input = document.querySelector<HTMLInputElement>('input[readonly]');
    if (input) {
      input.select();
      input.setSelectionRange(0, input.value.length);
    }
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(SERVICE_ACCOUNT_EMAIL).catch(() => {
          document.execCommand("copy");
        });
      } else {
        document.execCommand("copy");
      }
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(null);
    setSaving(true);

    const sheetId = parseGoogleId(sheetInput);

    try {
      const res = await fetch("/api/save-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheetId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "เกิดข้อผิดพลาด");
        setSaving(false);
        return;
      }

      setSuccess({ sheetTitle: data.sheetTitle });
      setExistingConfig({
        sheetId,
        driveFolderId: "",
        sheetVerified: true,
        driveVerified: false,
      });
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-5">
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

        {/* Success */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <p className="text-green-800 font-semibold">ตั้งค่าสำเร็จ!</p>
            <p className="text-green-700 text-sm mt-1">
              {success.sheetTitle}
            </p>
            <p className="text-green-700 text-sm mt-3">
              กลับไป LINE แล้วส่งรูปใบเสร็จได้เลย
            </p>
          </div>
        )}

        {/* Existing config badge */}
        {existingConfig && !success && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
            คุณเคยตั้งค่าไว้แล้ว สามารถอัปเดตได้
          </div>
        )}

        {/* Share email — always visible */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm font-medium text-gray-800 mb-2">
            แชร์ Sheet ให้อีเมลนี้เป็น <span className="text-amber-600">Editor</span>
          </p>
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              readOnly
              value={SERVICE_ACCOUNT_EMAIL}
              className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-mono text-gray-700 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
              onFocus={(e) => e.target.select()}
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              type="button"
              className={`shrink-0 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                copied
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300"
              }`}
              onClick={handleCopyEmail}
            >
              {copied ? "คัดลอกแล้ว" : "คัดลอก"}
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google Sheet
            </label>
            <input
              type="text"
              value={sheetInput}
              onChange={(e) => setSheetInput(e.target.value)}
              placeholder="วาง URL หรือ ID"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              required
            />
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
            {saving ? "กำลังตรวจสอบ..." : existingConfig ? "อัปเดต" : "บันทึก"}
          </button>
        </form>
      </div>
    </main>
  );
}
