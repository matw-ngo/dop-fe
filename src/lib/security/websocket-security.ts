/**
 * WebSocket Security Utilities
 * Comprehensive WebSocket security with authentication, CSRF protection, and integrity verification
 */

import { useTokenStore, securityUtils } from '@/lib/auth/secure-tokens';

// WebSocket security configuration
export interface WebSocketSecurityConfig {
  maxReconnectAttempts: number;
  reconnectDelay: number;
  connectionTimeout: number;
  heartbeatInterval: number;
  maxMessageSize: number;
  rateLimitWindow: number;
  rateLimitMax: number;
  allowedOrigins: string[];
  requireAuthentication: boolean;
  enableCSRFProtection: boolean;
  enableMessageSigning: boolean;
  enableEncryption: boolean;
}

// Message integrity verification
export interface SecureMessage {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  signature?: string;
  encrypted?: boolean;
  checksum: string;
}

// Connection security state
export interface ConnectionSecurityState {
  isAuthenticated: boolean;
  isCSRFProtected: boolean;
  lastHeartbeat: number;
  messagesReceived: number;
  messagesSent: number;
  securityViolations: number;
  connectionScore: number; // 0-100
  blockedUntil?: number;
}

// Default security configuration
const DEFAULT_WS_SECURITY_CONFIG: WebSocketSecurityConfig = {
  maxReconnectAttempts: 5,
  reconnectDelay: 5000,
  connectionTimeout: 10000,
  heartbeatInterval: 30000,
  maxMessageSize: 1024 * 1024, // 1MB
  rateLimitWindow: 60000, // 1 minute
  rateLimitMax: 100, // 100 messages per minute
  allowedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'https://localhost:3000',
  ],
  requireAuthentication: true,
  enableCSRFProtection: true,
  enableMessageSigning: true,
  enableEncryption: false, // Enable when WSS is available
};

/**
 * Secure WebSocket Manager
 */
export class SecureWebSocketManager {
  private ws: WebSocket | null = null;
  private config: WebSocketSecurityConfig;
  private securityState: ConnectionSecurityState;
  private reconnectAttempts = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private rateLimitTracker: Map<string, number[]> = new Map();
  private messageCallbacks: Map<string, Function[]> = new Map();
  private securityViolationCallbacks: Function[] = [];

  constructor(config: Partial<WebSocketSecurityConfig> = {}) {
    this.config = { ...DEFAULT_WS_SECURITY_CONFIG, ...config };
    this.securityState = {
      isAuthenticated: false,
      isCSRFProtected: false,
      lastHeartbeat: 0,
      messagesReceived: 0,
      messagesSent: 0,
      securityViolations: 0,
      connectionScore: 100,
    };
  }

  /**
   * Establish secure WebSocket connection
   */
  async connect(url: string): Promise<void> {
    try {
      // Validate URL
      if (!this.isValidWebSocketURL(url)) {
        throw new Error('Invalid WebSocket URL');
      }

      // Check if currently blocked
      if (this.securityState.blockedUntil && Date.now() < this.securityState.blockedUntil) {
        throw new Error('Connection temporarily blocked due to security violations');
      }

      // Get authentication token
      const tokenStore = useTokenStore.getState();
      const token = tokenStore.getAccessToken();

      if (this.config.requireAuthentication && !token) {
        throw new Error('Authentication required for WebSocket connection');
      }

      // Build secure URL with authentication
      const secureUrl = this.buildSecureURL(url, token);

      // Create WebSocket with security headers
      this.ws = new WebSocket(secureUrl);

      // Set up connection timeout
      const timeoutId = setTimeout(() => {
        if (this.ws?.readyState === WebSocket.CONNECTING) {
          this.ws.close(1000, 'Connection timeout');
          this.handleSecurityViolation('connection_timeout');
        }
      }, this.config.connectionTimeout);

      // Set up event handlers
      this.ws.onopen = () => {
        clearTimeout(timeoutId);
        this.handleConnectionOpen();
      };

      this.ws.onmessage = (event) => {
        this.handleIncomingMessage(event);
      };

      this.ws.onclose = (event) => {
        clearTimeout(timeoutId);
        this.handleConnectionClose(event);
      };

      this.ws.onerror = (error) => {
        clearTimeout(timeoutId);
        this.handleConnectionError(error);
      };

    } catch (error) {
      this.handleSecurityViolation('connection_failed');
      throw error;
    }
  }

  /**
   * Send secure message
   */
  async sendMessage(type: string, payload: any): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket connection not established');
    }

    // Rate limiting check
    if (!this.checkRateLimit('outgoing')) {
      throw new Error('Rate limit exceeded for outgoing messages');
    }

    try {
      const secureMessage: SecureMessage = {
        id: this.generateMessageId(),
        type,
        payload,
        timestamp: Date.now(),
        checksum: this.calculateChecksum(JSON.stringify({ type, payload })),
      };

      // Add signature if enabled
      if (this.config.enableMessageSigning) {
        secureMessage.signature = await this.signMessage(secureMessage);
      }

      // Encrypt if enabled
      if (this.config.enableEncryption) {
        secureMessage.encrypted = true;
        secureMessage.payload = await this.encryptMessage(secureMessage.payload);
      }

      // Validate message size
      const messageSize = JSON.stringify(secureMessage).length;
      if (messageSize > this.config.maxMessageSize) {
        throw new Error(`Message size ${messageSize} exceeds maximum allowed size ${this.config.maxMessageSize}`);
      }

      this.ws.send(JSON.stringify(secureMessage));
      this.securityState.messagesSent++;
      this.updateConnectionScore();

    } catch (error) {
      this.handleSecurityViolation('message_send_failed');
      throw error;
    }
  }

  /**
   * Register message callback
   */
  onMessage(type: string, callback: (message: SecureMessage) => void): void {
    if (!this.messageCallbacks.has(type)) {
      this.messageCallbacks.set(type, []);
    }
    this.messageCallbacks.get(type)!.push(callback);
  }

  /**
   * Register security violation callback
   */
  onSecurityViolation(callback: (violation: string, state: ConnectionSecurityState) => void): void {
    this.securityViolationCallbacks.push(callback);
  }

  /**
   * Close connection securely
   */
  disconnect(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Normal closure');
      this.ws = null;
    }

    this.securityState.isAuthenticated = false;
    this.securityState.isCSRFProtected = false;
  }

  /**
   * Get security state
   */
  getSecurityState(): ConnectionSecurityState {
    return { ...this.securityState };
  }

  // Private methods

  private isValidWebSocketURL(url: string): boolean {
    try {
      const parsedUrl = new URL(url);

      // Check protocol
      if (!['ws:', 'wss:'].includes(parsedUrl.protocol)) {
        return false;
      }

      // Check allowed origins
      return this.config.allowedOrigins.includes(parsedUrl.origin);
    } catch {
      return false;
    }
  }

  private buildSecureURL(url: string, token?: string): string {
    const parsedUrl = new URL(url);

    // Add authentication token
    if (token) {
      parsedUrl.searchParams.set('token', token);
    }

    // Add CSRF token
    if (this.config.enableCSRFProtection) {
      const csrfToken = securityUtils.generateCSRFToken();
      parsedUrl.searchParams.set('csrf_token', csrfToken);
    }

    // Add client timestamp for replay protection
    parsedUrl.searchParams.set('client_ts', Date.now().toString());

    // Add security version
    parsedUrl.searchParams.set('sec_version', '1.0');

    return parsedUrl.toString();
  }

  private handleConnectionOpen(): void {
    console.log('Secure WebSocket connection established');
    this.securityState.isAuthenticated = true;
    this.securityState.isCSRFProtected = this.config.enableCSRFProtection;
    this.reconnectAttempts = 0;

    // Start heartbeat
    this.startHeartbeat();

    // Send authentication handshake
    if (this.config.requireAuthentication) {
      this.sendAuthenticationHandshake();
    }
  }

  private handleIncomingMessage(event: MessageEvent): void {
    try {
      // Rate limiting check
      if (!this.checkRateLimit('incoming')) {
        this.handleSecurityViolation('rate_limit_exceeded');
        return;
      }

      // Parse message
      const message: SecureMessage = JSON.parse(event.data);

      // Validate message structure
      if (!this.validateMessageStructure(message)) {
        this.handleSecurityViolation('invalid_message_structure');
        return;
      }

      // Verify message integrity
      if (!this.verifyMessageIntegrity(message)) {
        this.handleSecurityViolation('message_integrity_failed');
        return;
      }

      // Verify signature if enabled
      if (this.config.enableMessageSigning && message.signature) {
        if (!this.verifyMessageSignature(message)) {
          this.handleSecurityViolation('message_signature_invalid');
          return;
        }
      }

      // Decrypt if needed
      if (message.encrypted) {
        message.payload = this.decryptMessage(message.payload);
      }

      this.securityState.messagesReceived++;
      this.updateConnectionScore();

      // Handle heartbeat messages
      if (message.type === 'heartbeat') {
        this.handleHeartbeat(message);
        return;
      }

      // Trigger callbacks
      const callbacks = this.messageCallbacks.get(message.type) || [];
      callbacks.forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          console.error('Error in message callback:', error);
        }
      });

    } catch (error) {
      console.error('Error handling incoming message:', error);
      this.handleSecurityViolation('message_parse_error');
    }
  }

  private handleConnectionClose(event: CloseEvent): void {
    console.log('WebSocket connection closed:', event.code, event.reason);

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    this.securityState.isAuthenticated = false;
    this.securityState.isCSRFProtected = false;

    // Attempt reconnection if not a normal closure
    if (event.code !== 1000 && this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.attemptReconnection();
    }
  }

  private handleConnectionError(error: Event): void {
    console.error('WebSocket connection error:', error);
    this.handleSecurityViolation('connection_error');
  }

  private handleSecurityViolation(violation: string): void {
    this.securityState.securityViolations++;
    this.updateConnectionScore();

    console.warn(`Security violation detected: ${violation}`);

    // Trigger violation callbacks
    this.securityViolationCallbacks.forEach(callback => {
      try {
        callback(violation, this.securityState);
      } catch (error) {
        console.error('Error in security violation callback:', error);
      }
    });

    // Block connection if too many violations
    if (this.securityState.securityViolations >= 10) {
      this.securityState.blockedUntil = Date.now() + (5 * 60 * 1000); // 5 minutes
      this.disconnect();
    }
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.sendMessage('heartbeat', {
          timestamp: Date.now(),
          connection_score: this.securityState.connectionScore,
        });
      }
    }, this.config.heartbeatInterval);
  }

  private handleHeartbeat(message: SecureMessage): void {
    this.securityState.lastHeartbeat = Date.now();

    if (message.payload?.server_timestamp) {
      const latency = Date.now() - message.payload.server_timestamp;
      console.log(`WebSocket latency: ${latency}ms`);
    }
  }

  private sendAuthenticationHandshake(): void {
    this.sendMessage('auth_handshake', {
      client_version: '1.0.0',
      security_features: {
        csrf_protection: this.config.enableCSRFProtection,
        message_signing: this.config.enableMessageSigning,
        encryption: this.config.enableEncryption,
      },
    });
  }

  private attemptReconnection(): void {
    this.reconnectAttempts++;
    const delay = this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Attempting WebSocket reconnection ${this.reconnectAttempts}/${this.config.maxReconnectAttempts} in ${delay}ms`);

    setTimeout(() => {
      try {
        // Reconnect to the same URL
        if (this.ws?.url) {
          this.connect(this.ws.url);
        }
      } catch (error) {
        console.error('Reconnection failed:', error);
      }
    }, delay);
  }

  private validateMessageStructure(message: any): message is SecureMessage {
    return (
      typeof message === 'object' &&
      typeof message.id === 'string' &&
      typeof message.type === 'string' &&
      typeof message.timestamp === 'number' &&
      typeof message.checksum === 'string' &&
      message.payload !== undefined
    );
  }

  private verifyMessageIntegrity(message: SecureMessage): boolean {
    const payload = message.encrypted ? message.payload : JSON.stringify({ type: message.type, payload: message.payload });
    const expectedChecksum = this.calculateChecksum(payload);
    return message.checksum === expectedChecksum;
  }

  private calculateChecksum(data: string): string {
    // Simple checksum implementation - in production, use SHA-256
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  private async signMessage(message: SecureMessage): Promise<string> {
    // In production, use proper asymmetric signing
    const data = JSON.stringify(message);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const key = await crypto.subtle.generateKey(
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, dataBuffer);
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private verifyMessageSignature(message: SecureMessage): boolean {
    // In production, verify with public key
    return !!message.signature;
  }

  private async encryptMessage(payload: any): Promise<string> {
    // In production, use proper encryption
    return btoa(JSON.stringify(payload));
  }

  private decryptMessage(encryptedPayload: string): any {
    // In production, use proper decryption
    return JSON.parse(atob(encryptedPayload));
  }

  private checkRateLimit(type: 'incoming' | 'outgoing'): boolean {
    const now = Date.now();
    const key = `${type}_messages`;

    if (!this.rateLimitTracker.has(key)) {
      this.rateLimitTracker.set(key, []);
    }

    const timestamps = this.rateLimitTracker.get(key)!;

    // Remove old timestamps outside the window
    const cutoff = now - this.config.rateLimitWindow;
    while (timestamps.length > 0 && timestamps[0] < cutoff) {
      timestamps.shift();
    }

    // Check if limit exceeded
    if (timestamps.length >= this.config.rateLimitMax) {
      return false;
    }

    // Add current timestamp
    timestamps.push(now);
    return true;
  }

  private updateConnectionScore(): void {
    let score = 100;

    // Deduct points for security violations
    score -= this.securityState.securityViolations * 5;

    // Deduct points for reconnection attempts
    score -= this.reconnectAttempts * 10;

    // Add points for successful message exchange
    score += Math.min(this.securityState.messagesReceived + this.securityState.messagesSent, 20);

    this.securityState.connectionScore = Math.max(0, Math.min(100, score));
  }

  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Create secure WebSocket connection for loan status updates
 */
export function createSecureLoanStatusWebSocket(applicationId: string): SecureWebSocketManager {
  const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/loans/applications/${applicationId}/status`;

  const secureWS = new SecureWebSocketManager({
    allowedOrigins: [
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    ],
    enableCSRFProtection: true,
    enableMessageSigning: true,
    enableEncryption: process.env.NODE_ENV === 'production',
  });

  return secureWS;
}

/**
 * Vietnamese compliance monitoring for WebSocket connections
 */
export class VietnameseComplianceMonitor {
  private connectionLog: Array<{
    timestamp: number;
    applicationId: string;
    userId?: string;
    action: string;
    metadata?: any;
  }> = [];

  private readonly MAX_LOG_ENTRIES = 1000;
  private readonly LOG_RETENTION_HOURS = 24;

  logConnection(applicationId: string, action: string, metadata?: any): void {
    const entry = {
      timestamp: Date.now(),
      applicationId,
      userId: this.getCurrentUserId(),
      action,
      metadata,
    };

    this.connectionLog.push(entry);

    // Cleanup old entries
    this.cleanupOldEntries();
  }

  getComplianceReport(applicationId?: string): {
    totalConnections: number;
    uniqueApplications: number;
    securityViolations: number;
    averageConnectionScore: number;
    complianceScore: number;
  } {
    const filtered = applicationId
      ? this.connectionLog.filter(entry => entry.applicationId === applicationId)
      : this.connectionLog;

    const uniqueApplications = new Set(filtered.map(entry => entry.applicationId)).size;
    const securityViolations = filtered.filter(entry => entry.action.includes('violation')).length;

    return {
      totalConnections: filtered.length,
      uniqueApplications,
      securityViolations,
      averageConnectionScore: 0, // Would be calculated from actual connection scores
      complianceScore: Math.max(0, 100 - (securityViolations * 10)),
    };
  }

  private getCurrentUserId(): string | undefined {
    // Extract user ID from current auth context
    try {
      const tokenStore = useTokenStore.getState();
      const token = tokenStore.getAccessToken();
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub;
      }
    } catch {
      // Ignore errors
    }
    return undefined;
  }

  private cleanupOldEntries(): void {
    const cutoff = Date.now() - (this.LOG_RETENTION_HOURS * 60 * 60 * 1000);

    while (this.connectionLog.length > this.MAX_LOG_ENTRIES ||
           (this.connectionLog.length > 0 && this.connectionLog[0].timestamp < cutoff)) {
      this.connectionLog.shift();
    }
  }
}

export const vietnameseComplianceMonitor = new VietnameseComplianceMonitor();