"use client";

/**
 * eKYC Demo - Tích hợp trực tiếp theo tài liệu VNPT eKYC Web SDK ver 3.2.0.0
 *
 * File này tích hợp ĐÚNG THEO TÀI LIỆU, không dùng wrapper/abstraction
 */

import React, { useEffect, useRef, useState } from "react";

// ===========================
// DECLARE GLOBAL WINDOW.SDK
// ===========================
declare global {
  interface Window {
    SDK: {
      launch: (config: any) => void;
      viewResult: (typeDocument: any, result: any) => void;
    };
  }
}

const EkycDemoPage: React.FC = () => {
  const [isSDKReady, setIsSDKReady] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [configValid, setConfigValid] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // ===========================
  // CONFIG THEO TÀI LIỆU - Lấy từ .env.local
  // ===========================
  const BACKEND_URL =
    process.env.NEXT_PUBLIC_EKYC_BACKEND_URL || "https://api.idg.vnpt.vn";
  const TOKEN_KEY = process.env.NEXT_PUBLIC_EKYC_TOKEN_KEY || "";
  const TOKEN_ID = process.env.NEXT_PUBLIC_EKYC_TOKEN_ID || "";
  const ACCESS_TOKEN = process.env.NEXT_PUBLIC_EKYC_AUTH_TOKEN || "";

  // Validate credentials on mount
  useEffect(() => {
    console.log("⚙️ Credentials loaded from .env.local:");
    console.log("BACKEND_URL:", BACKEND_URL);
    console.log(
      "TOKEN_KEY:",
      TOKEN_KEY ? `${TOKEN_KEY.substring(0, 20)}...` : "MISSING!",
    );
    console.log(
      "TOKEN_ID:",
      TOKEN_ID ? `${TOKEN_ID.substring(0, 20)}...` : "MISSING!",
    );
    console.log(
      "ACCESS_TOKEN:",
      ACCESS_TOKEN ? `${ACCESS_TOKEN.substring(0, 30)}...` : "MISSING!",
    );

    if (!TOKEN_KEY || !TOKEN_ID || !ACCESS_TOKEN) {
      setConfigValid(false);
      setError(
        "Thiếu thông tin xác thực! Vui lòng kiểm tra .env.local có đầy đủ NEXT_PUBLIC_EKYC_TOKEN_KEY, TOKEN_ID và AUTH_TOKEN",
      );
    } else {
      setConfigValid(true);
    }
  }, []);

  // ===========================
  // CALLBACK FUNCTION
  // ===========================
  const getResult = (result: any) => {
    console.log("========================================");
    console.log("✅ CALLBACK được gọi!");
    console.log("📦 Result:", result);
    console.log("========================================");

    setResult(result);

    // Xử lý result theo tài liệu
    if (result) {
      console.log("📄 Type Document:", result.type_document);
      console.log("📊 OCR Data:", result.ocr);
      console.log("👤 Face Data:", result.liveness_face);
      console.log("🔗 Compare:", result.compare);
    }
  };

  // ===========================
  // LOAD SDK SCRIPTS
  // ===========================
  useEffect(() => {
    console.log("🔄 Loading eKYC SDK scripts...");

    // Load các script theo thứ tự
    const scripts = [
      "/web-sdk-version-3.2.0.0.js",
      "/lib/VNPTQRBrowserApp.js",
      "/lib/VNPTBrowserSDKAppV4.0.0.js",
    ];

    let loadedCount = 0;

    const loadScript = (src: string) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.defer = true;
        script.onload = () => {
          console.log(`✅ Loaded: ${src}`);
          resolve(src);
        };
        script.onerror = () => {
          console.error(`❌ Failed to load: ${src}`);
          reject(new Error(`Failed to load ${src}`));
        };
        document.head.appendChild(script);
      });
    };

    // Load tất cả scripts
    Promise.all(scripts.map(loadScript))
      .then(() => {
        console.log("✅ All scripts loaded!");
        setIsSDKReady(true);
      })
      .catch((err) => {
        console.error("❌ Error loading scripts:", err);
        setError("Không thể tải SDK. Vui lòng kiểm tra các file SDK.");
      });

    // Cleanup
    return () => {
      scripts.forEach((src) => {
        const script = document.querySelector(`script[src="${src}"]`);
        if (script) {
          script.remove();
        }
      });
    };
  }, []);

  // ===========================
  // LAUNCH SDK
  // ===========================
  useEffect(() => {
    if (!isSDKReady) return;

    // Đợi một chút để đảm bảo window.SDK đã sẵn sàng
    const timer = setTimeout(() => {
      if (window.SDK) {
        console.log("🚀 Launching SDK with config...");

        // CONFIG THEO TÀI LIỆU (Mục 2.2 - Bảng yêu cầu)
        const dataConfig = {
          // 1. BACKEND_URL
          BACKEND_URL: BACKEND_URL,

          // 2. TOKEN_KEY
          TOKEN_KEY: TOKEN_KEY,

          // 3. TOKEN_ID
          TOKEN_ID: TOKEN_ID,

          // 4. ACCESS_TOKEN
          ACCESS_TOKEN: ACCESS_TOKEN,

          // 5. HAS_RESULT_SCREEN - Hiện/ẩn màn hình kết quả
          HAS_RESULT_SCREEN: true,

          // 6. CALL_BACK - Function nhận kết quả (BẮT BUỘC!)
          CALL_BACK: getResult,

          // 7. ENABLE_API_LIVENESS_DOCUMENT - Check liveness card
          ENABLE_API_LIVENESS_DOCUMENT: true,

          // 8. ENABLE_API_LIVENESS_FACE - Check liveness face
          ENABLE_API_LIVENESS_FACE: true,

          // 9. ENABLE_API_MASKED_FACE - Check mask face
          ENABLE_API_MASKED_FACE: true,

          // 10. ENABLE_API_COMPARE_FACE - Compare face
          ENABLE_API_COMPARE_FACE: true,

          // 11. SDK_FLOW - Luồng eKYC
          // DOCUMENT_TO_FACE: luồng đầy đủ bắt đầu chụp giấy tờ đến quét mặt
          // FACE_TO_DOCUMENT: luồng đầy đủ bắt đầu từ quét mặt tới chụp giấy tờ
          // FACE: chỉ quét mặt
          // DOCUMENT: chỉ ocr giấy tờ
          SDK_FLOW: "DOCUMENT_TO_FACE",

          // 12. LIST_TYPE_DOCUMENT - Danh sách loại giấy tờ
          // -1: Chứng minh thư
          // 5: Hộ chiếu
          // 6: Bằng Lái Xe
          // 7: Chứng minh thư quân đội
          // 9: CCCD gắn chip
          // 4: Giấy tờ khác
          LIST_TYPE_DOCUMENT: [-1, 5, 6, 7, 9],

          // 13. CUSTOM_THEME (optional)
          // CUSTOM_THEME: {
          //   PRIMARY_COLOR: '#18d696',
          //   TEXT_COLOR_DEFAULT: '#ffffff',
          //   BACKGROUND_COLOR: '#0F2B3B'
          // },

          // 14. CHALLENGE_CODE (optional)
          // CHALLENGE_CODE: "",

          // 15. SHOW_STEP - Hiện/ẩn thanh bước
          SHOW_STEP: true,

          // 16. HAS_QR_SCAN - Bật/tắt quét QR
          HAS_QR_SCAN: false,

          // 17. DOCUMENT_TYPE_START - Chọn ID document mặc định
          // 999: hiển thị danh sách chọn document
          DOCUMENT_TYPE_START: 999,

          // 18. DEFAULT_LANGUAGE - Ngôn ngữ
          DEFAULT_LANGUAGE: "vi",

          // 19. DOUBLE_LIVENESS - Face verify 2 lần
          DOUBLE_LIVENESS: false,

          // 20. FAKE_CAM_LABEL (optional)
          // FAKE_CAM_LABEL: "",

          // 21. CALL_BACK_DOCUMENT_RESULT (optional)
          // CALL_BACK_DOCUMENT_RESULT: async (result) => {
          //   console.log("Document result:", result);
          // },

          // 28. USE_METHOD - Phương thức xác thực
          // ⚠️ BUG: "BOTH" KHÔNG HOẠT ĐỘNG theo tài liệu!
          // PHOTO: chỉ cho phép chụp trực tiếp (recommended)
          // UPLOAD: chỉ cho phép tải ảnh lên
          USE_METHOD: "PHOTO", // FIX: Dùng "PHOTO" thay vì "BOTH"

          // 29. SHOW_TAB_RESULT_INFORMATION - Hiện/ẩn tab thông tin
          SHOW_TAB_RESULT_INFORMATION: true,

          // 30. SHOW_TAB_RESULT_VALIDATION - Hiện/ẩn tab xác thực
          SHOW_TAB_RESULT_VALIDATION: true,

          // 31. SHOW_TAB_RESULT_QRCODE - Hiện/ẩn tab QR
          SHOW_TAB_RESULT_QRCODE: true,

          // 36. MAX_SIZE_IMAGE - Kích thước tối đa ảnh (MB)
          MAX_SIZE_IMAGE: 1,
        };

        console.log("📋 Config:", dataConfig);

        try {
          window.SDK.launch(dataConfig);
          console.log("✅ SDK launched successfully!");
        } catch (err) {
          console.error("❌ Error launching SDK:", err);
          setError("Không thể khởi động SDK: " + (err as Error).message);
        }
      } else {
        console.error("❌ window.SDK is not available!");
        setError("window.SDK không tồn tại. Vui lòng kiểm tra các file SDK.");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isSDKReady]);

  // ===========================
  // RENDER
  // ===========================
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>🎯 eKYC Demo - Tích hợp theo tài liệu VNPT</h1>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Demo tích hợp trực tiếp theo tài liệu VNPT eKYC Web SDK ver 3.2.0.0
      </p>

      {/* Status */}
      <div
        style={{
          padding: "15px",
          marginBottom: "20px",
          borderRadius: "8px",
          backgroundColor: isSDKReady ? "#d4edda" : "#fff3cd",
          border: `1px solid ${isSDKReady ? "#c3e6cb" : "#ffeeba"}`,
        }}
      >
        <strong>Trạng thái:</strong>{" "}
        {isSDKReady ? "✅ SDK đã sẵn sàng" : "⏳ Đang tải SDK..."}
      </div>

      {/* Credentials Info */}
      <div
        style={{
          padding: "15px",
          marginBottom: "20px",
          borderRadius: "8px",
          backgroundColor: configValid ? "#d1ecf1" : "#fff3cd",
          border: `1px solid ${configValid ? "#bee5eb" : "#ffeeba"}`,
          fontSize: "14px",
        }}
      >
        <strong>⚙️ Credentials (từ .env.local):</strong>
        <ul style={{ margin: "10px 0", paddingLeft: "20px" }}>
          <li>
            <code>BACKEND_URL</code>: {BACKEND_URL || "(chưa set)"}
          </li>
          <li>
            <code>TOKEN_KEY</code>:{" "}
            {TOKEN_KEY ? (
              <span style={{ color: "green" }}>✅ Đã có</span>
            ) : (
              <span style={{ color: "red" }}>❌ Thiếu!</span>
            )}
          </li>
          <li>
            <code>TOKEN_ID</code>:{" "}
            {TOKEN_ID ? (
              <span style={{ color: "green" }}>✅ Đã có</span>
            ) : (
              <span style={{ color: "red" }}>❌ Thiếu!</span>
            )}
          </li>
          <li>
            <code>ACCESS_TOKEN</code>:{" "}
            {ACCESS_TOKEN ? (
              <span style={{ color: "green" }}>✅ Đã có</span>
            ) : (
              <span style={{ color: "red" }}>❌ Thiếu!</span>
            )}
          </li>
        </ul>
        {!configValid && (
          <div
            style={{
              marginTop: "10px",
              padding: "10px",
              backgroundColor: "#fff3cd",
              borderRadius: "4px",
              fontSize: "13px",
            }}
          >
            <strong>⚠️ Lưu ý:</strong> Kiểm tra file <code>.env.local</code> có
            đầy đủ các biến:
            <br />
            <code>NEXT_PUBLIC_EKYC_TOKEN_KEY</code>
            <br />
            <code>NEXT_PUBLIC_EKYC_TOKEN_ID</code>
            <br />
            <code>NEXT_PUBLIC_EKYC_AUTH_TOKEN</code>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: "15px",
            marginBottom: "20px",
            borderRadius: "8px",
            backgroundColor: "#f8d7da",
            border: "1px solid #f5c6cb",
            color: "#721c24",
          }}
        >
          <strong>❌ Lỗi:</strong> {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          style={{
            padding: "15px",
            marginBottom: "20px",
            borderRadius: "8px",
            backgroundColor: "#d1ecf1",
            border: "1px solid #bee5eb",
          }}
        >
          <h3 style={{ marginTop: 0 }}>✅ Kết quả eKYC</h3>
          <details>
            <summary
              style={{ cursor: "pointer", fontWeight: "bold", padding: "5px" }}
            >
              📦 Xem chi tiết (Click để mở)
            </summary>
            <pre
              style={{
                marginTop: "10px",
                padding: "15px",
                backgroundColor: "#f8f9fa",
                borderRadius: "4px",
                overflow: "auto",
                fontSize: "12px",
              }}
            >
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>

          {/* Hiển thị thông tin quan trọng */}
          {result.type_document !== undefined && (
            <div style={{ marginTop: "15px" }}>
              <p>
                <strong>Loại giấy tờ:</strong>{" "}
                {result.type_document === -1
                  ? "Chứng minh thư"
                  : result.type_document === 5
                    ? "Hộ chiếu"
                    : result.type_document === 6
                      ? "Bằng lái xe"
                      : result.type_document === 7
                        ? "CMT Quân đội"
                        : result.type_document === 9
                          ? "CCCD gắn chip"
                          : "Khác"}
              </p>
            </div>
          )}

          {result.ocr && (
            <div style={{ marginTop: "10px" }}>
              <h4>📄 Thông tin OCR:</h4>
              <ul style={{ margin: "5px 0" }}>
                {result.ocr.name && <li>Họ tên: {result.ocr.name}</li>}
                {result.ocr.id && <li>Số ID: {result.ocr.id}</li>}
                {result.ocr.birth_day && (
                  <li>Ngày sinh: {result.ocr.birth_day}</li>
                )}
                {result.ocr.gender && <li>Giới tính: {result.ocr.gender}</li>}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* SDK Container */}
      <div
        id="ekyc_sdk_intergrated"
        ref={containerRef}
        style={{
          width: "100%",
          minHeight: "600px",
          border: "2px dashed #ddd",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8f9fa",
        }}
      >
        {!isSDKReady && (
          <div style={{ textAlign: "center", color: "#666" }}>
            <p style={{ fontSize: "18px" }}>⏳ Đang tải SDK...</p>
            <p style={{ fontSize: "14px" }}>Vui lòng đợi trong giây lát</p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          border: "1px solid #dee2e6",
        }}
      >
        <h3>📋 Hướng dẫn sử dụng:</h3>
        <ol>
          <li>
            <strong>✅ Credentials tự động load từ .env.local</strong>
            <br />
            File này đã tự động đọc các biến:
            <ul style={{ marginTop: "5px" }}>
              <li>
                <code>NEXT_PUBLIC_EKYC_BACKEND_URL</code>
              </li>
              <li>
                <code>NEXT_PUBLIC_EKYC_TOKEN_KEY</code>
              </li>
              <li>
                <code>NEXT_PUBLIC_EKYC_TOKEN_ID</code>
              </li>
              <li>
                <code>NEXT_PUBLIC_EKYC_AUTH_TOKEN</code>
              </li>
            </ul>
            Kiểm tra phần "Credentials" ở trên để xem có đầy đủ không.
          </li>
          <li>
            Đảm bảo các file SDK đã được đặt trong <code>public/</code>:
            <ul>
              <li>
                <code>web-sdk-version-3.2.0.0.js</code>
              </li>
              <li>
                <code>lib/VNPTQRBrowserApp.js</code>
              </li>
              <li>
                <code>lib/VNPTBrowserSDKAppV4.0.0.js</code>
              </li>
            </ul>
          </li>
          <li>
            Chạy app: <code>npm run dev</code>
          </li>
          <li>
            Mở trang: <code>http://localhost:3000/vi/ekyc-demo</code>
          </li>
          <li>Thực hiện eKYC và xem kết quả trong console + UI</li>
        </ol>

        <h4 style={{ marginTop: "20px" }}>🔧 Các SDK_FLOW có thể dùng:</h4>
        <ul>
          <li>
            <code>DOCUMENT_TO_FACE</code> - Luồng đầy đủ: Giấy tờ → Mặt (đang
            dùng)
          </li>
          <li>
            <code>FACE_TO_DOCUMENT</code> - Luồng đầy đủ: Mặt → Giấy tờ
          </li>
          <li>
            <code>DOCUMENT</code> - Chỉ OCR giấy tờ
          </li>
          <li>
            <code>FACE</code> - Chỉ quét mặt
          </li>
        </ul>

        <h4 style={{ marginTop: "20px" }}>🔍 Theo dõi trong Console (F12):</h4>
        <ul>
          <li>
            Tìm log: <code>[EKYC CALLBACK]</code>
          </li>
          <li>Kiểm tra object result chi tiết</li>
        </ul>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "30px",
          padding: "15px",
          textAlign: "center",
          fontSize: "12px",
          color: "#666",
          borderTop: "1px solid #dee2e6",
        }}
      >
        <p>
          📚 Tích hợp theo tài liệu:{" "}
          <strong>TÀI LIỆU HƯỚNG DẪN TÍCH HỢP SDK eKYC WEB - ver3.2.0.0</strong>
        </p>
        <p>Ngày hiệu lực: 09/10/2024</p>
      </div>
    </div>
  );
};

export default EkycDemoPage;
