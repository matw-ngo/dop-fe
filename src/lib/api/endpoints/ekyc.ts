export interface EkycSession {
  sessionId: string;
  ekycId?: string;
  token?: string;
  expiresAt?: string;
  [key: string]: unknown;
}

export interface DocumentVerificationResponse {
  success?: boolean;
  confidence?: number;
  isValid?: boolean;
  warnings?: string[];
  errors?: string[];
  metadata?: Record<string, string>;
  [key: string]: unknown;
}

export interface FaceVerificationResponse {
  success?: boolean;
  confidence?: number;
  isLive?: boolean;
  warnings?: string[];
  errors?: string[];
  metadata?: Record<string, string>;
  [key: string]: unknown;
}

export interface FaceComparisonResponse {
  confidence?: number;
  similarity?: number;
  match?: boolean;
  isMatch?: boolean;
  metadata?: Record<string, string>;
  [key: string]: unknown;
}
