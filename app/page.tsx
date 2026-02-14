export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-gray-900">
            เหมียวบันทึก
          </h1>
          <p className="text-lg text-gray-600">
            บอทบันทึกค่าใช้จ่ายจากใบเสร็จ
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 text-left">
          <h2 className="text-lg font-semibold text-gray-800">
            ทำอะไรได้บ้าง?
          </h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex gap-3">
              <span className="text-green-500 font-bold">1</span>
              <span>ถ่ายรูปใบเสร็จส่งให้บอทใน LINE</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500 font-bold">2</span>
              <span>AI อ่านข้อมูล วันที่ ร้านค้า ยอดเงิน อัตโนมัติ</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500 font-bold">3</span>
              <span>บันทึกลง Google Sheets ของคุณเอง</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500 font-bold">4</span>
              <span>พิมพ์ &quot;สรุป&quot; เพื่อดูยอดรายเดือน</span>
            </li>
          </ul>
        </div>

        <a
          href="/api/line-login"
          className="inline-flex items-center justify-center w-full gap-3 bg-[#06C755] hover:bg-[#05b04c] text-white font-semibold py-4 px-6 rounded-xl text-lg transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
          </svg>
          เข้าสู่ระบบด้วย LINE
        </a>

        <p className="text-sm text-gray-400">
          เข้าสู่ระบบเพื่อเชื่อมต่อ Google Sheets กับบอท
        </p>
      </div>
    </main>
  );
}
