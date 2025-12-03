/**
 * Secure Session Management
 * Implements cryptographically secure session management for OTP verification
 */

import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { serialize, parse } from 'cookie';

// Session configuration
interface SessionConfig {
  secret: string;
  maxAge: number;
  secure: boolean;
  httpOnly: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  domain?: string;
  path?: string;
  name: string;
}

// Session data interface
export interface OTPSession {
  id: string;
  phoneNumber: string;
  requestId: string;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: number;
  expiresAt: number;
  lastActivity: number;
  attempts: number;
  maxAttempts: number;
  isVerified: boolean;
  isLocked: boolean;
  lockoutUntil?: number;
  trustScore: number;
  metadata?: Record<string, any>;
}

// Session storage interface
export interface SessionStorage {
  createSession(session: OTPSession): Promise<void>;
  getSession(sessionId: string): Promise<OTPSession | null>;
  updateSession(sessionId: string, updates: Partial<OTPSession>): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
  cleanup(): Promise<void>;
  getSessionsByPhone(phoneNumber: string): Promise<OTPSession[]>;
  lockAccount(phoneNumber: string, duration: number): Promise<void>;
  isAccountLocked(phoneNumber: string): Promise<boolean>;
}

// In-memory session storage (in production, use Redis or database)
class MemorySessionStorage implements SessionStorage {
  private sessions: Map<string, OTPSession> = new Map();
  private accountLocks: Map<string, number> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired sessions every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  async createSession(session: OTPSession): Promise<void> {
    this.sessions.set(session.id, session);
  }

  async getSession(sessionId: string): Promise<OTPSession | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // Check if session has expired
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session;
  }

  async updateSession(sessionId: string, updates: Partial<OTPSession>): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      const updatedSession = { ...session, ...updates, lastActivity: Date.now() };
      this.sessions.set(sessionId, updatedSession);
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  async cleanup(): Promise<void> {
    const now = Date.now();

    // Clean up expired sessions
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(sessionId);
      }
    }

    // Clean up expired account locks
    for (const [phoneNumber, lockUntil] of this.accountLocks.entries()) {
      if (now > lockUntil) {
        this.accountLocks.delete(phoneNumber);
      }
    }
  }

  async getSessionsByPhone(phoneNumber: string): Promise<OTPSession[]> {
    const sessions: OTPSession[] = [];
    for (const session of this.sessions.values()) {
      if (session.phoneNumber === phoneNumber) {
        const validSession = await this.getSession(session.id);
        if (validSession) {
          sessions.push(validSession);
        }
      }
    }
    return sessions;
  }

  async lockAccount(phoneNumber: string, duration: number): Promise<void> {
    this.accountLocks.set(phoneNumber, Date.now() + duration);
  }

  async isAccountLocked(phoneNumber: string): Promise<boolean> {
    const lockUntil = this.accountLocks.get(phoneNumber);
    if (!lockUntil) return false;

    if (Date.now() > lockUntil) {
      this.accountLocks.delete(phoneNumber);
      return false;
    }

    return true;
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.sessions.clear();
    this.accountLocks.clear();
  }
}

// Default session configuration
const DEFAULT_SESSION_CONFIG: SessionConfig = {
  secret: process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex'),
  maxAge: 15 * 60 * 1000, // 15 minutes
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  sameSite: 'strict',
  path: '/',
  name: 'otp-session'
};

// Global session storage
const sessionStorage = new MemorySessionStorage();

// Generate cryptographically secure session ID
export function generateSecureSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Create secure session
export async function createSecureSession(
  phoneNumber: string,
  requestId: string,
  deviceId: string,
  ipAddress: string,
  userAgent: string,
  metadata?: Record<string, any>
): Promise<OTPSession> {
  const sessionId = generateSecureSessionId();
  const now = Date.now();

  const session: OTPSession = {
    id: sessionId,
    phoneNumber,
    requestId,
    deviceId,
    ipAddress,
    userAgent,
    createdAt: now,
    expiresAt: now + DEFAULT_SESSION_CONFIG.maxAge,
    lastActivity: now,
    attempts: 0,
    maxAttempts: 3,
    isVerified: false,
    isLocked: false,
    trustScore: 50,
    metadata
  };

  await sessionStorage.createSession(session);
  return session;
}

// Get session from request
export async function getSessionFromRequest(request: NextRequest): Promise<OTPSession | null> {
  const cookies = parse(request.headers.get('cookie') || '');
  const sessionId = cookies[DEFAULT_SESSION_CONFIG.name];

  if (!sessionId) return null;

  const session = await sessionStorage.getSession(sessionId);

  // Validate session integrity
  if (session) {
    // Check if user agent matches (prevents session hijacking)
    if (session.userAgent !== request.headers.get('user-agent')) {
      await sessionStorage.deleteSession(session.id);
      return null;
    }

    // Check IP address change (optional, can be too strict)
    // if (session.ipAddress !== getClientIP(request)) {
    //   await sessionStorage.deleteSession(session.id);
    //   return null;
    // }
  }

  return session;
}

// Set session cookie in response
export function setSessionCookie(response: NextResponse, sessionId: string): void {
  const cookieValue = serialize(DEFAULT_SESSION_CONFIG.name, sessionId, {
    maxAge: DEFAULT_SESSION_CONFIG.maxAge / 1000,
    secure: DEFAULT_SESSION_CONFIG.secure,
    httpOnly: DEFAULT_SESSION_CONFIG.httpOnly,
    sameSite: DEFAULT_SESSION_CONFIG.sameSite,
    path: DEFAULT_SESSION_CONFIG.path,
    domain: DEFAULT_SESSION_CONFIG.domain
  });

  response.headers.set('Set-Cookie', cookieValue);
}

// Clear session cookie
export function clearSessionCookie(response: NextResponse): void {
  const cookieValue = serialize(DEFAULT_SESSION_CONFIG.name, '', {
    maxAge: 0,
    secure: DEFAULT_SESSION_CONFIG.secure,
    httpOnly: DEFAULT_SESSION_CONFIG.httpOnly,
    sameSite: DEFAULT_SESSION_CONFIG.sameSite,
    path: DEFAULT_SESSION_CONFIG.path,
    domain: DEFAULT_SESSION_CONFIG.domain
  });

  response.headers.set('Set-Cookie', cookieValue);
}

// Update session activity
export async function updateSessionActivity(sessionId: string): Promise<void> {
  await sessionStorage.updateSession(sessionId, { lastActivity: Date.now() });
}

// Increment session attempts
export async function incrementSessionAttempts(sessionId: string): Promise<OTPSession | null> {
  const session = await sessionStorage.getSession(sessionId);
  if (!session) return null;

  const newAttempts = session.attempts + 1;
  const isLocked = newAttempts >= session.maxAttempts;
  const lockoutUntil = isLocked ? Date.now() + (15 * 60 * 1000) : undefined; // 15 minutes

  await sessionStorage.updateSession(sessionId, {
    attempts: newAttempts,
    isLocked,
    lockoutUntil
  });

  // Lock account if max attempts exceeded
  if (isLocked) {
    await sessionStorage.lockAccount(session.phoneNumber, 15 * 60 * 1000);
  }

  return await sessionStorage.getSession(sessionId);
}

// Verify session
export async function verifySession(sessionId: string): Promise<OTPSession | null> {
  const session = await sessionStorage.getSession(sessionId);
  if (!session) return null;

  if (session.isVerified || session.isLocked) {
    return session;
  }

  await sessionStorage.updateSession(sessionId, {
    isVerified: true,
    expiresAt: Date.now() + (5 * 60 * 1000) // Extend session for 5 more minutes
  });

  return await sessionStorage.getSession(sessionId);
}

// Lock session
export async function lockSession(sessionId: string, duration: number): Promise<void> {
  const session = await sessionStorage.getSession(sessionId);
  if (session) {
    await sessionStorage.updateSession(sessionId, {
      isLocked: true,
      lockoutUntil: Date.now() + duration
    });

    await sessionStorage.lockAccount(session.phoneNumber, duration);
  }
}

// Check if phone number is currently locked
export async function isPhoneNumberLocked(phoneNumber: string): Promise<boolean> {
  return await sessionStorage.isAccountLocked(phoneNumber);
}

// Get all active sessions for a phone number
export async function getActiveSessions(phoneNumber: string): Promise<OTPSession[]> {
  return await sessionStorage.getSessionsByPhone(phoneNumber);
}

// Revoke all sessions for a phone number
export async function revokeAllSessions(phoneNumber: string): Promise<void> {
  const sessions = await sessionStorage.getSessionsByPhone(phoneNumber);
  for (const session of sessions) {
    await sessionStorage.deleteSession(session.id);
  }
}

// Session validation middleware
export function requireValidSession() {
  return async function middleware(request: NextRequest) {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: 'No valid session found',
          error: 'SESSION_REQUIRED'
        },
        { status: 401 }
      );
    }

    if (session.isLocked || (session.lockoutUntil && Date.now() < session.lockoutUntil)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Session is locked due to too many failed attempts',
          error: 'SESSION_LOCKED',
          lockoutUntil: session.lockoutUntil
        },
        { status: 423 }
      );
    }

    if (Date.now() > session.expiresAt) {
      return NextResponse.json(
        {
          success: false,
          message: 'Session has expired',
          error: 'SESSION_EXPIRED'
        },
        { status: 401 }
      );
    }

    // Update last activity
    await updateSessionActivity(session.id);

    // Add session to request for further processing
    (request as any).session = session;
    return null; // Allow request to proceed
  };
}

// CSRF token utilities
export class CSRFProtection {
  private static readonly TOKEN_LENGTH = 32;
  private static readonly COOKIE_NAME = 'csrf-token';

  static generateToken(): string {
    return crypto.randomBytes(this.TOKEN_LENGTH).toString('hex');
  }

  static validateToken(request: NextRequest): boolean {
    const cookies = parse(request.headers.get('cookie') || '');
    const cookieToken = cookies[this.COOKIE_NAME];

    if (!cookieToken) return false;

    // Check token in header or body
    const headerToken = request.headers.get('x-csrf-token');
    if (headerToken) {
      return crypto.timingSafeEqual(
        Buffer.from(cookieToken, 'hex'),
        Buffer.from(headerToken, 'hex')
      );
    }

    // For POST requests, check body (would need to be implemented based on request parsing)
    return false;
  }

  static setCSRFCookie(response: NextResponse): void {
    const token = this.generateToken();
    const cookieValue = serialize(this.COOKIE_NAME, token, {
      maxAge: DEFAULT_SESSION_CONFIG.maxAge / 1000,
      secure: DEFAULT_SESSION_CONFIG.secure,
      httpOnly: DEFAULT_SESSION_CONFIG.httpOnly,
      sameSite: DEFAULT_SESSION_CONFIG.sameSite,
      path: DEFAULT_SESSION_CONFIG.path,
      domain: DEFAULT_SESSION_CONFIG.domain
    });

    response.headers.set('Set-Cookie', cookieValue);
    response.headers.set('X-CSRF-Token', token);
  }
}

// CSRF validation middleware
export function requireCSRFProtection() {
  return async function middleware(request: NextRequest) {
    // Skip CSRF for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return null;
    }

    if (!CSRFProtection.validateToken(request)) {
      return NextResponse.json(
        {
          success: false,
          message: 'CSRF token validation failed',
          error: 'CSRF_INVALID'
        },
        { status: 403 }
      );
    }

    return null;
  };
}

// Cleanup function for graceful shutdown
export function cleanupSessionManagement(): void {
  sessionStorage.destroy();
}

// Export session storage for testing
export { MemorySessionStorage, sessionStorage };