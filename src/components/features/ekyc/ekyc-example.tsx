/**
 * Example component showing different ways to use the refactored eKYC SDK
 */

"use client";

import React, { useState } from "react";
import EkycSdkWrapper from "./ekyc-sdk-wrapper";
import { useEkycStore } from "@/store/use-ekyc-store";
import { DocumentType } from "@/lib/ekyc/types";

const EkycExample: React.FC = () => {
  const [flowType, setFlowType] = useState<"DOCUMENT" | "FACE">("FACE");
  const [language, setLanguage] = useState<"vi" | "en">("vi");
  const [documentType, setDocumentType] = useState<DocumentType>(
    DocumentType.CCCD,
  );

  const { status, result, error, reset } = useEkycStore();

  const handleReset = () => {
    reset();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>eKYC SDK Demo</h2>

      {/* Controls */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <label>Flow Type: </label>
          <select
            value={flowType}
            onChange={(e) => setFlowType(e.target.value as "DOCUMENT" | "FACE")}
          >
            <option value="DOCUMENT">Document</option>
            <option value="FACE">Face</option>
          </select>
        </div>

        <div>
          <label>Language: </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as "vi" | "en")}
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </div>

        <div>
          <label>Document Type: </label>
          <select
            value={documentType}
            onChange={(e) =>
              setDocumentType(Number(e.target.value) as DocumentType)
            }
          >
            <option value={DocumentType.CMND}>CMND</option>
            <option value={DocumentType.CCCD}>CCCD</option>
            <option value={DocumentType.HoChieu}>Hộ chiếu</option>
            <option value={DocumentType.BangLaiXe}>Bằng lái xe</option>
            <option value={DocumentType.CMNDQuanDoi}>CMND Quân đội</option>
          </select>
        </div>

        <button
          onClick={handleReset}
          style={{
            backgroundColor: "#f0f0f0",
            border: "1px solid #ccc",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>

      {/* Status Display */}
      <div style={{ marginBottom: "20px" }}>
        <div>
          <strong>Status:</strong> {status}
        </div>
        {error && (
          <div style={{ color: "red" }}>
            <strong>Error:</strong> {error}
          </div>
        )}
        {result && (
          <div style={{ color: "green" }}>
            <strong>Success:</strong> eKYC completed successfully
            <details style={{ marginTop: "10px" }}>
              <summary>View Result</summary>
              <pre
                style={{
                  background: "#f5f5f5",
                  padding: "10px",
                  borderRadius: "4px",
                  overflow: "auto",
                  maxHeight: "200px",
                }}
              >
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>

      {/* SDK Container */}
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <EkycSdkWrapper
          flowType={flowType}
          language={language}
          style={{
            width: "100%",
            height: "600px",
          }}
        />
      </div>
    </div>
  );
};

export default EkycExample;
