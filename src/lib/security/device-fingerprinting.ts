// @ts-nocheck
/**
 * Device Fingerprinting Utilities
 * Implements device fingerprinting for anomaly detection and trust scoring
 */

import crypto from "crypto";

// Device fingerprint data
export interface DeviceFingerprint {
  id: string;
  userAgent: string;
  screenResolution: string;
  colorDepth: number;
  timezone: string;
  language: string;
  platform: string;
  hardwareConcurrency: number;
  deviceMemory: number;
  canvas: string;
  webgl: string;
  fonts: string[];
  plugins: string[];
  localIP?: string;
  publicIP?: string;
  connectionType?: string;
  timestamp: number;
  trustScore: number;
  isNew: boolean;
}

// Device storage interface
export interface DeviceStorage {
  addDevice(phoneNumber: string, device: DeviceFingerprint): Promise<void>;
  getDevices(phoneNumber: string): Promise<DeviceFingerprint[]>;
  updateTrustScore(deviceId: string, score: number): Promise<void>;
  isDeviceTrusted(phoneNumber: string, deviceId: string): Promise<boolean>;
  cleanup(): Promise<void>;
}

// In-memory device storage (in production, use database)
class MemoryDeviceStorage implements DeviceStorage {
  private devices: Map<string, DeviceFingerprint[]> = new Map();

  async addDevice(
    phoneNumber: string,
    device: DeviceFingerprint,
  ): Promise<void> {
    const existingDevices = this.devices.get(phoneNumber) || [];

    // Check if device already exists
    const existingIndex = existingDevices.findIndex((d) => d.id === device.id);
    if (existingIndex >= 0) {
      existingDevices[existingIndex] = device;
    } else {
      existingDevices.push(device);
    }

    this.devices.set(phoneNumber, existingDevices);
  }

  async getDevices(phoneNumber: string): Promise<DeviceFingerprint[]> {
    return this.devices.get(phoneNumber) || [];
  }

  async updateTrustScore(deviceId: string, score: number): Promise<void> {
    for (const devices of this.devices.values()) {
      const device = devices.find((d) => d.id === deviceId);
      if (device) {
        device.trustScore = Math.max(0, Math.min(100, score));
        break;
      }
    }
  }

  async isDeviceTrusted(
    phoneNumber: string,
    deviceId: string,
  ): Promise<boolean> {
    const devices = await this.getDevices(phoneNumber);
    const device = devices.find((d) => d.id === deviceId);
    return device ? device.trustScore >= 70 : false;
  }

  async cleanup(): Promise<void> {
    // Remove devices older than 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    for (const [phoneNumber, devices] of this.devices.entries()) {
      const filtered = devices.filter(
        (device) => device.timestamp > thirtyDaysAgo,
      );
      if (filtered.length === 0) {
        this.devices.delete(phoneNumber);
      } else {
        this.devices.set(phoneNumber, filtered);
      }
    }
  }
}

// Global device storage
const deviceStorage = new MemoryDeviceStorage();

// Generate canvas fingerprint
async function generateCanvasFingerprint(): Promise<string> {
  if (typeof window === "undefined") return "server";

  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return "no-canvas";

    // Draw text with various properties
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillText("Device fingerprint canvas test", 2, 2);

    // Draw shapes
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);

    return canvas.toDataURL().slice(-50); // Use last 50 characters
  } catch {
    return "canvas-error";
  }
}

// Generate WebGL fingerprint
async function generateWebGLFingerprint(): Promise<string> {
  if (typeof window === "undefined") return "server";

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return "no-webgl";

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (!debugInfo) return "no-debug-info";

    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

    return `${vendor}-${renderer}`.slice(0, 100);
  } catch {
    return "webgl-error";
  }
}

// Detect available fonts
async function detectFonts(): Promise<string[]> {
  if (typeof window === "undefined") return ["server"];

  const testFonts = [
    "Arial",
    "Arial Black",
    "Comic Sans MS",
    "Courier New",
    "Georgia",
    "Helvetica",
    "Impact",
    "Times New Roman",
    "Trebuchet MS",
    "Verdana",
    "Roboto",
    "Open Sans",
    "Lato",
    "Montserrat",
    "Oswald",
    "Playfair Display",
    "Raleway",
    "Poppins",
    "Nunito",
    "Montserrat",
  ];

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  const baseText = "mmmmmmmmmmlli";
  const baseSize = "72px";
  const detectedFonts: string[] = [];

  // Measure base font
  ctx.font = `${baseSize} monospace`;
  const baseWidth = ctx.measureText(baseText).width;

  for (const font of testFonts) {
    ctx.font = `${baseSize} '${font}', monospace`;
    const width = ctx.measureText(baseText).width;

    if (width !== baseWidth) {
      detectedFonts.push(font);
    }
  }

  return detectedFonts.slice(0, 10); // Limit to 10 fonts
}

// Get browser plugins
function getPlugins(): string[] {
  if (typeof navigator === "undefined") return ["server"];

  const plugins: string[] = [];
  for (const plugin of Array.from(navigator.plugins)) {
    plugins.push(plugin.name);
  }

  return plugins.slice(0, 10); // Limit to 10 plugins
}

// Get connection information
async function getConnectionInfo(): Promise<{
  type?: string;
  localIP?: string;
}> {
  if (typeof window === "undefined") return {};

  const info: { type?: string; localIP?: string } = {};

  // Get connection type
  if ("connection" in navigator) {
    const connection = (navigator as any).connection;
    info.type = connection.effectiveType || connection.type;
  }

  // Try to get local IP (this may not work in all browsers)
  try {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peerConnection.createDataChannel("");

    const localIP = await new Promise<string>((resolve) => {
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && event.candidate.candidate) {
          const match = event.candidate.candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
          if (match && match[1]) {
            resolve(match[1]);
          }
        }
      };

      peerConnection
        .createOffer()
        .then((offer) => peerConnection.setLocalDescription(offer))
        .catch(() => resolve(""));
    });

    info.localIP = localIP;
    peerConnection.close();
  } catch {
    // Ignore errors, local IP is optional
  }

  return info;
}

// Generate device fingerprint
export async function generateDeviceFingerprint(
  ipAddress?: string,
): Promise<DeviceFingerprint> {
  const canvas = await generateCanvasFingerprint();
  const webgl = await generateWebGLFingerprint();
  const fonts = await detectFonts();
  const plugins = getPlugins();
  const connection = await getConnectionInfo();

  const fingerprintData = {
    userAgent:
      typeof navigator !== "undefined" ? navigator.userAgent : "server",
    screenResolution:
      typeof screen !== "undefined"
        ? `${screen.width}x${screen.height}`
        : "server",
    colorDepth: typeof screen !== "undefined" ? screen.colorDepth : 24,
    timezone:
      typeof Intl !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : "server",
    language: typeof navigator !== "undefined" ? navigator.language : "server",
    platform: typeof navigator !== "undefined" ? navigator.platform : "server",
    hardwareConcurrency:
      typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 4 : 4,
    deviceMemory:
      typeof navigator !== "undefined"
        ? (navigator as any).deviceMemory || 4
        : 4,
    canvas,
    webgl,
    fonts,
    plugins,
    localIP: connection.localIP,
    publicIP: ipAddress,
    connectionType: connection.type,
    timestamp: Date.now(),
  };

  // Generate hash of fingerprint data
  const fingerprintString = JSON.stringify(fingerprintData);
  const hash = crypto
    .createHash("sha256")
    .update(fingerprintString)
    .digest("hex");

  return {
    id: hash,
    ...fingerprintData,
    trustScore: 50, // Default trust score
    isNew: true,
  };
}

// Calculate device similarity
export function calculateDeviceSimilarity(
  device1: DeviceFingerprint,
  device2: DeviceFingerprint,
): number {
  const fields: (keyof DeviceFingerprint)[] = [
    "userAgent",
    "screenResolution",
    "colorDepth",
    "timezone",
    "language",
    "platform",
    "hardwareConcurrency",
    "deviceMemory",
  ];

  let matches = 0;
  for (const field of fields) {
    if (device1[field] === device2[field]) {
      matches++;
    }
  }

  // Check similarity for arrays
  const fontSimilarity = calculateArraySimilarity(device1.fonts, device2.fonts);
  const pluginSimilarity = calculateArraySimilarity(
    device1.plugins,
    device2.plugins,
  );

  // Canvas and WebGL similarity (simple string comparison)
  const canvasSimilarity = device1.canvas === device2.canvas ? 1 : 0;
  const webglSimilarity = device1.webgl === device2.webgl ? 1 : 0;

  const totalFields = fields.length + 4; // +4 for fonts, plugins, canvas, webgl
  const totalMatches =
    matches +
    fontSimilarity +
    pluginSimilarity +
    canvasSimilarity +
    webglSimilarity;

  return totalMatches / totalFields;
}

// Calculate array similarity
function calculateArraySimilarity(arr1: string[], arr2: string[]): number {
  if (!arr1.length || !arr2.length) return 0;

  const set1 = new Set(arr1);
  const set2 = new Set(arr2);
  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

// Detect anomalies in device fingerprinting
export async function detectAnomalies(
  phoneNumber: string,
  currentDevice: DeviceFingerprint,
): Promise<{
  isAnomalous: boolean;
  riskScore: number;
  reasons: string[];
}> {
  const devices = await deviceStorage.getDevices(phoneNumber);
  const reasons: string[] = [];
  let riskScore = 0;

  // New device check
  if (!devices.some((d) => d.id === currentDevice.id)) {
    reasons.push("New device detected");
    riskScore += 30;
  }

  // IP address change
  const sameIPDevices = devices.filter(
    (d) => d.publicIP === currentDevice.publicIP,
  );
  if (devices.length > 0 && sameIPDevices.length === 0) {
    reasons.push("IP address changed");
    riskScore += 25;
  }

  // Geographic location change (based on timezone)
  const sameTimezoneDevices = devices.filter(
    (d) => d.timezone === currentDevice.timezone,
  );
  if (devices.length > 0 && sameTimezoneDevices.length === 0) {
    reasons.push("Geographic location changed");
    riskScore += 20;
  }

  // User agent change
  const sameUserAgentDevices = devices.filter(
    (d) => d.userAgent === currentDevice.userAgent,
  );
  if (devices.length > 0 && sameUserAgentDevices.length === 0) {
    reasons.push("Browser changed");
    riskScore += 15;
  }

  // Check for similar but not identical devices
  let maxSimilarity = 0;
  for (const device of devices) {
    const similarity = calculateDeviceSimilarity(currentDevice, device);
    maxSimilarity = Math.max(maxSimilarity, similarity);
  }

  if (maxSimilarity > 0.3 && maxSimilarity < 0.8) {
    reasons.push("Similar but different device detected");
    riskScore += 10;
  }

  // Too many devices for one phone number
  if (devices.length >= 5) {
    reasons.push("Too many devices associated with phone number");
    riskScore += 15;
  }

  const isAnomalous = riskScore >= 40; // Threshold for anomaly detection

  return {
    isAnomalous,
    riskScore: Math.min(100, riskScore),
    reasons,
  };
}

// Update device trust score based on successful/failed verification
export async function updateDeviceTrust(
  phoneNumber: string,
  deviceId: string,
  success: boolean,
  anomalyDetected: boolean = false,
): Promise<void> {
  const devices = await deviceStorage.getDevices(phoneNumber);
  const device = devices.find((d) => d.id === deviceId);

  if (!device) return;

  let scoreChange = 0;

  if (success) {
    if (anomalyDetected) {
      scoreChange = 5; // Small increase for successful verification with anomaly
    } else {
      scoreChange = 10; // Normal increase for successful verification
    }
  } else {
    if (anomalyDetected) {
      scoreChange = -20; // Large decrease for failed verification with anomaly
    } else {
      scoreChange = -5; // Normal decrease for failed verification
    }
  }

  const newTrustScore = device.trustScore + scoreChange;
  await deviceStorage.updateTrustScore(deviceId, newTrustScore);
}

// Store device fingerprint
export async function storeDeviceFingerprint(
  phoneNumber: string,
  device: DeviceFingerprint,
): Promise<void> {
  // Mark device as not new if it already exists
  const devices = await deviceStorage.getDevices(phoneNumber);
  const existingDevice = devices.find((d) => d.id === device.id);

  if (existingDevice) {
    device.isNew = false;
    device.trustScore = existingDevice.trustScore;
  }

  await deviceStorage.addDevice(phoneNumber, device);
}

// Check if device is trusted
export async function isDeviceTrusted(
  phoneNumber: string,
  deviceId: string,
): Promise<boolean> {
  return await deviceStorage.isDeviceTrusted(phoneNumber, deviceId);
}

// Get device trust score
export async function getDeviceTrustScore(
  phoneNumber: string,
  deviceId: string,
): Promise<number> {
  const devices = await deviceStorage.getDevices(phoneNumber);
  const device = devices.find((d) => d.id === deviceId);
  return device ? device.trustScore : 0;
}

// Cleanup old devices
export async function cleanupDeviceStorage(): Promise<void> {
  await deviceStorage.cleanup();
}

// Export device storage for testing
export { MemoryDeviceStorage, deviceStorage };
