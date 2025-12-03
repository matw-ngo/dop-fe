/**
 * eKYC Image Processing Utilities
 * Advanced image processing for Vietnamese document verification
 */

import { VietnameseDocumentType } from "./document-types";

export interface ImageQualityMetrics {
  overall: number; // 0-100
  sharpness: number; // 0-100
  brightness: number; // 0-100
  contrast: number; // 0-100
  noise: number; // 0-100 (lower is better)
  glare: number; // 0-100 (lower is better)
  textClarity: number; // 0-100
  edgeDetection: number; // 0-100
  faceDetection?: {
    faceCount: number;
    faceQuality: number;
    facePosition: "center" | "off-center" | "out-of-frame";
    lighting: "good" | "fair" | "poor";
  };
}

export interface DocumentDetectionResult {
  detected: boolean;
  confidence: number;
  corners: Array<{ x: number; y: number }>;
  rotation: number; // degrees
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  documentType?: string;
}

export interface ImageProcessingOptions {
  targetSize?: { width: number; height: number };
  quality?: number; // 0-1 for JPEG quality
  format?: 'jpeg' | 'png' | 'webp';
  autoEnhance?: boolean;
  autoCrop?: boolean;
  autoRotate?: boolean;
  normalizeLighting?: boolean;
  reduceNoise?: boolean;
}

export class EkycImageProcessor {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  constructor() {
    if (typeof window !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d')!;
    }
  }

  /**
   * Analyze image quality for eKYC verification
   */
  async analyzeImageQuality(
    imageFile: File,
    documentType: VietnameseDocumentType
  ): Promise<ImageQualityMetrics> {
    const image = await this.loadImage(imageFile);
    const imageData = this.context.getImageData(0, 0, image.width, image.height);

    const metrics: ImageQualityMetrics = {
      overall: 0,
      sharpness: this.calculateSharpness(imageData),
      brightness: this.calculateBrightness(imageData),
      contrast: this.calculateContrast(imageData),
      noise: this.calculateNoise(imageData),
      glare: this.calculateGlare(imageData),
      textClarity: this.calculateTextClarity(imageData),
      edgeDetection: this.calculateEdgeDetection(imageData),
    };

    // Face detection if this is a face image
    if (documentType.code === 'FACE') {
      metrics.faceDetection = await this.detectFace(imageData);
    }

    // Calculate overall score
    metrics.overall = this.calculateOverallScore(metrics, documentType);

    return metrics;
  }

  /**
   * Detect document boundaries in image
   */
  async detectDocument(imageFile: File): Promise<DocumentDetectionResult> {
    const image = await this.loadImage(imageFile);
    const imageData = this.context.getImageData(0, 0, image.width, image.height);

    // Simple edge detection for document boundaries
    const edges = this.detectEdges(imageData);
    const corners = this.findCorners(edges);
    const bounds = this.calculateBounds(corners);
    const rotation = this.calculateRotation(corners);

    return {
      detected: corners.length === 4,
      confidence: this.calculateDetectionConfidence(corners),
      corners,
      rotation,
      bounds,
    };
  }

  /**
   * Process and optimize image for eKYC
   */
  async processImage(
    imageFile: File,
    documentType: VietnameseDocumentType,
    options: ImageProcessingOptions = {}
  ): Promise<Blob> {
    const image = await this.loadImage(imageFile);

    // Set canvas size
    const targetSize = options.targetSize || {
      width: Math.min(image.width, 1920),
      height: Math.min(image.height, 1080),
    };

    this.canvas.width = targetSize.width;
    this.canvas.height = targetSize.height;

    // Clear canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply preprocessing
    if (options.autoRotate) {
      const rotation = await this.detectImageRotation(image);
      if (rotation !== 0) {
        this.context.save();
        this.context.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.context.rotate(rotation);
      }
    }

    // Draw image
    this.context.drawImage(image, 0, 0, targetSize.width, targetSize.height);

    if (options.autoRotate && await this.detectImageRotation(image) !== 0) {
      this.context.restore();
    }

    // Apply enhancements
    if (options.autoEnhance) {
      await this.enhanceImage(this.context.getImageData(0, 0, this.canvas.width, this.canvas.height));
    }

    if (options.normalizeLighting) {
      await this.normalizeLighting(this.context.getImageData(0, 0, this.canvas.width, this.canvas.height));
    }

    if (options.reduceNoise) {
      await this.reduceNoise(this.context.getImageData(0, 0, this.canvas.width, this.canvas.height));
    }

    // Convert to blob
    const format = options.format || 'jpeg';
    const quality = options.quality || 0.9;

    return new Promise((resolve) => {
      this.canvas.toBlob((blob) => {
        resolve(blob!);
      }, `image/${format}`, quality);
    });
  }

  /**
   * Auto-crop document from image
   */
  async autoCropDocument(imageFile: File): Promise<Blob> {
    const detection = await this.detectDocument(imageFile);

    if (!detection.detected) {
      throw new Error('Document not detected in image');
    }

    const image = await this.loadImage(imageFile);

    // Set canvas to crop size
    const padding = 20; // Add some padding
    this.canvas.width = detection.bounds.width + padding * 2;
    this.canvas.height = detection.bounds.height + padding * 2;

    // Crop and draw
    this.context.drawImage(
      image,
      detection.bounds.x - padding,
      detection.bounds.y - padding,
      detection.bounds.width + padding * 2,
      detection.bounds.height + padding * 2,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    return new Promise((resolve) => {
      this.canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/jpeg', 0.95);
    });
  }

  /**
   * Extract and enhance text regions
   */
  async enhanceTextRegions(imageFile: File): Promise<Blob> {
    const image = await this.loadImage(imageFile);
    this.canvas.width = image.width;
    this.canvas.height = image.height;

    // Draw original image
    this.context.drawImage(image, 0, 0);

    const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);

    // Apply text enhancement
    const enhanced = this.enhanceTextRegions(imageData);
    this.context.putImageData(enhanced, 0, 0);

    return new Promise((resolve) => {
      this.canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png', 1.0);
    });
  }

  // Private methods

  private async loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  private calculateSharpness(imageData: ImageData): number {
    // Laplacian variance for sharpness detection
    const data = imageData.data;
    const width = imageData.width;
    let sum = 0;
    let sumSquared = 0;

    for (let y = 1; y < imageData.height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;

        // Simple Laplacian kernel
        const laplacian =
          -1 * data[idx - width * 4 - 4] +
          -1 * data[idx - width * 4] +
          -1 * data[idx - width * 4 + 4] +
          -1 * data[idx - 4] +
          8 * data[idx] +
          -1 * data[idx + 4] +
          -1 * data[idx + width * 4 - 4] +
          -1 * data[idx + width * 4] +
          -1 * data[idx + width * 4 + 4];

        sum += laplacian;
        sumSquared += laplacian * laplacian;
      }
    }

    const variance = (sumSquared - (sum * sum) / (width * imageData.height)) / (width * imageData.height);
    return Math.min(100, Math.max(0, (variance / 1000) * 100));
  }

  private calculateBrightness(imageData: ImageData): number {
    const data = imageData.data;
    let totalBrightness = 0;

    for (let i = 0; i < data.length; i += 4) {
      // Convert RGB to perceived brightness
      const brightness = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      totalBrightness += brightness;
    }

    const avgBrightness = totalBrightness / (data.length / 4) / 255 * 100;

    // Optimal brightness is around 50-70%
    if (avgBrightness >= 50 && avgBrightness <= 70) return 100;
    if (avgBrightness < 30 || avgBrightness > 90) return 0;

    // Linear scaling within acceptable range
    return Math.max(0, 100 - Math.abs(avgBrightness - 60) * 2);
  }

  private calculateContrast(imageData: ImageData): number {
    const data = imageData.data;
    const histogram = new Array(256).fill(0);

    // Build histogram
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      histogram[gray]++;
    }

    // Find min and max non-zero histogram values
    let min = 0;
    let max = 255;

    while (min < 255 && histogram[min] === 0) min++;
    while (max > 0 && histogram[max] === 0) max--;

    // Calculate contrast as the range
    const range = max - min;
    return (range / 255) * 100;
  }

  private calculateNoise(imageData: ImageData): number {
    const data = imageData.data;
    let noise = 0;

    for (let i = 0; i < data.length - 8; i += 4) {
      const diff1 = Math.abs(data[i] - data[i + 4]);
      const diff2 = Math.abs(data[i + 1] - data[i + 5]);
      const diff3 = Math.abs(data[i + 2] - data[i + 6]);

      noise += (diff1 + diff2 + diff3) / 3;
    }

    const avgNoise = noise / (data.length / 4);
    return Math.min(100, (avgNoise / 30) * 100);
  }

  private calculateGlare(imageData: ImageData): number {
    const data = imageData.data;
    let brightPixels = 0;

    for (let i = 0; i < data.length; i += 4) {
      const brightness = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (brightness > 240) {
        brightPixels++;
      }
    }

    const percentage = (brightPixels / (data.length / 4)) * 100;
    return Math.min(100, percentage * 10); // Scale to 0-100
  }

  private calculateTextClarity(imageData: ImageData): number {
    // Simplified text clarity detection using edge detection
    const edges = this.detectEdges(imageData);
    let edgePixels = 0;

    for (let i = 0; i < edges.data.length; i++) {
      if (edges.data[i] > 128) {
        edgePixels++;
      }
    }

    const edgeDensity = edgePixels / edges.data.length;
    return Math.min(100, edgeDensity * 500);
  }

  private calculateEdgeDetection(imageData: ImageData): number {
    const edges = this.detectEdges(imageData);
    let strongEdges = 0;

    for (let i = 0; i < edges.data.length; i++) {
      if (edges.data[i] > 200) {
        strongEdges++;
      }
    }

    const edgeStrength = strongEdges / edges.data.length;
    return Math.min(100, edgeStrength * 200);
  }

  private async detectFace(imageData: ImageData): Promise<ImageQualityMetrics['faceDetection']> {
    // This is a placeholder for face detection
    // In a real implementation, you would use a face detection library
    return {
      faceCount: 0,
      faceQuality: 0,
      facePosition: 'out-of-frame',
      lighting: 'poor',
    };
  }

  private detectEdges(imageData: ImageData): ImageData {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const edges = new ImageData(width, height);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;

        // Sobel operator
        const gx =
          -1 * data[idx - width * 4 - 4] +
          1 * data[idx - width * 4 + 4] +
          -2 * data[idx - 4] +
          2 * data[idx + 4] +
          -1 * data[idx + width * 4 - 4] +
          1 * data[idx + width * 4 + 4];

        const gy =
          -1 * data[idx - width * 4 - 4] +
          -2 * data[idx - width * 4] +
          -1 * data[idx - width * 4 + 4] +
          1 * data[idx + width * 4 - 4] +
          2 * data[idx + width * 4] +
          1 * data[idx + width * 4 + 4];

        const magnitude = Math.sqrt(gx * gx + gy * gy);
        const idx2 = idx;

        edges.data[idx2] = magnitude;
        edges.data[idx2 + 1] = magnitude;
        edges.data[idx2 + 2] = magnitude;
        edges.data[idx2 + 3] = 255;
      }
    }

    return edges;
  }

  private findCorners(edges: ImageData): Array<{ x: number; y: number }> {
    // Simplified corner detection
    // In a real implementation, you would use Harris corner detection or similar
    return [];
  }

  private calculateBounds(corners: Array<{ x: number; y: number }>) {
    if (corners.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const xs = corners.map(c => c.x);
    const ys = corners.map(c => c.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  private calculateRotation(corners: Array<{ x: number; y: number }>): number {
    // Simplified rotation calculation
    return 0;
  }

  private calculateDetectionConfidence(corners: Array<{ x: number; y: number }>): number {
    if (corners.length === 4) return 100;
    if (corners.length === 3) return 75;
    if (corners.length === 2) return 50;
    return 0;
  }

  private async detectImageRotation(image: HTMLImageElement): Promise<number> {
    // This would use EXIF data or computer vision to detect rotation
    return 0;
  }

  private async enhanceImage(imageData: ImageData): Promise<void> {
    const data = imageData.data;

    // Apply histogram equalization
    const histogram = this.buildHistogram(data);
    const lut = this.buildLUT(histogram);

    for (let i = 0; i < data.length; i += 4) {
      data[i] = lut[data[i]];
      data[i + 1] = lut[data[i + 1]];
      data[i + 2] = lut[data[i + 2]];
    }

    this.context.putImageData(imageData, 0, 0);
  }

  private buildHistogram(data: Uint8ClampedArray): number[] {
    const histogram = new Array(256).fill(0);

    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      histogram[gray]++;
    }

    return histogram;
  }

  private buildLUT(histogram: number[]): number[] {
    const lut = new Array(256);
    const cdf = new Array(256);
    let sum = 0;

    // Calculate cumulative distribution function
    for (let i = 0; i < 256; i++) {
      sum += histogram[i];
      cdf[i] = sum;
    }

    // Build LUT for equalization
    for (let i = 0; i < 256; i++) {
      lut[i] = Math.round((cdf[i] / sum) * 255);
    }

    return lut;
  }

  private async normalizeLighting(imageData: ImageData): Promise<void> {
    // Apply adaptive histogram equalization or similar lighting correction
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // Simple local brightness correction
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const brightness = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];

        if (brightness < 50) {
          // Brighten dark areas
          const factor = 1.5;
          data[idx] = Math.min(255, data[idx] * factor);
          data[idx + 1] = Math.min(255, data[idx + 1] * factor);
          data[idx + 2] = Math.min(255, data[idx + 2] * factor);
        } else if (brightness > 200) {
          // Darken bright areas
          const factor = 0.8;
          data[idx] = data[idx] * factor;
          data[idx + 1] = data[idx + 1] * factor;
          data[idx + 2] = data[idx + 2] * factor;
        }
      }
    }

    this.context.putImageData(imageData, 0, 0);
  }

  private async reduceNoise(imageData: ImageData): Promise<void> {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const output = new Uint8ClampedArray(data);

    // Apply median filter for noise reduction
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;

        for (let c = 0; c < 3; c++) {
          const values = [];

          // Get 3x3 neighborhood
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nIdx = ((y + dy) * width + (x + dx)) * 4 + c;
              values.push(data[nIdx]);
            }
          }

          // Sort and take median
          values.sort((a, b) => a - b);
          output[idx + c] = values[4]; // Median of 9 values
        }

        output[idx + 3] = data[idx + 3]; // Keep alpha channel
      }
    }

    const outputImageData = new ImageData(output, width, height);
    this.context.putImageData(outputImageData, 0, 0);
  }

  private enhanceTextRegions(imageData: ImageData): ImageData {
    // Apply specific text enhancement algorithms
    return imageData;
  }

  private calculateOverallScore(
    metrics: ImageQualityMetrics,
    documentType: VietnameseDocumentType
  ): number {
    const weights = {
      sharpness: 0.2,
      brightness: 0.15,
      contrast: 0.15,
      noise: 0.1,
      glare: 0.1,
      textClarity: 0.2,
      edgeDetection: 0.1,
    };

    // Adjust weights based on document type
    if (documentType.code === 'FACE') {
      weights.sharpness = 0.25;
      weights.brightness = 0.2;
      weights.noise = 0.15;
      weights.textClarity = 0;
    } else if (documentType.ocrConfig.edgeDetection) {
      weights.edgeDetection = 0.2;
      weights.textClarity = 0.25;
    }

    let score = 0;
    for (const [metric, weight] of Object.entries(weights)) {
      const value = metrics[metric as keyof ImageQualityMetrics] as number;
      score += value * weight;
    }

    return Math.round(score);
  }
}

// Export singleton instance
export const ekycImageProcessor = new EkycImageProcessor();

// Utility functions
export const validateImageForEkyc = async (
  file: File,
  documentType: VietnameseDocumentType
): Promise<{ valid: boolean; score: number; issues: string[] }> => {
  try {
    const metrics = await ekycImageProcessor.analyzeImageQuality(file, documentType);
    const threshold = documentType.ocrConfig.qualityThreshold * 100;

    const issues: string[] = [];

    if (metrics.sharpness < 60) issues.push('Ảnh bị mờ, cần làm rõ hơn');
    if (metrics.brightness < 40) issues.push('Ảnh quá tối, cần tăng độ sáng');
    if (metrics.brightness > 80) issues.push('Ảnh quá sáng, có thể bị lóa');
    if (metrics.contrast < 50) issues.push('Độ tương phản thấp, cần cải thiện');
    if (metrics.noise > 60) issues.push('Ảnh có nhiều nhiễu');
    if (metrics.glare > 30) issues.push('Ảnh có vùng bị lóa sáng');
    if (metrics.textClarity < 50 && documentType.code !== 'FACE') {
      issues.push('Chữ không đủ rõ ràng');
    }

    // File size check
    if (file.size > 10 * 1024 * 1024) { // 10MB
      issues.push('Kích thước file quá lớn (tối đa 10MB)');
    }

    // Resolution check
    if (file.type.startsWith('image/')) {
      const img = new Image();
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = URL.createObjectURL(file);
      });

      if (img.width < 800 || img.height < 600) {
        issues.push('Độ phân giải quá thấp (tối thiểu 800x600)');
      }
    }

    return {
      valid: metrics.overall >= threshold && issues.length === 0,
      score: metrics.overall,
      issues,
    };
  } catch (error) {
    return {
      valid: false,
      score: 0,
      issues: ['Không thể xử lý ảnh'],
    };
  }
};

export const optimizeImageForEkyc = async (
  file: File,
  documentType: VietnameseDocumentType
): Promise<Blob> => {
  const options: ImageProcessingOptions = {
    targetSize: { width: 1920, height: 1080 },
    quality: 0.9,
    format: 'jpeg',
    autoEnhance: true,
    autoCrop: documentType.ocrConfig.edgeDetection,
    autoRotate: true,
    normalizeLighting: true,
    reduceNoise: true,
  };

  return await ekycImageProcessor.processImage(file, documentType, options);
};

export default EkycImageProcessor;