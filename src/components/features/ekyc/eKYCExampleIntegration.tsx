/**
 * eKYC Example Integration Component
 * Demonstrates how to integrate the enhanced eKYC system
 */

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Shield,
  Camera,
  FileText,
  User,
  CheckCircle,
  AlertCircle,
  Play,
  Settings,
  Download,
  RefreshCw,
} from "lucide-react";

import eKYCVerificationDialog from "@/components/ekyc/eKYCVerificationDialog";
import eKYCResultDisplay from "@/components/ekyc/eKYCResultDisplay";
import eKYCProgress from "@/components/ekyc/eKYCProgress";
import { useEkycStore } from "@/store/use-ekyc-store";
import { VIETNAMESE_DOCUMENT_TYPES, getDocumentTypeById } from "@/lib/ekyc/document-types";
import type { EkycFullResult } from "@/lib/ekyc/ekyc-data-mapper";
import { toast } from "sonner";

interface EkycConfiguration {
  flowType: "DOCUMENT_TO_FACE" | "FACE_TO_DOCUMENT" | "DOCUMENT" | "FACE";
  language: "vi" | "en";
  documentType: VietnameseDocumentType;
  autoStart: boolean;
  showProgress: boolean;
  allowRetry: boolean;
  enableLiveness: boolean;
  qualityThreshold: number;
}

const DEFAULT_CONFIG: EkycConfiguration = {
  flowType: "DOCUMENT_TO_FACE",
  language: "vi",
  documentType: VIETNAMESE_DOCUMENT_TYPES.CCCD_CHIP,
  autoStart: false,
  showProgress: true,
  allowRetry: true,
  enableLiveness: true,
  qualityThreshold: 0.85,
};

export const eKYCExampleIntegration: React.FC = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [lastResult, setLastResult] = useState<EkycFullResult | null>(null);
  const [config, setConfig] = useState<EkycConfiguration>(DEFAULT_CONFIG);

  const {
    status,
    progress,
    steps,
    currentStep,
    error,
    errors,
    warnings,
    formData,
    isValid,
    reset,
    exportState,
  } = useEkycStore();

  const handleEkycStart = () => {
    setShowDialog(true);
    reset();
  };

  const handleEkycSuccess = (result: EkycFullResult) => {
    setLastResult(result);
    setShowDialog(false);
    setShowResults(true);
    toast.success("eKYC verification completed successfully!");
  };

  const handleEkycError = (error: string) => {
    console.error("eKYC error:", error);
    toast.error(`eKYC verification failed: ${error}`);
  };

  const handleEkycCancel = () => {
    setShowDialog(false);
    reset();
  };

  const handleExport = (format: "json" | "pdf" | "csv") => {
    try {
      const state = exportState();
      const dataStr = JSON.stringify(state, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ekyc-result-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export results");
    }
  };

  const handleRetry = () => {
    setShowResults(false);
    setLastResult(null);
    handleEkycStart();
  };

  const updateConfig = (key: keyof EkycConfiguration, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const getStatusBadge = () => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>;
      case "error":
        return <Badge variant="destructive">Lỗi</Badge>;
      case "running":
        return <Badge className="bg-blue-100 text-blue-800">Đang chạy</Badge>;
      case "processing":
        return <Badge className="bg-amber-100 text-amber-800">Đang xử lý</Badge>;
      default:
        return <Badge variant="secondary">Chờ</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">eKYC Integration Example</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          This example demonstrates the complete integration of the enhanced eKYC system
          with VNPT SDK support for Vietnamese document verification.
        </p>
      </div>

      {/* Main Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>eKYC Verification</span>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Complete identity verification with Vietnamese document support
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Current Configuration:
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{config.documentType.nameVi}</Badge>
                <Badge variant="outline">{config.flowType}</Badge>
                <Badge variant="outline">{config.language}</Badge>
              </div>
            </div>
            <Button
              onClick={handleEkycStart}
              disabled={status === "running"}
              size="lg"
              className="min-w-[140px]"
            >
              <Play className="h-4 w-4 mr-2" />
              Start eKYC
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {warnings.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div>
                  <strong>Warnings:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {warnings.slice(0, 3).map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                    {warnings.length > 3 && (
                      <li>...and {warnings.length - 3} more</li>
                    )}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Progress and Status */}
      {(status === "running" || status === "processing") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Verification Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <eKYCProgress variant="detailed" showDetails showTimeEstimates />
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {showResults && lastResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Verification Results
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("json")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("pdf")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Complete verification results and extracted information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <eKYCResultDisplay
              result={lastResult}
              onExport={handleExport}
              onRetry={handleRetry}
              allowEdit={true}
              variant="detailed"
            />
          </CardContent>
        </Card>
      )}

      {/* Configuration Details */}
      <Card>
        <CardHeader>
          <CardTitle>Current Configuration</CardTitle>
          <CardDescription>
            Current eKYC verification settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Flow Type</Label>
                  <p className="text-sm text-muted-foreground">{config.flowType}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Language</Label>
                  <p className="text-sm text-muted-foreground">{config.language}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Document Type</Label>
                  <p className="text-sm text-muted-foreground">{config.documentType.nameVi}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Auto Start</Label>
                  <p className="text-sm text-muted-foreground">{config.autoStart ? "Yes" : "No"}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Show Progress</Label>
                  <p className="text-sm text-muted-foreground">{config.showProgress ? "Yes" : "No"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Allow Retry</Label>
                  <p className="text-sm text-muted-foreground">{config.allowRetry ? "Yes" : "No"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Enable Liveness</Label>
                  <p className="text-sm text-muted-foreground">{config.enableLiveness ? "Yes" : "No"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Quality Threshold</Label>
                  <p className="text-sm text-muted-foreground">{Math.round(config.qualityThreshold * 100)}%</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge()}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Overall Progress</Label>
                  <p className="text-sm text-muted-foreground">{progress}%</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Current Step</Label>
                  <p className="text-sm text-muted-foreground">{currentStep}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Completed Steps</Label>
                  <p className="text-sm text-muted-foreground">
                    {steps.filter(s => s.status === "completed").length}/{steps.length}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>eKYC Configuration</DialogTitle>
            <DialogDescription>
              Customize the eKYC verification settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="flowType">Flow Type</Label>
                <Select
                  value={config.flowType}
                  onValueChange={(value: any) => updateConfig("flowType", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DOCUMENT_TO_FACE">Document → Face</SelectItem>
                    <SelectItem value="FACE_TO_DOCUMENT">Face → Document</SelectItem>
                    <SelectItem value="DOCUMENT">Document Only</SelectItem>
                    <SelectItem value="FACE">Face Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={config.language}
                  onValueChange={(value: any) => updateConfig("language", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vi">Tiếng Việt</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentType">Document Type</Label>
                <Select
                  value={config.documentType.code}
                  onValueChange={(value) => {
                    const docType = Object.values(VIETNAMESE_DOCUMENT_TYPES).find(
                      (type) => type.code === value
                    );
                    if (docType) updateConfig("documentType", docType);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(VIETNAMESE_DOCUMENT_TYPES).map((docType) => (
                      <SelectItem key={docType.code} value={docType.code}>
                        {docType.nameVi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualityThreshold">Quality Threshold</Label>
                <Select
                  value={config.qualityThreshold.toString()}
                  onValueChange={(value) => updateConfig("qualityThreshold", parseFloat(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.7">70%</SelectItem>
                    <SelectItem value="0.8">80%</SelectItem>
                    <SelectItem value="0.85">85%</SelectItem>
                    <SelectItem value="0.9">90%</SelectItem>
                    <SelectItem value="0.95">95%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Options</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoStart"
                    checked={config.autoStart}
                    onCheckedChange={(checked) => updateConfig("autoStart", checked)}
                  />
                  <Label htmlFor="autoStart">Auto Start</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="showProgress"
                    checked={config.showProgress}
                    onCheckedChange={(checked) => updateConfig("showProgress", checked)}
                  />
                  <Label htmlFor="showProgress">Show Progress</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="allowRetry"
                    checked={config.allowRetry}
                    onCheckedChange={(checked) => updateConfig("allowRetry", checked)}
                  />
                  <Label htmlFor="allowRetry">Allow Retry</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableLiveness"
                    checked={config.enableLiveness}
                    onCheckedChange={(checked) => updateConfig("enableLiveness", checked)}
                  />
                  <Label htmlFor="enableLiveness">Enable Liveness</Label>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* eKYC Dialog */}
      <eKYCVerificationDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onSuccess={handleEkycSuccess}
        onError={handleEkycError}
        onCancel={handleEkycCancel}
        flowType={config.flowType}
        language={config.language}
        documentType={config.documentType}
        autoStart={config.autoStart}
        showProgress={config.showProgress}
        allowRetry={config.allowRetry}
      />
    </div>
  );
};

export default eKYCExampleIntegration;