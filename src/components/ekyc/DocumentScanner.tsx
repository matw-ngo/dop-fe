/**
 * Document Scanner Component
 * Advanced document scanning with VNPT document support
 */

"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Camera, Upload, AlertCircle, CheckCircle, RefreshCw, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { VietnameseDocumentType } from "@/lib/ekyc/document-types";
import { useEkycVerification } from "@/hooks/use-ekyc-verification";
import { toast } from "sonner";

interface DocumentScannerProps {
  documentType: VietnameseDocumentType;
  side: "front" | "back";
  onCaptureSuccess?: (result: any) => void;
  onCaptureError?: (error: string) => void;
  onRetry?: () => void;
  className?: string;
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

interface CameraState {
  isActive: boolean;
    stream?: MediaStream;
  deviceId?: string;
  devices: MediaDeviceInfo[];
  facingMode: "user" | "environment";
  zoom: number;
}

export const DocumentScanner: React.FC<DocumentScannerProps> = ({
  documentType,
  side,
  onCaptureSuccess,
  onCaptureError,
  onRetry,
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [captureMode, setCaptureMode] = useState<"camera" | "upload">("camera");
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
    facingMode: "environment",
    zoom: 1,
  });

  const { captureDocument, validateImage, canRetry, getRetryCount } = useEkycVerification({
    documentType,
    flowType: "DOCUMENT_TO_FACE",
    language: "vi",
  });

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    try {
      const constraints = {
        video: {
          facingMode: cameraState.facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
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
  }, [cameraState.facingMode]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (cameraState.stream) {
      cameraState.stream.getTracks().forEach(track => track.stop());
      setCameraState(prev => ({ ...prev, isActive: false, stream: undefined }));
    }
  }, [cameraState.stream]);

  // Switch camera
  const switchCamera = useCallback(async () => {
    const newFacingMode = cameraState.facingMode === "user" ? "environment" : "user";
    setCameraState(prev => ({ ...prev, facingMode: newFacingMode }));

    stopCamera();
    await initializeCamera();
  }, [cameraState.facingMode, stopCamera, initializeCamera]);

  // Capture from camera
  const captureFromCamera = useCallback(async () => {
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

      // Apply zoom if needed
      context.scale(cameraState.zoom, cameraState.zoom);

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error("Failed to capture image");
        }

        const file = new File([blob], `document-${side}-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        // Validate image quality
        const isValid = await validateImage(file);
        setCaptureState(prev => ({
          ...prev,
          isValid,
          quality: isValid ? 0.85 : 0.3,
        }));

        if (!isValid) {
          throw new Error("Image quality is too low. Please ensure proper lighting and document position.");
        }

        // Process capture
        const imageData = URL.createObjectURL(blob);
        setCaptureState(prev => ({
          ...prev,
          capturedImage: imageData,
          isCapturing: false,
        }));

        await handleDocumentCapture(file);

      }, "image/jpeg", 0.9);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Capture failed";
      setCaptureState(prev => ({
        ...prev,
        isCapturing: false,
        isProcessing: false,
        errors: [...prev.errors, errorMessage],
        retryCount: prev.retryCount + 1,
      }));

      onCaptureError?.(errorMessage);

      toast.error("Capture failed", {
        description: errorMessage,
      });
    }
  }, [side, cameraState.zoom, validateImage, onCaptureError, handleDocumentCapture]);

  // Handle document capture
  const handleDocumentCapture = useCallback(async (file: File) => {
    try {
      setCaptureState(prev => ({ ...prev, isProcessing: true }));

      await captureDocument(file, side);

      setCaptureState(prev => ({
        ...prev,
        isProcessing: false,
        isValid: true,
      }));

      onCaptureSuccess?.({ file, side });

      toast.success("Document captured", {
        description: `Successfully captured ${side} side of ${documentType.nameVi}`,
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
  }, [captureDocument, side, documentType.nameVi, onCaptureSuccess, onCaptureError]);

  // Handle file upload
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setCaptureState(prev => ({ ...prev, isProcessing: true }));

      // Validate file type
      if (!documentType.ocrConfig.supportedFormats.includes(file.type)) {
        throw new Error(`Unsupported file type. Please use: ${documentType.ocrConfig.supportedFormats.join(", ")}`);
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
        quality: isValid ? 0.85 : 0.3,
      }));

      if (!isValid) {
        throw new Error("Image quality is too low. Please ensure proper lighting and document clarity.");
      }

      // Preview image
      const imageData = URL.createObjectURL(file);
      setCaptureState(prev => ({
        ...prev,
        capturedImage: imageData,
      }));

      await handleDocumentCapture(file);

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
  }, [documentType, validateImage, handleDocumentCapture, onCaptureError]);

  // Retry capture
  const retryCapture = useCallback(() => {
    setCaptureState({
      isCapturing: false,
      isProcessing: false,
      quality: 0,
      isValid: false,
      errors: [],
      warnings: [],
      retryCount: 0,
    });

    onRetry?.();
  }, [onRetry]);

  // Initialize camera on mount
  useEffect(() => {
    if (captureMode === "camera") {
      initializeCamera();
    }

    return () => {
      stopCamera();
    };
  }, [captureMode, initializeCamera, stopCamera]);

  // Get document requirements
  const getDocumentRequirements = () => {
    const requirements = [
      `Document: ${documentType.nameVi}`,
      `Side: ${side === "front" ? "Mặt trước" : "Mặt sau"}`,
      `Quality: ${Math.round(documentType.ocrConfig.qualityThreshold * 100)}% or higher`,
    ];

    if (documentType.ocrConfig.edgeDetection) {
      requirements.push("Place document on flat surface");
    }

    if (documentType.ocrConfig.autoCapture) {
      requirements.push("Auto-capture enabled");
    }

    return requirements;
  };

  return (
    <div className={`w-full max-w-2xl mx-auto p-4 space-y-4 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Quét giấy tờ {side === "front" ? "mặt trước" : "mặt sau"}
          </CardTitle>
          <CardDescription>
            {documentType.descriptionVi} - {documentType.nameVi}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Document Type Info */}
          <div className="mb-4">
            <Badge variant="secondary" className="mb-2">
              {documentType.code}
            </Badge>
            <div className="text-sm text-muted-foreground">
              {documentType.descriptionVi}
            </div>
          </div>

          {/* Capture Mode Selection */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={captureMode === "camera" ? "default" : "outline"}
              onClick={() => setCaptureMode("camera")}
              className="flex-1"
            >
              <Camera className="h-4 w-4 mr-2" />
              Camera
            </Button>
            <Button
              variant={captureMode === "upload" ? "default" : "outline"}
              onClick={() => setCaptureMode("upload")}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>

          {/* Camera View */}
          {captureMode === "camera" && (
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

                {/* Overlay Guidelines */}
                <div className="absolute inset-0 border-2 border-dashed border-white/30 rounded-lg pointer-events-none">
                  <div className="absolute inset-4 border border-white/50 rounded-lg">
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                      Position document here
                    </div>
                  </div>
                </div>

                {/* Camera Controls */}
                {cameraState.isActive && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {cameraState.devices.length > 1 && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={switchCamera}
                        className="rounded-full"
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Capture Button */}
              <Button
                onClick={captureFromCamera}
                disabled={!cameraState.isActive || captureState.isCapturing || captureState.isProcessing}
                className="w-full"
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
                    Capture {side === "front" ? "Front" : "Back"} Side
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Upload View */}
          {captureMode === "upload" && (
            <div className="space-y-4">
              {/* File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept={documentType.ocrConfig.supportedFormats.join(",")}
                onChange={handleFileUpload}
                className="hidden"
                disabled={captureState.isProcessing}
              />

              {/* Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">
                  Click to upload {side === "front" ? "front" : "back"} side
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Supported formats: {documentType.ocrConfig.supportedFormats.join(", ")}
                </p>
                <p className="text-xs text-gray-400">
                  Maximum file size: 10MB
                </p>
              </div>

              {/* Hidden canvas for capture */}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {/* Captured Image Preview */}
          {captureState.capturedImage && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={captureState.capturedImage}
                  alt={`Captured ${side} side`}
                  className="w-full rounded-lg border-2 border-green-500"
                />
                {captureState.isValid && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                )}
              </div>

              {/* Quality Score */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Image Quality</span>
                  <span>{Math.round(captureState.quality * 100)}%</span>
                </div>
                <Progress value={captureState.quality * 100} className="h-2" />
              </div>

              {/* Retake Button */}
              <Button
                onClick={retryCapture}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retake {side === "front" ? "Front" : "Back"} Side
              </Button>
            </div>
          )}

          {/* Processing Overlay */}
          {captureState.isProcessing && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <div className="bg-white p-4 rounded-lg text-center">
                <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin text-primary" />
                <p className="font-medium">Processing document...</p>
                <p className="text-sm text-gray-500">This may take a few seconds</p>
              </div>
            </div>
          )}

          {/* Requirements */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Document Requirements:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {getDocumentRequirements().map((req, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

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

          {/* Warnings */}
          {captureState.warnings.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {captureState.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentScanner;