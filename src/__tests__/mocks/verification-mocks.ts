/**
 * Enhanced Verification Mocks for Realistic Testing
 *
 * This file provides comprehensive mock implementations for:
 * - VNPT Provider with realistic responses
 * - Network error simulation
 * - Timeout scenarios
 * - Partial failure scenarios
 * - Progress tracking simulation
 */

import {
  VerificationStatus,
  type VerificationResult,
  type VerificationSession,
  type VerificationOptions,
} from "@/lib/verification/types";

// Mock VNPT Response Data
export const mockVNPTResponses = {
  // Successful verification responses
  success: {
    cccdWithHighConfidence: {
      code: 200,
      sessionId: "vnpt_cccd_123456789",
      ocr: {
        object: {
          name: "NGUYEN VAN ANH",
          birth_day: "15/01/1990",
          gender: "Nam",
          id: "001234567890",
          recent_location:
            "123 Nguyễn Văn Linh, P. Bình Thọ, Q. 2, TP. Hồ Chí Minh",
          type_id: 1,
          issue_date: "01/01/2020",
          valid_date: "01/01/2030",
          issue_by: "Công an TP.HCM",
          nationality: "Việt Nam",
          origin_location: "Hà Nội",
          nation: "Kinh",
          religion: "Phật giáo",
          // Confidence scores
          name_prob: 98,
          birth_day_prob: 99,
          id_probs: "99,98,97,96,95,94,93,92,91,90,89,88",
          recent_location_prob: 95,
          // Quality metrics
          quality_front: {
            blur_score: 92,
            luminance_score: 88,
            glare_score: 95,
            sharpness_score: 90,
          },
          // Authenticity checks
          checking_result_front: {
            recaptured_result: "PASS",
            edited_result: "PASS",
            photocopy_result: "PASS",
          },
        },
      },
      liveness_face: {
        object: {
          liveness: "success",
          fake_liveness: false,
          face_swapping: false,
          confidence: 96,
          quality_score: 91,
        },
      },
      compare: {
        object: {
          similarity_score: 95,
          match_result: "MATCH",
          confidence: 94,
        },
      },
      processing_time: {
        total: 2.5,
        ocr_time: 1.2,
        liveness_time: 0.8,
        compare_time: 0.5,
      },
    },

    passportVerification: {
      code: 200,
      sessionId: "vnpt_passport_987654321",
      ocr: {
        object: {
          name: "TRAN THI BICH",
          birth_day: "20/05/1985",
          gender: "Nữ",
          id: "P987654321",
          recent_location: "456 Lê Lợi, P. Bến Nghé, Q. 1, TP.HCM",
          type_id: 2,
          issue_date: "15/03/2018",
          valid_date: "15/03/2028",
          issue_by: "Cơ quan Quản lý xuất nhập cảnh",
          nationality: "Việt Nam",
          place_of_birth: "Đà Nẵng",
          // Lower confidence scores for passport
          name_prob: 95,
          birth_day_prob: 96,
          id_probs: "95,94,93,92,91,90,89,88,87",
          recent_location_prob: 88,
          quality_front: {
            blur_score: 85,
            luminance_score: 82,
            glare_score: 88,
            sharpness_score: 86,
          },
          checking_result_front: {
            recaptured_result: "PASS",
            edited_result: "PASS",
          },
        },
      },
      liveness_face: {
        object: {
          liveness: "success",
          fake_liveness: false,
          confidence: 89,
        },
      },
      compare: {
        object: {
          similarity_score: 88,
          match_result: "MATCH",
        },
      },
    },
  },

  // Error responses
  errors: {
    documentTooBlurry: {
      code: 400,
      message: "Document quality too low",
      details: {
        reason: "blurry_image",
        suggestions: [
          "Use better lighting",
          "Hold camera steady",
          "Clean camera lens",
        ],
        quality_scores: {
          blur_score: 45,
          luminance_score: 65,
          glare_score: 72,
        },
      },
    },

    faceNotDetected: {
      code: 400,
      message: "Face not detected in photo",
      details: {
        reason: "no_face_found",
        suggestions: [
          "Ensure face is visible",
          "Remove accessories",
          "Face forward",
        ],
        attempt_count: 3,
      },
    },

    livenessCheckFailed: {
      code: 400,
      message: "Liveness check failed",
      details: {
        reason: "fake_liveness_detected",
        warning_types: ["static_image", "video_playback_detected"],
        confidence: 25,
      },
    },

    documentExpired: {
      code: 400,
      message: "Document has expired",
      details: {
        expiry_date: "2019-12-31",
        current_date: "2024-01-15",
        days_expired: 1480,
      },
    },

    multipleFacesDetected: {
      code: 400,
      message: "Multiple faces detected",
      details: {
        face_count: 3,
        positions: [
          { x: 100, y: 150, confidence: 0.95 },
          { x: 200, y: 160, confidence: 0.88 },
          { x: 150, y: 140, confidence: 0.76 },
        ],
      },
    },

    networkTimeout: {
      code: 408,
      message: "Request timeout",
      details: {
        timeout_seconds: 30,
        last_successful_step: "document_upload",
      },
    },

    serverError: {
      code: 500,
      message: "Internal server error",
      details: {
        error_id: "ERR_5029384",
        timestamp: "2024-01-15T10:30:00Z",
        service: "vnpt-ocr-service",
      },
    },

    serviceUnavailable: {
      code: 503,
      message: "Service temporarily unavailable",
      details: {
        maintenance_window: {
          start: "2024-01-15T02:00:00Z",
          end: "2024-01-15T06:00:00Z",
        },
        alternative_services: ["manual_verification", "branch_visit"],
      },
    },
  },

  // Partial responses for testing progress
  partial: {
    documentUploaded: {
      step: "document_upload",
      status: "processing",
      progress: 25,
      message: "Document uploaded successfully",
    },

    ocrProcessing: {
      step: "ocr_processing",
      status: "processing",
      progress: 50,
      message: "Extracting text from document...",
    },

    livenessCheck: {
      step: "liveness_check",
      status: "processing",
      progress: 75,
      message: "Performing liveness verification...",
    },

    finalizing: {
      step: "finalizing",
      status: "processing",
      progress: 90,
      message: "Finalizing verification results...",
    },
  },
};

// Mock verification scenarios
export const mockVerificationScenarios = {
  // Complete successful flow
  successfulVerification: {
    setup: (delay = 1000) => ({
      initialResponse: () =>
        Promise.resolve({
          id: "session_" + Date.now(),
          status: VerificationStatus.PROCESSING,
          provider: "vnpt",
          startedAt: new Date().toISOString(),
        } as VerificationSession),

      progressUpdates: [
        mockVNPTResponses.partial.documentUploaded,
        mockVNPTResponses.partial.ocrProcessing,
        mockVNPTResponses.partial.livenessCheck,
        mockVNPTResponses.partial.finalizing,
      ],

      finalResult: () =>
        Promise.resolve({
          success: true,
          sessionId: "session_" + Date.now(),
          provider: {
            name: "vnpt",
            version: "3.2.0",
          },
          personalData: {
            fullName: "NGUYEN VAN ANH",
            dateOfBirth: "1990-01-15",
            gender: "male" as const,
            nationality: "Việt Nam",
            idNumber: "001234567890",
            address: {
              fullAddress:
                "123 Nguyễn Văn Linh, P. Bình Thọ, Q. 2, TP. Hồ Chí Minh",
              city: "TP.HCM",
              district: "Q. 2",
              ward: "P. Bình Thọ",
              street: "123 Nguyễn Văn Linh",
            },
            documentType: "CCCD",
            documentTypeName: "Căn cước công dân",
            issuedDate: "2020-01-01",
            expiryDate: "2030-01-01",
            issuedBy: "Công an TP.HCM",
            ethnicity: "Kinh",
            hometown: "Hà Nội",
            religion: "Phật giáo",
          },
          verificationData: {
            confidence: 96,
            livenessScore: 96,
            faceMatchScore: 95,
            documentQuality: 91,
            ocrConfidence: {
              idNumber: 98,
              name: 97,
              dateOfBirth: 96,
              address: 93,
            },
            fraudDetection: {
              isAuthentic: true,
              riskScore: 3,
              warnings: [],
              checks: {
                photocopyDetection: true,
                screenDetection: true,
                digitalManipulation: false,
                faceSwapping: false,
              },
            },
            imageQuality: {
              blurScore: 92,
              brightnessScore: 88,
              glareScore: 95,
              sharpnessScore: 90,
            },
          },
          processing: {
            totalDuration: 2500,
            steps: {
              documentUpload: 600,
              ocrProcessing: 1200,
              faceCapture: 400,
              livenessCheck: 300,
              faceComparison: 200,
            },
            retryCount: 0,
          },
          startedAt: "2024-01-15T10:00:00.000Z",
          completedAt: "2024-01-15T10:00:02.500Z",
        } as VerificationResult),

      delay,
    }),
  },

  // Low confidence scenario
  lowConfidenceVerification: {
    setup: () => ({
      initialResponse: () =>
        Promise.resolve({
          id: "session_" + Date.now(),
          status: VerificationStatus.PROCESSING,
          provider: "vnpt",
          startedAt: new Date().toISOString(),
        } as VerificationSession),

      finalResult: () =>
        Promise.resolve({
          success: true,
          sessionId: "session_" + Date.now(),
          provider: { name: "vnpt", version: "3.2.0" },
          personalData: {
            fullName: "LE VAN C",
            dateOfBirth: "1988-08-10",
            gender: "male" as const,
            idNumber: "012345678901",
          },
          verificationData: {
            confidence: 68, // Below typical threshold of 70
            livenessScore: 85,
            faceMatchScore: 72,
            documentQuality: 65,
            fraudDetection: {
              isAuthentic: true,
              riskScore: 15,
              warnings: ["Low image quality", "Partial document visible"],
              checks: {
                photocopyDetection: true,
                screenDetection: false,
                digitalManipulation: false,
                faceSwapping: false,
              },
            },
          },
          processing: {
            totalDuration: 1800,
            steps: {},
            retryCount: 1,
          },
          startedAt: new Date().toISOString(),
          completedAt: new Date(Date.now() + 1800).toISOString(),
        } as VerificationResult),
    }),
  },

  // Network error scenario
  networkError: {
    setup: () => ({
      initialResponse: () =>
        Promise.reject(new Error("Network error: Failed to fetch")),
      retryable: true,
      errorType: "network",
    }),
  },

  // Timeout scenario
  timeoutError: {
    setup: () => ({
      initialResponse: () =>
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Request timeout")), 31000);
        }),
      timeout: 31000,
      errorType: "timeout",
    }),
  },

  // Document quality issue
  qualityError: {
    setup: () => ({
      initialResponse: () =>
        Promise.resolve({
          id: "session_" + Date.now(),
          status: VerificationStatus.PROCESSING,
          provider: "vnpt",
          startedAt: new Date().toISOString(),
        } as VerificationSession),

      finalResult: () =>
        Promise.resolve({
          success: false,
          sessionId: "session_" + Date.now(),
          provider: { name: "vnpt", version: "3.2.0" },
          personalData: {},
          verificationData: {
            confidence: 45,
            documentQuality: 38,
            fraudDetection: {
              isAuthentic: false,
              riskScore: 65,
              warnings: [
                "Document appears to be recaptured",
                "Poor image quality",
              ],
              checks: {
                photocopyDetection: false,
                screenDetection: true,
                digitalManipulation: false,
                faceSwapping: false,
              },
            },
          },
          processing: {
            totalDuration: 800,
            steps: {},
            retryCount: 0,
          },
          startedAt: new Date().toISOString(),
          completedAt: new Date(Date.now() + 800).toISOString(),
          error: {
            code: "LOW_QUALITY",
            message: "Document quality too low for verification",
          },
        } as VerificationResult),
    }),
  },
};

// Mock progress simulation
export class MockProgressSimulator {
  private callbacks: Array<(progress: any) => void> = [];
  private isRunning = false;

  onProgress(callback: (progress: any) => void) {
    this.callbacks.push(callback);
  }

  start(scenario: keyof typeof mockVerificationScenarios) {
    if (this.isRunning) return;
    this.isRunning = true;

    const setup = mockVerificationScenarios[scenario].setup();

    if ("progressUpdates" in setup && Array.isArray(setup.progressUpdates)) {
      setup.progressUpdates.forEach((update: any, index: number) => {
        setTimeout(
          () => {
            if (this.isRunning) {
              this.callbacks.forEach((cb) => cb(update));
            }
          },
          (index + 1) * 500,
        );
      });
    }
  }

  stop() {
    this.isRunning = false;
  }
}

// Mock VNPT Provider with realistic behavior
export class MockVNPTProvider {
  private scenarios = new Map<string, any>();
  private currentScenario: string | null = null;
  private progressSimulator = new MockProgressSimulator();

  constructor() {
    // Register all scenarios
    Object.keys(mockVerificationScenarios).forEach((key) => {
      this.scenarios.set(
        key,
        mockVerificationScenarios[
          key as keyof typeof mockVerificationScenarios
        ],
      );
    });
  }

  async initialize(config: any): Promise<void> {
    // Simulate initialization delay
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  async startVerification(
    options: VerificationOptions,
  ): Promise<VerificationSession> {
    const scenarioName = options.metadata?.scenario || "successfulVerification";
    const scenario = this.scenarios.get(scenarioName);

    if (!scenario) {
      throw new Error(`Unknown scenario: ${scenarioName}`);
    }

    const setup = scenario.setup();
    this.currentScenario = scenarioName;

    // Start progress simulation
    this.progressSimulator.start(
      scenarioName as keyof typeof mockVerificationScenarios,
    );

    try {
      return await setup.initialResponse();
    } catch (error) {
      this.currentScenario = null;
      throw error;
    }
  }

  async getStatus(sessionId: string): Promise<VerificationStatus> {
    if (!this.currentScenario) {
      throw new Error("No active verification session");
    }

    const scenario = this.scenarios.get(this.currentScenario);
    const setup = scenario.setup();

    if ("progressUpdates" in setup && Array.isArray(setup.progressUpdates)) {
      return VerificationStatus.PROCESSING;
    }

    return VerificationStatus.SUCCESS;
  }

  async getResult(sessionId: string): Promise<VerificationResult> {
    if (!this.currentScenario) {
      throw new Error("No active verification session");
    }

    const scenario = this.scenarios.get(this.currentScenario);
    const setup = scenario.setup();

    // Stop progress simulation
    this.progressSimulator.stop();

    try {
      const result = await setup.finalResult();
      this.currentScenario = null;
      return result;
    } catch (error) {
      this.currentScenario = null;
      throw error;
    }
  }

  async cancel(sessionId: string): Promise<void> {
    this.progressSimulator.stop();
    this.currentScenario = null;
  }

  async cleanup(): Promise<void> {
    this.progressSimulator.stop();
    this.currentScenario = null;
  }

  onProgress(callback: (progress: any) => void) {
    this.progressSimulator.onProgress(callback);
  }
}

// Mock verification manager with enhanced features
export class MockVerificationManager {
  private providers = new Map<string, MockVNPTProvider>();
  private sessions = new Map<string, VerificationSession>();
  private statistics = {
    totalAttempts: 0,
    successfulVerifications: 0,
    failedVerifications: 0,
    averageProcessingTime: 0,
  };

  async registerProvider(
    name: string,
    provider: MockVNPTProvider,
    config?: any,
  ): Promise<void> {
    await provider.initialize(config);
    this.providers.set(name, provider);
  }

  async verify(
    providerName: string,
    options: VerificationOptions,
  ): Promise<VerificationSession> {
    this.statistics.totalAttempts++;

    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }

    const session = await provider.startVerification(options);
    this.sessions.set(session.id, session);
    return session;
  }

  async getStatus(sessionId: string): Promise<VerificationStatus> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Find provider from session
    const provider = Array.from(this.providers.values())[0];
    return provider.getStatus(sessionId);
  }

  async getResult(sessionId: string): Promise<VerificationResult> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const provider = Array.from(this.providers.values())[0];
    const result = await provider.getResult(sessionId);

    // Update statistics
    if (result.success) {
      this.statistics.successfulVerifications++;
    } else {
      this.statistics.failedVerifications++;
    }

    // Clean up session
    this.sessions.delete(sessionId);

    return result;
  }

  async cancel(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      const provider = Array.from(this.providers.values())[0];
      await provider.cancel(sessionId);
      this.sessions.delete(sessionId);
    }
  }

  getStats() {
    return { ...this.statistics };
  }

  resetStats() {
    this.statistics = {
      totalAttempts: 0,
      successfulVerifications: 0,
      failedVerifications: 0,
      averageProcessingTime: 0,
    };
  }

  async cleanup() {
    for (const provider of this.providers.values()) {
      await provider.cleanup();
    }
    this.providers.clear();
    this.sessions.clear();
  }
}

// Utility functions for test setup
export const verificationTestUtils = {
  createMockProvider: (scenario?: string) => {
    const provider = new MockVNPTProvider();
    return provider;
  },

  createMockManager: () => {
    return new MockVerificationManager();
  },

  waitForProgress: (callback: (progress: any) => boolean, timeout = 10000) => {
    return new Promise<void>((resolve, reject) => {
      const startTime = Date.now();
      const checkProgress = (progress: any) => {
        if (callback(progress)) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error("Progress timeout"));
        }
      };

      // In actual usage, this would be connected to the provider's progress callbacks
      setTimeout(() => checkProgress({ step: "complete", progress: 100 }), 100);
    });
  },

  simulateNetworkConditions: (
    type: "slow" | "unstable" | "offline",
    callback: () => Promise<any>,
  ) => {
    if (type === "slow") {
      return new Promise((resolve, reject) => {
        setTimeout(async () => {
          try {
            const result = await callback();
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }, 2000);
      });
    }

    if (type === "unstable") {
      return new Promise(async (resolve, reject) => {
        for (let i = 0; i < 3; i++) {
          try {
            const result = await callback();
            if (i > 0) {
              resolve(result);
              return;
            }
          } catch (error) {
            if (i === 2) {
              reject(error);
              return;
            }
            await new Promise((r) => setTimeout(r, 1000));
          }
        }
      });
    }

    if (type === "offline") {
      return Promise.reject(new Error("Network offline"));
    }

    return callback();
  },
};
