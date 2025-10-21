/**
 * Test script để verify eKYC data mapper với log.json thực tế
 *
 * Run: npx ts-node src/lib/ekyc/__test-mapper.ts
 * Hoặc: node -r esbuild-register src/lib/ekyc/__test-mapper.ts
 */

import { readFileSync } from "fs";
import { join } from "path";
import {
  mapEkycToFormData,
  isEkycResultValid,
  getEkycSummary,
  type EkycFullResult,
} from "./ekyc-data-mapper";

// Load log.json
const logPath = join(__dirname, "../../../log.json");
const logData = JSON.parse(readFileSync(logPath, "utf-8")) as EkycFullResult;

console.log("========================================");
console.log("TEST eKYC Data Mapper với log.json");
console.log("========================================\n");

// Test 1: Validate result
console.log("✅ Test 1: isEkycResultValid()");
const isValid = isEkycResultValid(logData);
console.log(`   Result: ${isValid ? "VALID ✓" : "INVALID ✗"}`);
console.log();

// Test 2: Map to form data
console.log("✅ Test 2: mapEkycToFormData()");
const formData = mapEkycToFormData(logData);
console.log("   Mapped Form Data:");
console.log("   - fullName:", formData.fullName);
console.log("   - dateOfBirth:", formData.dateOfBirth);
console.log("   - gender:", formData.gender);
console.log("   - address:", formData.address);
console.log("   - city:", formData.city);
console.log();

// Test 3: Get summary
console.log("✅ Test 3: getEkycSummary()");
const summary = getEkycSummary(logData);
console.log("   Summary:");
console.log("   - ID Number:", summary.idNumber);
console.log("   - Full Name:", summary.fullName);
console.log("   - Date of Birth:", summary.dateOfBirth);
console.log("   - Address:", summary.address);
console.log("   - Face Match:", summary.faceMatch ? "YES ✓" : "NO ✗");
console.log("   - Match Score:", summary.matchScore?.toFixed(2) + "%");
console.log("   - Match Message:", summary.matchMessage);
console.log();

// Test 4: Check OCR data structure
console.log("✅ Test 4: Kiểm tra cấu trúc OCR data");
const ocrData = logData?.ocr?.object;
if (ocrData) {
  console.log("   ✓ OCR data nằm trong ocr.object");
  console.log("   - ID:", ocrData.id);
  console.log("   - Name:", ocrData.name);
  console.log("   - Gender:", ocrData.gender);
  console.log("   - Birth Day:", ocrData.birth_day);
  console.log(
    "   - Recent Location:",
    ocrData.recent_location?.substring(0, 50) + "...",
  );
  console.log("   - Nationality:", ocrData.nationality);
  console.log("   - Card Type:", ocrData.card_type);
  console.log("   - Issue Date:", ocrData.issue_date);
  console.log("   - Valid Date:", ocrData.valid_date);
} else {
  console.log("   ✗ Không tìm thấy OCR data trong ocr.object");
}
console.log();

// Test 5: Check compare data structure
console.log("✅ Test 5: Kiểm tra cấu trúc Compare data");
const compareData = logData?.compare?.object;
if (compareData) {
  console.log("   ✓ Compare data nằm trong compare.object");
  console.log("   - Result:", compareData.result);
  console.log("   - Message:", compareData.msg);
  console.log("   - Probability:", compareData.prob);
  console.log("   - Match Warning:", compareData.match_warning);
} else {
  console.log("   ✗ Không tìm thấy Compare data trong compare.object");
}
console.log();

// Test 6: Check liveness face data structure
console.log("✅ Test 6: Kiểm tra cấu trúc Liveness Face data");
const livenessFaceData = logData?.liveness_face?.object;
if (livenessFaceData) {
  console.log("   ✓ Liveness Face data nằm trong liveness_face.object");
  console.log("   - Liveness:", livenessFaceData.liveness);
  console.log("   - Liveness Message:", livenessFaceData.liveness_msg);
  console.log("   - Gender:", livenessFaceData.gender);
  console.log("   - Age:", livenessFaceData.age);
  console.log("   - Blur Face:", livenessFaceData.blur_face);
  console.log("   - Eye Open:", livenessFaceData.is_eye_open);
} else {
  console.log(
    "   ✗ Không tìm thấy Liveness Face data trong liveness_face.object",
  );
}
console.log();

console.log("========================================");
console.log("✅ TẤT CẢ TESTS HOÀN THÀNH!");
console.log("========================================");
