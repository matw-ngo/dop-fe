# DOP-FE Security Best Practices

## Authentication and Authorization

### Token Management
- **JWT Implementation**: Secure token handling with proper validation
- **Token Storage**: Secure storage mechanisms
- **Token Refresh**: Secure refresh token flow
- **Token Expiration**: Proper expiration handling

#### Secure Token Implementation
```typescript
// ✅ Secure token management
interface TokenManager {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}

class SecureTokenManager implements TokenManager {
  private readonly TOKEN_KEY = 'auth_tokens';
  private readonly REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes

  getAccessToken(): string | null {
    const tokens = this.getTokens();
    
    if (!tokens.accessToken) {
      return null;
    }
    
    // Check if token is expired or will expire soon
    if (tokens.expiresAt && tokens.expiresAt < Date.now() + this.REFRESH_THRESHOLD) {
      this.refreshToken();
      return null;
    }
    
    return tokens.accessToken;
  }

  setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    const tokens = {
      accessToken,
      refreshToken,
      expiresAt: Date.now() + (expiresIn * 1000)
    };
    
    // Store in secure storage
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.TOKEN_KEY, JSON.stringify(tokens));
    }
  }

  private getTokens(): TokenManager {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(this.TOKEN_KEY);
        return stored ? JSON.parse(stored) : { accessToken: null, refreshToken: null, expiresAt: null };
      }
    } catch {
      return { accessToken: null, refreshToken: null, expiresAt: null };
    }
  }

  async refreshToken(): Promise<boolean> {
    const tokens = this.getTokens();
    
    if (!tokens.refreshToken) {
      return false;
    }
    
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });
      
      if (response.ok) {
        const { accessToken, refreshToken, expiresIn } = await response.json();
        this.setTokens(accessToken, refreshToken, expiresIn);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return false;
    }
    
    return false;
  }

  clearTokens(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }
}
```

### Session Management
- **Session Security**: Secure session handling
- **Session Timeout**: Appropriate timeout configuration
- **Session Invalidation**: Proper invalidation mechanisms
- **Multi-session Handling**: Secure multi-session management

#### Secure Session Implementation
```typescript
// ✅ Secure session management
interface SessionManager {
  createSession(user: User): Promise<Session>;
  validateSession(sessionId: string): Promise<boolean>;
  invalidateSession(sessionId: string): Promise<void>;
  extendSession(sessionId: string): Promise<void>;
}

class SecureSessionManager implements SessionManager {
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly sessions = new Map<string, Session>();

  async createSession(user: User): Promise<Session> {
    const sessionId = this.generateSecureId();
    const session: Session = {
      id: sessionId,
      userId: user.id,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.SESSION_TIMEOUT,
      lastActivity: Date.now(),
      userAgent: this.getUserAgent(),
      ipAddress: await this.getClientIP(),
    };
    
    this.sessions.set(sessionId, session);
    return session;
  }

  async validateSession(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return false;
    }
    
    // Check if session has expired
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(sessionId);
      return false;
    }
    
    // Update last activity
    session.lastActivity = Date.now();
    session.expiresAt = Date.now() + this.SESSION_TIMEOUT;
    
    return true;
  }

  async invalidateSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
    
    // Log session invalidation for security monitoring
    this.logSecurityEvent('session_invalidated', {
      sessionId,
      timestamp: Date.now(),
      reason: 'user_logout_or_security_violation'
    });
  }

  private generateSecureId(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private async getClientIP(): Promise<string> {
    // In production, this should be done server-side
    // For demo purposes, we'll use a placeholder
    return 'client-ip-placeholder';
  }

  private getUserAgent(): string {
    return typeof window !== 'undefined' ? navigator.userAgent : 'unknown';
  }

  private logSecurityEvent(event: string, data: any): void {
    // Send to security monitoring service
    fetch('/api/security/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, data, timestamp: Date.now() })
    }).catch(console.error);
  }
}
```

## Data Protection

### Sensitive Data Handling
- **PII Protection**: Protect personally identifiable information
- **Data Encryption**: Encrypt sensitive data at rest and in transit
- **Data Masking**: Mask sensitive data in logs and UI
- **Data Sanitization**: Proper input sanitization

#### PII Protection Implementation
```typescript
// ✅ PII protection utilities
interface PIIField {
  value: string;
  isPII: boolean;
  maskChar?: string;
  visibleChars?: number;
}

class PIIProtection {
  static maskPII(field: PIIField): string {
    if (!field.isPII || !field.value) {
      return field.value;
    }
    
    const { maskChar = '*', visibleChars = 4 } = field;
    
    if (field.value.length <= visibleChars) {
      return field.value;
    }
    
    const visiblePart = field.value.substring(0, visibleChars);
    const maskedPart = maskChar.repeat(field.value.length - visibleChars);
    
    return visiblePart + maskedPart;
  }

  static sanitizeLogData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }
    
    const sensitiveFields = ['password', 'ssn', 'creditCard', 'email', 'phone'];
    const sanitized = { ...data };
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = this.maskPII({
          value: sanitized[field],
          isPII: true
        });
      }
    }
    
    return sanitized;
  }

  static validatePIIAccess(user: User, data: any): boolean {
    // Implement role-based access control
    const hasAccess = user.role === 'admin' || 
                     user.permissions?.includes('pii_access');
    
    if (!hasAccess) {
      this.logUnauthorizedAccess(user, data);
      return false;
    }
    
    return true;
  }

  private static logUnauthorizedAccess(user: User, data: any): void {
    // Log security violation
    fetch('/api/security/unauthorized-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        attemptedAccess: data,
        timestamp: Date.now(),
        severity: 'high'
      })
    }).catch(console.error);
  }
}

// Usage examples
const userData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  ssn: '123-45-6789',
  phone: '+1-555-123-4567'
};

// ✅ Masked display
const maskedEmail = PIIProtection.maskPII({
  value: userData.email,
  isPII: true,
  visibleChars: 2
}); // "jo************"

// ✅ Sanitized logging
console.log('User data:', PIIProtection.sanitizeLogData(userData));
// { name: 'John Doe', email: 'jo************', ssn: '***', phone: '+1*******567' }
```

### Input Validation
- **Form Validation**: Comprehensive client-side validation
- **API Validation**: Server-side validation enforcement
- **XSS Prevention**: Cross-site scripting prevention
- **SQL Injection Prevention**: Database query protection

#### Secure Input Validation
```typescript
// ✅ Comprehensive input validation
import { z } from 'zod';

// Validation schemas
const securePasswordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const secureEmailSchema = z.string()
  .email('Invalid email format')
  .max(254, 'Email address too long')
  .refine(email => {
    const domain = email.split('@')[1];
    return domain && !domain.includes('..');
  }, 'Invalid email domain');

const securePhoneSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .max(15, 'Phone number too long');

// XSS prevention
const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

// SQL injection prevention
const sanitizeSQLInput = (input: string): string => {
  return input
    .replace(/[';\\]/g, '') // Remove SQL delimiters
    .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b/gi, '')
    .replace(/--/g, '') // Remove SQL comments
    .trim();
};

// Validation hook
const useSecureValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validateField = useCallback((
    field: string, 
    value: string, 
    schema: z.ZodSchema
  ): boolean => {
    try {
      schema.parse(value);
      setErrors(prev => ({ ...prev, [field]: '' }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, [field]: error.errors[0]?.message || 'Invalid input' }));
      }
      return false;
    }
  }, []);
  
  const validateForm = useCallback((data: Record<string, any>, schemas: Record<string, z.ZodSchema>): boolean => {
    let isValid = true;
    const newErrors: Record<string, string> = {};
    
    for (const [field, value] of Object.entries(data)) {
      const schema = schemas[field];
      if (schema) {
        try {
          schema.parse(value);
        } catch (error) {
          if (error instanceof z.ZodError) {
            newErrors[field] = error.errors[0]?.message || 'Invalid input';
            isValid = false;
          }
        }
      }
    }
    
    setErrors(newErrors);
    return isValid;
  }, []);
  
  return { errors, validateField, validateForm };
};
```

## Environment Security

### Environment Variables
- **Secret Management**: Secure handling of secrets
- **Environment Isolation**: Proper environment separation
- **Variable Validation**: Validate environment variables
- **Audit Trail**: Environment variable access logging

#### Secure Environment Configuration
```typescript
// ✅ Secure environment variable management
interface EnvironmentConfig {
  API_URL: string;
  USE_MOCK_API: boolean;
  EKYC_CONFIG: {
    AUTH_TOKEN: string;
    BACKEND_URL: string;
    ENVIRONMENT: 'development' | 'staging' | 'production';
  };
  ANALYTICS_ID?: string;
  FEATURE_FLAGS: {
    ENABLE_DEBUG: boolean;
    ENABLE_ANALYTICS: boolean;
  };
}

class SecureEnvironmentManager {
  private static instance: SecureEnvironmentManager;
  private config: EnvironmentConfig;
  private readonly requiredVars = ['API_URL', 'EKYC_CONFIG.AUTH_TOKEN'];

  private constructor() {
    this.validateEnvironment();
    this.config = this.loadConfig();
  }

  static getInstance(): SecureEnvironmentManager {
    if (!SecureEnvironmentManager.instance) {
      SecureEnvironmentManager.instance = new SecureEnvironmentManager();
    }
    return SecureEnvironmentManager.instance;
  }

  private validateEnvironment(): void {
    const missingVars = this.requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
    
    // Validate specific formats
    if (process.env.EKYC_CONFIG?.AUTH_TOKEN && 
        process.env.EKYC_CONFIG.AUTH_TOKEN.length < 32) {
      throw new Error('EKYC_AUTH_TOKEN must be at least 32 characters');
    }
    
    // Log environment validation
    this.logSecurityEvent('environment_validated', {
      timestamp: Date.now(),
      nodeEnv: process.env.NODE_ENV,
      hasRequiredVars: missingVars.length === 0
    });
  }

  private loadConfig(): EnvironmentConfig {
    return {
      API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://dop-stg.datanest.vn/v1',
      USE_MOCK_API: process.env.NEXT_PUBLIC_USE_MOCK_API === 'true',
      EKYC_CONFIG: {
        AUTH_TOKEN: process.env.EKYC_AUTH_TOKEN || '',
        BACKEND_URL: process.env.EKYC_BACKEND_URL || 'https://ekyc-backend.com',
        ENVIRONMENT: (process.env.EKYC_ENVIRONMENT as any) || 'development'
      },
      ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID,
      FEATURE_FLAGS: {
        ENABLE_DEBUG: process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true',
        ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true'
      }
    };
  }

  getConfig(): EnvironmentConfig {
    return { ...this.config };
  }

  isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  private logSecurityEvent(event: string, data: any): void {
    // In production, send to security monitoring service
    if (this.isProduction()) {
      fetch('/api/security/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, data, timestamp: Date.now() })
      }).catch(console.error);
    } else {
      console.log('Security Event:', { event, data });
    }
  }
}

// Usage
const envManager = SecureEnvironmentManager.getInstance();
const config = envManager.getConfig();
```

### Build Security
- **Dependency Scanning**: Regular security scans
- **Code Analysis**: Static code analysis
- **Build Integrity**: Verified build process
- **Supply Chain Security**: Secure dependency management

#### Secure Build Process
```bash
#!/bin/bash
# ✅ Secure build script

# 1. Dependency security scan
echo "🔍 Running dependency security scan..."
npm audit --audit-level high --audit-level moderate

if [ $? -ne 0 ]; then
  echo "❌ Security vulnerabilities found!"
  exit 1
fi

# 2. Code security analysis
echo "🔍 Running static code analysis..."
npx eslint . --ext .js,.jsx,.ts,.tsx --config .eslintrc.security.js

# 3. Build integrity check
echo "🔍 Verifying build integrity..."
npm run build

# 4. Generate SBOM (Software Bill of Materials)
echo "📋 Generating SBOM..."
npx @cyclonedx/bom --output-format json --output-file sbom.json

# 5. Verify no secrets in build
echo "🔍 Checking for exposed secrets..."
if grep -r "password\|secret\|token\|key" out/; then
  echo "❌ Potential secrets found in build!"
  exit 1
fi

echo "✅ Build security checks passed!"
```

## Network Security

### HTTPS Implementation
- **SSL Configuration**: Proper SSL/TLS setup
- **Certificate Management**: Certificate renewal and monitoring
- **HSTS Implementation**: HTTP Strict Transport Security
- **Mixed Content Prevention**: Prevent mixed content issues

#### Secure HTTPS Configuration
```nginx
# ✅ Secure Nginx configuration
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL Configuration
    ssl_certificate /etc/ssl/certs/your-domain.com.crt;
    ssl_certificate_key /etc/ssl/private/your-domain.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-SHA384:DHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!DSS;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.your-domain.com; frame-ancestors 'none';" always;
    
    # Redirect HTTP to HTTPS
    if ($scheme != "https") {
        return 301 https://$host$request_uri;
    }
    
    location / {
        # Your application configuration
        try_files $uri $uri/ /index.html;
        
        # Additional security rules
        client_max_body_size 10M;
        client_body_timeout 60s;
    }
}
```

### CORS Configuration
- **Origin Validation**: Strict origin validation
- **Method Validation**: Allowed HTTP methods
- **Header Validation**: Allowed headers configuration
- **Credential Handling**: Secure credential handling

#### Secure CORS Implementation
```typescript
// ✅ Secure CORS middleware
interface CORSConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  credentials: boolean;
  maxAge: number;
}

class SecureCORS {
  private config: CORSConfig;

  constructor(config: CORSConfig) {
    this.config = {
      allowedOrigins: ['https://your-domain.com', 'https://admin.your-domain.com'],
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true,
      maxAge: 86400, // 24 hours
      ...config
    };
  }

  middleware = (req: Request, res: Response, next: Function) => {
    const origin = req.headers.get('origin');
    
    // Validate origin
    if (!this.isOriginAllowed(origin)) {
      return res.status(403).json({ error: 'Origin not allowed' });
    }
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.headers.set('Access-Control-Allow-Origin', origin);
      res.headers.set('Access-Control-Allow-Methods', this.config.allowedMethods.join(', '));
      res.headers.set('Access-Control-Allow-Headers', this.config.allowedHeaders.join(', '));
      res.headers.set('Access-Control-Max-Age', this.config.maxAge.toString());
      
      if (this.config.credentials) {
        res.headers.set('Access-Control-Allow-Credentials', 'true');
      }
      
      return res.status(200).end();
    }
    
    // Add CORS headers to actual requests
    res.headers.set('Access-Control-Allow-Origin', origin);
    if (this.config.credentials) {
      res.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    
    next();
  };

  private isOriginAllowed(origin: string | null): boolean {
    if (!origin) return false;
    
    return this.config.allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin === '*') return true;
      
      // Support subdomains
      if (allowedOrigin.startsWith('*.')) {
        const domain = allowedOrigin.substring(2);
        return origin.endsWith(domain) || origin === domain;
      }
      
      return origin === allowedOrigin;
    });
  }
}
```

## Security Monitoring

### Security Auditing
- **Security Headers**: Implement comprehensive security headers
- **Content Security Policy**: Strong CSP configuration
- **Security Testing**: Regular security testing
- **Vulnerability Scanning**: Automated vulnerability detection

#### Security Headers Implementation
```typescript
// ✅ Comprehensive security headers
interface SecurityHeaders {
  'Strict-Transport-Security': string;
  'X-Frame-Options': string;
  'X-Content-Type-Options': string;
  'X-XSS-Protection': string;
  'Referrer-Policy': string;
  'Content-Security-Policy': string;
  'Permissions-Policy': string;
}

class SecurityHeadersManager {
  static getSecurityHeaders(): SecurityHeaders {
    const isProduction = process.env.NODE_ENV === 'production';
    
    return {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': this.getCSP(isProduction),
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    };
  }

  private static getCSP(isProduction: boolean): string {
    const baseDomains = [
      "'self'",
      'https://your-domain.com',
      'https://api.your-domain.com'
    ];
    
    const scriptSources = isProduction 
      ? [...baseDomains, "'unsafe-inline'"] // Only if absolutely necessary
      : [...baseDomains, "'unsafe-inline'", "'unsafe-eval'"]; // Development only
    
    const styleSources = isProduction
      ? baseDomains
      : [...baseDomains, "'unsafe-inline'"];
    
    return [
      `default-src ${baseDomains.join(' ')}`,
      `script-src ${scriptSources.join(' ')}`,
      `style-src ${styleSources.join(' ')}`,
      `img-src ${baseDomains.join(' ')} data: https:`,
      `font-src ${baseDomains.join(' ')}`,
      `connect-src ${baseDomains.join(' ')}`,
      `frame-ancestors 'none'`,
      `base-uri 'self'`,
      `form-action 'self'`
    ].join('; ');
  }

  static applyHeaders(response: Response): void {
    const headers = this.getSecurityHeaders();
    
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }
}

// Next.js middleware usage
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Apply security headers
  SecurityHeadersManager.applyHeaders(response);
  
  return response;
}
```

### Incident Response
- **Security Incident Plan**: Comprehensive incident response
- **Breach Notification**: Proper breach notification procedures
- **Recovery Procedures**: Step-by-step recovery process
- **Post-incident Analysis**: Thorough incident analysis

#### Security Incident Response
```typescript
// ✅ Security incident response system
interface SecurityIncident {
  id: string;
  type: 'data_breach' | 'unauthorized_access' | 'malware' | 'ddos' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedSystems: string[];
  timeline: IncidentEvent[];
  mitigation: string;
  prevention: string;
}

interface IncidentEvent {
  timestamp: number;
  description: string;
  action: string;
}

class SecurityIncidentManager {
  private incidents: Map<string, SecurityIncident> = new Map();
  
  async reportIncident(incident: Omit<SecurityIncident, 'id' | 'timeline'>): Promise<string> {
    const id = this.generateIncidentId();
    const fullIncident: SecurityIncident = {
      ...incident,
      id,
      timeline: [{
        timestamp: Date.now(),
        description: 'Incident reported',
        action: 'detected'
      }]
    };
    
    this.incidents.set(id, fullIncident);
    
    // Notify security team
    await this.notifySecurityTeam(fullIncident);
    
    // Log incident
    await this.logIncident(fullIncident);
    
    return id;
  }

  async updateIncident(id: string, event: IncidentEvent): Promise<void> {
    const incident = this.incidents.get(id);
    if (!incident) return;
    
    incident.timeline.push(event);
    await this.logIncident(incident);
    
    // Update stakeholders if critical
    if (incident.severity === 'critical') {
      await this.notifyStakeholders(incident);
    }
  }

  async resolveIncident(id: string, resolution: { mitigation: string; prevention: string }): Promise<void> {
    const incident = this.incidents.get(id);
    if (!incident) return;
    
    incident.mitigation = resolution.mitigation;
    incident.prevention = resolution.prevention;
    
    incident.timeline.push({
      timestamp: Date.now(),
      description: 'Incident resolved',
      action: 'resolved'
    });
    
    await this.logIncident(incident);
    await this.generateIncidentReport(incident);
  }

  private async notifySecurityTeam(incident: SecurityIncident): Promise<void> {
    const notification = {
      to: 'security-team@your-domain.com',
      subject: `Security Incident: ${incident.type.toUpperCase()} - ${incident.severity.toUpperCase()}`,
      body: `
        Incident ID: ${incident.id}
        Type: ${incident.type}
        Severity: ${incident.severity}
        Description: ${incident.description}
        Affected Systems: ${incident.affectedSystems.join(', ')}
        
        Immediate action required. See incident dashboard for details.
      `,
      priority: incident.severity === 'critical' ? 'high' : 'normal'
    };
    
    // Send notification (implement with your email service)
    await this.sendEmail(notification);
  }

  private generateIncidentId(): string {
    return `INC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async logIncident(incident: SecurityIncident): Promise<void> {
    // Log to security monitoring system
    await fetch('/api/security/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...incident,
        timestamp: Date.now()
      })
    });
  }

  private async generateIncidentReport(incident: SecurityIncident): Promise<void> {
    const report = {
      incident,
      timeline: incident.timeline,
      lessonsLearned: this.extractLessonsLearned(incident),
      recommendations: this.generateRecommendations(incident)
    };
    
    // Store report for future reference
    await fetch('/api/security/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    });
  }

  private extractLessonsLearned(incident: SecurityIncident): string[] {
    // Extract lessons based on incident type and resolution
    const lessons = [];
    
    if (incident.type === 'unauthorized_access') {
      lessons.push('Review access control mechanisms');
      lessons.push('Implement multi-factor authentication');
    }
    
    if (incident.type === 'data_breach') {
      lessons.push('Enhance data encryption at rest');
      lessons.push('Review data access logging');
    }
    
    return lessons;
  }

  private generateRecommendations(incident: SecurityIncident): string[] {
    // Generate specific recommendations based on incident
    const recommendations = [];
    
    if (incident.severity === 'critical') {
      recommendations.push('Conduct full security audit');
      recommendations.push('Review all access controls');
    }
    
    recommendations.push('Update incident response procedures');
    recommendations.push('Schedule security training for affected teams');
    
    return recommendations;
  }
}
```

## Security Checklist

### Development Security
- [ ] **Input Validation**: All user inputs validated
- [ ] **Output Encoding**: Proper output encoding
- [ ] **Error Handling**: Secure error messages
- [ ] **Authentication**: Strong authentication mechanisms
- [ ] **Session Management**: Secure session handling
- [ ] **Data Protection**: Sensitive data protection
- [ ] **API Security**: Secure API endpoints
- [ ] **Dependencies**: Regular security updates

### Production Security
- [ ] **HTTPS**: All connections use HTTPS
- [ ] **Security Headers**: All security headers implemented
- [ ] **CSP**: Content Security Policy configured
- [ ] **CORS**: Proper CORS configuration
- [ ] **Monitoring**: Security monitoring active
- [ ] **Backup**: Regular secure backups
- [ ] **Access Control**: Proper access controls
- [ ] **Audit Trail**: Comprehensive logging
- [ ] **Incident Response**: Incident response plan ready

This security best practices guide provides comprehensive security measures for DOP-FE, covering authentication, data protection, environment security, network security, and incident response procedures.