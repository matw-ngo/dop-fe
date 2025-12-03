/**
 * OTP Verification Example Component
 * Demonstrates complete Vietnamese OTP verification flow
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

import { OTPVerificationDialog } from './OTPVerificationDialog';
import { PhoneInput } from './PhoneInput';
import { OTPInput } from './OTPInput';
import { OTPResend } from './OTPResend';

import { useOTPVerification } from '@/hooks/use-otp-verification';
import { usePhoneValidation } from '@/hooks/use-phone-validation';

import { Smartphone, Shield, CheckCircle, AlertCircle, Info, Settings } from 'lucide-react';

export const OTPVerificationExample: React.FC = () => {
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Individual component states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [selectedTelco, setSelectedTelco] = useState<string>('auto');

  // Hooks
  const otpVerification = useOTPVerification({
    onSuccess: (phone) => {
      console.log('OTP verification successful for:', phone);
    },
    onError: (error) => {
      console.error('OTP verification error:', error);
    }
  });

  const phoneValidation = usePhoneValidation({
    preset: 'STANDARD',
    onTelcoChange: (telco) => {
      console.log('Detected telco:', telco);
    }
  });

  // Handle phone submission for individual components
  const handlePhoneSubmit = async (phone: string, metadata?: any) => {
    try {
      const requestId = await otpVerification.requestOTP(phone);
      if (requestId) {
        setPhoneNumber(phone);
      }
    } catch (error) {
      console.error('Phone submission error:', error);
    }
  };

  // Handle OTP verification for individual components
  const handleOTPVerify = async (code: string) => {
    try {
      const success = await otpVerification.verifyOTP(code);
      if (success) {
        setOtpCode(code);
      }
      return success;
    } catch (error) {
      console.error('OTP verification error:', error);
      return false;
    }
  };

  // Handle OTP resend
  const handleOTPResend = async () => {
    try {
      return await otpVerification.resendOTP();
    } catch (error) {
      console.error('OTP resend error:', error);
      return false;
    }
  };

  // Example telco data for demonstration
  const vietnameseTelcos = [
    { code: 'VIETTEL', name: 'Viettel', color: '#0033A0', otpLength: 4 },
    { code: 'MOBIFONE', name: 'Mobifone', color: '#FF6600', otpLength: 6 },
    { code: 'VINAPHONE', name: 'Vinaphone', color: '#FF0000', otpLength: 6 },
    { code: 'VIETNAMOBILE', name: 'Vietnamobile', color: '#FFCC00', otpLength: 4 },
    { code: 'GTEL', name: 'Gmobile', color: '#00CC66', otpLength: 4 }
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Smartphone className="h-8 w-8" />
          Vietnamese OTP Verification System
        </h1>
        <p className="text-muted-foreground">
          Comprehensive OTP verification with Vietnamese telecommunications carrier support
        </p>
      </div>

      <Tabs defaultValue="dialog" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dialog">Dialog Flow</TabsTrigger>
          <TabsTrigger value="components">Individual Components</TabsTrigger>
          <TabsTrigger value="hooks">Custom Hooks</TabsTrigger>
          <TabsTrigger value="telcos">Telco Info</TabsTrigger>
        </TabsList>

        {/* Dialog Flow Tab */}
        <TabsContent value="dialog" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Complete OTP Verification Dialog</CardTitle>
              <CardDescription>
                All-in-one dialog component with phone input, OTP verification, and Vietnamese telco support
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    This dialog provides a complete OTP verification flow with automatic Vietnamese telco detection,
                    appropriate OTP length handling (4 digits for Viettel/Gmobile, 6 digits for others),
                    and comprehensive error handling.
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={() => setIsDialogOpen(true)}
                  size="lg"
                  className="w-full max-w-sm"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Open OTP Verification Dialog
                </Button>

                <OTPVerificationDialog
                  open={isDialogOpen}
                  onOpenChange={setIsDialogOpen}
                  onPhoneSubmit={handlePhoneSubmit}
                  onOTPVerify={handleOTPVerify}
                  onOTPResend={handleOTPResend}
                  autoRequestOTP={true}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Components Tab */}
        <TabsContent value="components" className="space-y-6">
          {/* Phone Input Component */}
          <Card>
            <CardHeader>
              <CardTitle>Phone Input Component</CardTitle>
              <CardDescription>
                Vietnamese phone number input with real-time validation and telco detection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PhoneInput
                value={phoneNumber}
                onChange={(phone, isValid, metadata) => {
                  setPhoneNumber(phone);
                  console.log('Phone input change:', { phone, isValid, metadata });
                }}
                showTelcoBadge={true}
                showSuggestions={true}
                showValidation={true}
                autoFocus={true}
                label="Số điện thoại Việt Nam"
                placeholder="Nhập số điện thoại (ví dụ: 0912345678)"
                onTelcoDetected={(telco) => {
                  console.log('Telco detected:', telco);
                }}
              />

              {phoneNumber && phoneValidation.isValid && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Valid Vietnamese phone number detected: {phoneValidation.metadata?.formattedNumber}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* OTP Input Component */}
          <Card>
            <CardHeader>
              <CardTitle>OTP Input Component</CardTitle>
              <CardDescription>
                OTP input with auto-focus management, paste support, and Vietnamese telco-specific length handling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">4-digit OTP (Viettel/Gmobile):</span>
                  <OTPInput
                    length={4}
                    value={otpCode}
                    onChange={(code, isComplete) => {
                      setOtpCode(code);
                      console.log('OTP 4-digit change:', { code, isComplete });
                    }}
                    onComplete={handleOTPVerify}
                    showTimer={true}
                    timerDuration={300}
                    description="Viettel and Gmobile use 4-digit OTP codes"
                  />
                </div>

                <Separator />

                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">6-digit OTP (Other telcos):</span>
                  <OTPInput
                    length={6}
                    value={otpCode}
                    onChange={(code, isComplete) => {
                      setOtpCode(code);
                      console.log('OTP 6-digit change:', { code, isComplete });
                    }}
                    onComplete={handleOTPVerify}
                    showTimer={true}
                    timerDuration={600}
                    description="Mobifone, Vinaphone, and Vietnamobile use 6-digit OTP codes"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* OTP Resend Component */}
          <Card>
            <CardHeader>
              <CardTitle>OTP Resend Component</CardTitle>
              <CardDescription>
                Resend OTP functionality with cooldown timer and telco-specific retry rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OTPResend
                onResend={handleOTPResend}
                maxAttempts={3}
                telcoSettings={{
                  resendCooldown: 60,
                  maxAttempts: 3,
                  supportsShortCode: true,
                  shortCode: '1221'
                }}
                showProgress={true}
                showAttempts={true}
                showTelcoInfo={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Hooks Tab */}
        <TabsContent value="hooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>useOTPVerification Hook</CardTitle>
              <CardDescription>
                Custom hook for managing OTP verification state and API calls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Phone Number:</strong> {otpVerification.phoneNumber || 'Not set'}
                </div>
                <div>
                  <strong>Session ID:</strong> {otpVerification.requestId || 'No active session'}
                </div>
                <div>
                  <strong>Attempts:</strong> {otpVerification.attempts}/{otpVerification.maxAttempts}
                </div>
                <div>
                  <strong>Status:</strong> {
                    otpVerification.success ? 'Verified' :
                    otpVerification.isLocked ? 'Locked' :
                    otpVerification.isExpired ? 'Expired' :
                    otpVerification.isActive ? 'Active' : 'Inactive'
                  }
                </div>
                <div>
                  <strong>Can Verify:</strong> {otpVerification.canVerify ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>Can Resend:</strong> {otpVerification.canResend ? 'Yes' : 'No'}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => otpVerification.requestOTP('0961234567')}
                  disabled={otpVerification.isRequesting}
                >
                  Request OTP
                </Button>
                <Button
                  onClick={() => otpVerification.verifyOTP('1234')}
                  disabled={!otpVerification.canVerify}
                  variant="outline"
                >
                  Verify OTP
                </Button>
                <Button
                  onClick={() => otpVerification.resendOTP()}
                  disabled={!otpVerification.canResend}
                  variant="outline"
                >
                  Resend OTP
                </Button>
                <Button
                  onClick={() => otpVerification.reset()}
                  variant="destructive"
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>usePhoneValidation Hook</CardTitle>
              <CardDescription>
                Custom hook for Vietnamese phone number validation with telco detection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Validation Status:</strong> {phoneValidation.getValidationStatus()}
                </div>
                <div>
                  <strong>Phone:</strong> {phoneValidation.phoneNumber || 'Not set'}
                </div>
                <div>
                  <strong>Valid:</strong> {phoneValidation.isValid ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>Complete:</strong> {phoneValidation.isComplete ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>Telco:</strong> {phoneValidation.telcoInfo?.name || 'Unknown'}
                </div>
                <div>
                  <strong>Suggestions:</strong> {phoneValidation.suggestions.length} found
                </div>
              </div>

              {phoneValidation.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{phoneValidation.error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Telco Info Tab */}
        <TabsContent value="telcos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vietnamese Telecommunications Carriers</CardTitle>
              <CardDescription>
                Supported Vietnamese telcos with their specific OTP configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vietnameseTelcos.map((telco) => (
                  <Card key={telco.code} className="relative">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: telco.color }}
                        />
                        <CardTitle className="text-lg">{telco.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Code:</span>
                        <Badge variant="secondary">{telco.code}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>OTP Length:</span>
                        <Badge variant="outline">{telco.otpLength} digits</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {telco.name} uses {telco.otpLength}-digit OTP codes with carrier-specific
                        delivery times and retry policies.
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>
                Comprehensive Vietnamese telco-specific OTP verification features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Security Features
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Rate limiting and request throttling</li>
                    <li>• Account lockout after failed attempts</li>
                    <li>• Encrypted OTP transmission</li>
                    <li>• Session-based OTP management</li>
                    <li>• Device fingerprinting support</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Vietnamese Telco Support
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Automatic telco detection</li>
                    <li>• Telco-specific OTP lengths</li>
                    <li>• Carrier-appropriate retry policies</li>
                    <li>• Short code SMS support</li>
                    <li>• Vietnamese error messages</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OTPVerificationExample;