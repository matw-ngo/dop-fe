/**
 * Face Verification Component
 * Advanced face verification with liveness detection
 */

"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Camera, User, AlertCircle, CheckCircle, RefreshCw, Eye, EyeOff, Smile, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useEkycVerification } from "@/hooks/use-ekyc-verification";
import { toast } from "sonner";

interface FaceVerificationProps {
  onCaptureSuccess?: (result: any) => void;
  onCaptureError?: (error: string) => void;
  onLivenessComplete?: (result: any) => void;
  className?: string;
  enableLivenessChallenges?: boolean;
  numberOfChallenges?: number;
}

interface CaptureState {
  isCapturing: boolean;
  isProcessing: boolean;
  capturedImage?: string;
  quality: number;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  retryCount: number;
}

interface LivenessChallenge {
  id: string;
  type: "blink" | "smile" | "turn_left" | "turn_right" | "nod" | "open_mouth";
  name: string;
  nameVi: string;
  instruction: string;
  instructionVi: string;
  icon: React.ReactNode;
  duration: number; // seconds
  completed: boolean;
  startTime?: number;
  endTime?: number;
}

interface CameraState {
  isActive: boolean;
  stream?: MediaStream;
  deviceId?: string;
  devices: MediaDeviceInfo[];
  facingMode: "user" | "environment";
}

export const FaceVerification: React.FC<FaceVerificationProps> = ({
  onCaptureSuccess,
  onCaptureError,
  onLivenessComplete,
  className,
  enableLivenessChallenges = true,
  numberOfChallenges = 3,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState<"capture" | "liveness">("capture");
  const [captureState, setCaptureState] = useState<CaptureState>({
    isCapturing: false,
    isProcessing: false,
    quality: 0,
    isValid: false,
    errors: [],
    warnings: [],
    retryCount: 0,
  });

  const [cameraState, setCameraState] = useState<CameraState>({
    isActive: false,
    devices: [],
    facingMode: "user",
  });

  const [currentChallenge, setCurrentChallenge] = useState<LivenessChallenge | null>(null);
  const [challengeProgress, setChallengeProgress] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [livenessResults, setLivenessResults] = useState<any[]>([]);

  const { captureFace, validateImage } = useEkycVerification({
    documentType: { code: "FACE", nameVi: "Khuôn mặt" } as any,
    flowType: "FACE",
    language: "vi",
  });

  // Define liveness challenges
  const livenessChallenges: LivenessChallenge[] = [
    {
      id: "blink",
      type: "blink",
      name: "Blink",
      nameVi: "Nhắm mắt",
      instruction: "Blink your eyes slowly",
      instructionVi: "Nhắm mắt từ từ",
      icon: <Eye className="h-6 w-6" />,
      duration: 3,
      completed: false,
    },
    {
      id: "smile",
      type: "smile",
      name: "Smile",
      nameVi: "Cười",
      instruction: "Smile naturally",
      instructionVi: "Mỉm cười tự nhiên",
      icon: <Smile className="h-6 w-6" />,
      duration: 3,
      completed: false,
    },
    {
      id: "turn_left",
      type: "turn_left",
      name: "Turn Left",
      nameVi: "Xoay trái",
      instruction: "Turn your head slowly to the left",
      instructionVi: "Xoay đầu từ từ sang trái",
      icon: <RotateCw className="h-6 w-6 rotate-180" />,
      duration: 4,
      completed: false,
    },
    {
      id: "turn_right",
      type: "turn_right",
      name: "Turn Right",
      nameVi: "Xoay phải",
      instruction: "Turn your head slowly to the right",
      instructionVi: "Xoay đầu từ từ sang phải",
      icon: <RotateCw className="h-6 w-6" />,
      duration: 4,
      completed: false,
    },
    {
      id: "nod",
      type: "nod",
      name: "Nod",
      nameVi: "Gật đầu",
      instruction: "Nod your head up and down slowly",
      instructionVi: "Gật đầu lên xuống từ từ",
      icon: <User className="h-6 w-6" />,
      duration: 3,
      completed: false,
    },
    {
      id: "open_mouth",
      type: "open_mouth",
      name: "Open Mouth",
      nameVi: "Mở miệng",
      instruction: "Open your mouth slightly",
      instructionVi: "Mở miệng một chút",
      icon: <EyeOff className="h-6 w-6" />,
      duration: 2,
      completed: false,
    },
  ];

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    try {
      const constraints = {
        video: {
          facingMode: "user", // Always use front camera for face verification
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraState(prev => ({ ...prev, isActive: true, stream }));
      }

      // Get available cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === "videoinput");
      setCameraState(prev => ({ ...prev, devices: videoDevices }));

    } catch (error) {
      console.error("Camera initialization failed:", error);
      setCaptureState(prev => ({
        ...prev,
        errors: [...prev.errors, "Failed to access camera"],
      }));

      toast.error("Camera access failed", {
        description: "Please check camera permissions and try again",
      });
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (cameraState.stream) {
      cameraState.stream.getTracks().forEach(track => track.stop());
      setCameraState(prev => ({ ...prev, isActive: false, stream: undefined }));
    }
  }, [cameraState.stream]);

  // Start liveness challenge
  const startLivenessChallenge = useCallback((challenge: LivenessChallenge) => {
    setCurrentChallenge({
      ...challenge,
      startTime: Date.now(),
      completed: false,
    });
    setChallengeProgress(0);

    // Start progress animation
    const interval = setInterval(() => {
      setChallengeProgress((prev) => {
        const newProgress = prev + (100 / (challenge.duration * 10)); // Update every 100ms
        if (newProgress >= 100) {
          clearInterval(interval);
          completeLivenessChallenge(challenge.id);
          return 100;
        }
        return newProgress;
      });
    }, 100);

    // Clear interval when component unmounts or challenge changes
    return () => clearInterval(interval);
  }, []);

  // Complete liveness challenge
  const completeLivenessChallenge = useCallback((challengeId: string) => {
    setCompletedChallenges(prev => [...prev, challengeId]);
    setCurrentChallenge(prev => prev ? { ...prev, completed: true, endTime: Date.now() } : null);

    // Move to next challenge or finish
    const nextChallengeIndex = completedChallenges.length;
    if (nextChallengeIndex < livenessChallenges.length - 1 && completedChallenges.length < numberOfChallenges - 1) {
      setTimeout(() => {
        const nextChallenge = livenessChallenges[nextChallengeIndex + 1];
        startLivenessChallenge(nextChallenge);
      }, 1000);
    } else {
      // All challenges completed
      setTimeout(() => {
        setCurrentStep("capture");
        toast.success("Liveness check completed", {
          description: "All challenges completed successfully",
        });
      }, 1000);
    }
  }, [completedChallenges.length, livenessChallenges, numberOfChallenges, startLivenessChallenge]);

  // Capture face
  const captureFace = useCallback(async (challengeType?: string) => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      setCaptureState(prev => ({ ...prev, isCapturing: true, isProcessing: true }));

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Canvas context not available");
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error("Failed to capture face image");
        }

        const file = new File([blob], `face-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        // Validate image quality
        const isValid = await validateImage(file);
        setCaptureState(prev => ({
          ...prev,
          isValid,
          quality: isValid ? 0.9 : 0.3,
        }));

        if (!isValid) {
          throw new Error("Face image quality is too low. Please ensure proper lighting and positioning.");
        }

        // Process capture
        const imageData = URL.createObjectURL(blob);
        setCaptureState(prev => ({
          ...prev,
          capturedImage: imageData,
          isCapturing: false,
        }));

        await handleFaceCapture(file, challengeType);

      }, "image/jpeg", 0.9);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Face capture failed";
      setCaptureState(prev => ({
        ...prev,
        isCapturing: false,
        isProcessing: false,
        errors: [...prev.errors, errorMessage],
        retryCount: prev.retryCount + 1,
      }));

      onCaptureError?.(errorMessage);

      toast.error("Face capture failed", {
        description: errorMessage,
      });
    }
  }, [validateImage, onCaptureError, handleFaceCapture]);

  // Handle face capture
  const handleFaceCapture = useCallback(async (file: File, challengeType?: string) => {
    try {
      setCaptureState(prev => ({ ...prev, isProcessing: true }));

      await captureFace(file, challengeType);

      const result = {
        file,
        challengeType,
        timestamp: Date.now(),
      };

      setLivenessResults(prev => [...prev, result]);
      setCaptureState(prev => ({
        ...prev,
        isProcessing: false,
        isValid: true,
      }));

      onCaptureSuccess?.(result);

      toast.success("Face captured", {
        description: challengeType ? `Liveness challenge completed` : "Face captured successfully",
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Processing failed";
      setCaptureState(prev => ({
        ...prev,
        isProcessing: false,
        isValid: false,
        errors: [...prev.errors, errorMessage],
        retryCount: prev.retryCount + 1,
      }));

      onCaptureError?.(errorMessage);

      toast.error("Processing failed", {
        description: errorMessage,
      });
    }
  }, [captureFace, onCaptureSuccess, onCaptureError]);

  // Start liveness verification
  const startLivenessVerification = useCallback(() => {
    setCurrentStep("liveness");
    setCompletedChallenges([]);
    setLivenessResults([]);

    // Select random challenges
    const shuffled = [...livenessChallenges].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, numberOfChallenges);

    // Start first challenge
    if (selected.length > 0) {
      startLivenessChallenge(selected[0]);
    }
  }, [numberOfChallenges, livenessChallenges, startLivenessChallenge]);

  // Retry face capture
  const retryFaceCapture = useCallback(() => {
    setCaptureState({
      isCapturing: false,
      isProcessing: false,
      quality: 0,
      isValid: false,
      errors: [],
      warnings: [],
      retryCount: 0,
    });
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setCaptureState(prev => ({ ...prev, isProcessing: true }));

      // Validate file type
      if (!file.type.startsWith("image/")) {
        throw new Error("Please upload an image file");
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File size too large. Maximum size is 10MB.");
      }

      // Validate image quality
      const isValid = await validateImage(file);
      setCaptureState(prev => ({
        ...prev,
        isValid,
        quality: isValid ? 0.9 : 0.3,
      }));

      if (!isValid) {
        throw new Error("Face image quality is too low. Please ensure proper lighting and clarity.");
      }

      // Preview image
      const imageData = URL.createObjectURL(file);
      setCaptureState(prev => ({
        ...prev,
        capturedImage: imageData,
      }));

      await handleFaceCapture(file);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      setCaptureState(prev => ({
        ...prev,
        isProcessing: false,
        isValid: false,
        errors: [...prev.errors, errorMessage],
        retryCount: prev.retryCount + 1,
      }));

      onCaptureError?.(errorMessage);

      toast.error("Upload failed", {
        description: errorMessage,
      });
    }
  }, [validateImage, handleFaceCapture, onCaptureError]);

  // Initialize camera on mount
  useEffect(() => {
    initializeCamera();

    return () => {
      stopCamera();
    };
  }, [initializeCamera, stopCamera]);

  return (
    <div className={`w-full max-w-2xl mx-auto p-4 space-y-4 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Xác thực khuôn mặt
          </CardTitle>
          <CardDescription>
            {currentStep === "capture"
              ? "Chụp ảnh khuôn mặt để xác thực danh tính"
              : `Thực hiện các thử thách kiểm tra sống (${completedChallenges.length + 1}/${numberOfChallenges})`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{currentStep === "liveness" ? `${completedChallenges.length + 1}/${numberOfChallenges}` : "Step 1/2"}</span>
            </div>
            <Progress
              value={currentStep === "liveness"
                ? ((completedChallenges.length + (challengeProgress / 100)) / numberOfChallenges) * 100
                : captureState.isValid ? 50 : 25
              }
              className="h-2"
            />
          </div>

          {/* Camera View */}
          {currentStep === "capture" && (
            <div className="space-y-4">
              {/* Video Preview */}
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                {cameraState.isActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-white text-center">
                      <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Initializing camera...</p>
                    </div>
                  </div>
                )}

                {/* Face Guidelines */}
                <div className="absolute inset-0 border-2 border-dashed border-white/30 rounded-full pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-32 h-40 border-2 border-white/50 rounded-full">
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                        Position face here
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Capture Controls */}
              <div className="flex gap-2">
                <Button
                  onClick={() => captureFace()}
                  disabled={!cameraState.isActive || captureState.isCapturing || captureState.isProcessing}
                  className="flex-1"
                  size="lg"
                >
                  {captureState.isCapturing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Capturing...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Capture Face
                    </>
                  )}
                </Button>

                {enableLivenessChallenges && !captureState.isValid && (
                  <Button
                    onClick={startLivenessVerification}
                    variant="outline"
                    disabled={captureState.isProcessing}
                  >
                    Liveness Check
                  </Button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  disabled={captureState.isProcessing}
                >
                  Upload
                </Button>
              </div>
            </div>
          )}

          {/* Liveness Challenge View */}
          {currentStep === "liveness" && currentChallenge && (
            <div className="space-y-4">
              {/* Challenge Instruction */}
              <Card className="border-primary">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 text-primary">
                    {currentChallenge.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {currentChallenge.nameVi}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {currentChallenge.instructionVi}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-100"
                      style={{ width: `${challengeProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {currentChallenge.duration - Math.floor((challengeProgress / 100) * currentChallenge.duration)}s remaining
                  </p>
                </CardContent>
              </Card>

              {/* Video Preview */}
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Challenge Indicator */}
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="text-sm">
                    {completedChallenges.length + 1}/{numberOfChallenges}
                  </Badge>
                </div>
              </div>

              {/* Auto-capture during challenge */}
              <div className="text-center text-sm text-muted-foreground">
                Camera will automatically capture when the challenge is completed
              </div>
            </div>
          )}

          {/* Captured Image Preview */}
          {captureState.capturedImage && captureState.isValid && currentStep === "capture" && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={captureState.capturedImage}
                  alt="Captured face"
                  className="w-full rounded-lg border-2 border-green-500"
                />
                <div className="absolute top-2 right-2">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
              </div>

              {/* Quality Score */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Face Quality</span>
                  <span>{Math.round(captureState.quality * 100)}%</span>
                </div>
                <Progress value={captureState.quality * 100} className="h-2" />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {enableLivenessChallenges && (
                  <Button
                    onClick={startLivenessVerification}
                    variant="outline"
                    className="flex-1"
                  >
                    Start Liveness Check
                  </Button>
                )}
                <Button
                  onClick={retryFaceCapture}
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retake
                </Button>
              </div>
            </div>
          )}

          {/* Processing Overlay */}
          {captureState.isProcessing && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <div className="bg-white p-4 rounded-lg text-center">
                <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin text-primary" />
                <p className="font-medium">Processing face...</p>
                <p className="text-sm text-gray-500">This may take a few seconds</p>
              </div>
            </div>
          )}

          {/* Hidden canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Errors */}
          {captureState.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {captureState.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Requirements */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Face Verification Requirements:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Face should be clearly visible and centered</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Ensure proper lighting (avoid shadows on face)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Remove glasses and accessories if possible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Keep a neutral expression unless instructed otherwise</span>
              </li>
              {enableLivenessChallenges && (
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Be prepared to perform {numberOfChallenges} liveness challenges</span>
                </li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FaceVerification;