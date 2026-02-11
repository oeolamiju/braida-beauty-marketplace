// =============================================================================
// BRAIDA AI - FEATURE EXTRACTION SERVICE
// Analyzes facial structure, skin tone, and hair attributes from images
// =============================================================================

import {
  FaceShape,
  FaceShapeAnalysis,
  FacialLandmarks,
  SkinToneAnalysis,
  MonkScale,
  SkinUndertone,
  HairAnalysis,
  HairType,
  HairDensity,
  HairPorosity,
  HairLength,
  ImageAnalysisRequest,
  ImageAnalysisResponse,
} from "./types";

// =============================================================================
// FACE SHAPE ANALYSIS
// =============================================================================

/**
 * Face shape classification based on facial landmark ratios
 * Uses 68-point facial landmarks (dlib compatible)
 */
export class FaceShapeAnalyzer {
  
  /**
   * Analyze face shape from facial landmarks
   * In production, these landmarks would come from a face detection model
   */
  analyzeFaceShape(landmarks: number[][]): FaceShapeAnalysis {
    const facialLandmarks = this.extractFacialMeasurements(landmarks);
    const shape = this.classifyFaceShape(facialLandmarks);
    const confidence = this.calculateConfidence(facialLandmarks, shape);

    return {
      shape,
      landmarks: facialLandmarks,
      widthToHeightRatio: facialLandmarks.cheekboneWidth / facialLandmarks.faceLength,
      foreheadToJawRatio: facialLandmarks.foreheadWidth / facialLandmarks.jawWidth,
      confidence,
    };
  }

  private extractFacialMeasurements(landmarks: number[][]): FacialLandmarks {
    // Landmark indices based on 68-point model
    // Jaw: 0-16, Eyebrows: 17-26, Nose: 27-35, Eyes: 36-47, Mouth: 48-67
    
    // Calculate jaw width (distance between jaw points 4 and 12)
    const jawWidth = this.distance(landmarks[4], landmarks[12]);
    
    // Calculate cheekbone width (distance between points 1 and 15)
    const cheekboneWidth = this.distance(landmarks[1], landmarks[15]);
    
    // Calculate forehead width (distance between eyebrow outer points 17 and 26)
    const foreheadWidth = this.distance(landmarks[17], landmarks[26]);
    
    // Calculate face length (chin to estimated top of head)
    // Point 8 is chin, estimate top based on nose bridge (point 27)
    const chinY = landmarks[8][1];
    const noseBridgeY = landmarks[27][1];
    const faceLength = (chinY - noseBridgeY) * 2; // Approximate full face length
    
    // Calculate chin length (chin point to mouth bottom)
    const chinLength = this.distance(landmarks[8], landmarks[57]);
    
    // Calculate cheekbone prominence
    const cheekboneProminence = (cheekboneWidth - Math.min(foreheadWidth, jawWidth)) / cheekboneWidth;

    return {
      jawWidth,
      cheekboneWidth,
      foreheadWidth,
      faceLength,
      chinLength,
      cheekboneProminence,
    };
  }

  private classifyFaceShape(landmarks: FacialLandmarks): FaceShape {
    const { jawWidth, cheekboneWidth, foreheadWidth, faceLength, cheekboneProminence } = landmarks;
    
    const widthToHeightRatio = cheekboneWidth / faceLength;
    const foreheadToJawRatio = foreheadWidth / jawWidth;
    
    // Classification rules based on beauty industry standards
    
    // Oblong: Face is notably longer than wide
    if (widthToHeightRatio < 0.75) {
      return 'oblong';
    }
    
    // Round: Width approximately equals height, soft features
    if (widthToHeightRatio > 0.9 && cheekboneProminence < 0.1 && 
        Math.abs(foreheadToJawRatio - 1) < 0.15) {
      return 'round';
    }
    
    // Square: Width approximately equals height, angular jaw
    if (widthToHeightRatio > 0.85 && Math.abs(foreheadWidth - jawWidth) / foreheadWidth < 0.1) {
      return 'square';
    }
    
    // Heart: Wide forehead, narrow chin
    if (foreheadToJawRatio > 1.2) {
      return 'heart';
    }
    
    // Diamond: Prominent cheekbones, narrow forehead and chin
    if (cheekboneProminence > 0.15 && foreheadToJawRatio < 1.1 && foreheadToJawRatio > 0.9) {
      return 'diamond';
    }
    
    // Default to oval (most balanced proportions)
    return 'oval';
  }

  private calculateConfidence(landmarks: FacialLandmarks, shape: FaceShape): number {
    // Calculate confidence based on how well measurements fit the classification
    const { jawWidth, cheekboneWidth, foreheadWidth, faceLength, cheekboneProminence } = landmarks;
    const widthToHeightRatio = cheekboneWidth / faceLength;
    const foreheadToJawRatio = foreheadWidth / jawWidth;
    
    let confidence = 0.5; // Base confidence
    
    switch (shape) {
      case 'oblong':
        confidence = 0.5 + (0.75 - widthToHeightRatio) * 2;
        break;
      case 'round':
        confidence = 0.5 + (widthToHeightRatio - 0.9) * 5;
        break;
      case 'square':
        confidence = 0.5 + (0.1 - Math.abs(foreheadWidth - jawWidth) / foreheadWidth) * 5;
        break;
      case 'heart':
        confidence = 0.5 + (foreheadToJawRatio - 1.2) * 2;
        break;
      case 'diamond':
        confidence = 0.5 + cheekboneProminence * 3;
        break;
      case 'oval':
        // Oval is the "default" so confidence is based on balance
        const balance = 1 - Math.abs(foreheadToJawRatio - 1) - Math.abs(widthToHeightRatio - 0.8);
        confidence = 0.5 + balance;
        break;
    }
    
    return Math.min(0.99, Math.max(0.3, confidence));
  }

  private distance(p1: number[], p2: number[]): number {
    return Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));
  }
}

// =============================================================================
// SKIN TONE ANALYSIS
// =============================================================================

/**
 * Skin tone analyzer using Monk Scale (10-point) and undertone detection
 * More inclusive than Fitzpatrick scale for diverse skin tones
 */
export class SkinToneAnalyzer {
  
  // Monk Scale definitions
  private readonly MONK_SCALE_NAMES: Record<MonkScale, string> = {
    1: 'very_light',
    2: 'light',
    3: 'light_medium',
    4: 'medium_light',
    5: 'medium',
    6: 'medium_tan',
    7: 'tan',
    8: 'brown',
    9: 'dark_brown',
    10: 'deep_brown',
  };

  /**
   * Analyze skin tone from RGB pixel values
   * @param skinPixels - Array of [R, G, B] values from skin regions
   */
  analyzeSkinTone(skinPixels: number[][]): SkinToneAnalysis {
    // Convert to LAB color space for perceptual uniformity
    const labValues = skinPixels.map(rgb => this.rgbToLab(rgb));
    
    // Calculate mean LAB values
    const L_mean = this.mean(labValues.map(lab => lab[0]));
    const a_mean = this.mean(labValues.map(lab => lab[1]));
    const b_mean = this.mean(labValues.map(lab => lab[2]));
    
    // Calculate ITA (Individual Typology Angle)
    const ita = Math.atan2(L_mean - 50, b_mean) * (180 / Math.PI);
    
    // Calculate Hue Angle for undertone
    const hueAngle = Math.atan2(b_mean, a_mean) * (180 / Math.PI);
    
    // Map to Monk Scale
    const monkScale = this.itaToMonkScale(ita);
    
    // Determine undertone
    const undertone = this.classifyUndertone(hueAngle, a_mean, b_mean);
    
    // Calculate confidence based on pixel consistency
    const confidence = this.calculateSkinToneConfidence(labValues);
    
    return {
      monkScale,
      undertone,
      ita,
      hueAngle,
      lightness: L_mean,
      confidence,
    };
  }

  /**
   * Convert ITA (Individual Typology Angle) to Monk 10-point scale
   */
  private itaToMonkScale(ita: number): MonkScale {
    // ITA ranges calibrated for Monk scale
    // Higher ITA = lighter skin
    if (ita > 55) return 1;
    if (ita > 45) return 2;
    if (ita > 35) return 3;
    if (ita > 25) return 4;
    if (ita > 15) return 5;
    if (ita > 5) return 6;
    if (ita > -5) return 7;
    if (ita > -15) return 8;
    if (ita > -30) return 9;
    return 10;
  }

  /**
   * Classify undertone as warm, cool, or neutral
   * Based on Sony's research on skin hue angles
   */
  private classifyUndertone(hueAngle: number, a_mean: number, b_mean: number): SkinUndertone {
    // Normalize hue angle to positive range
    const normalizedHue = hueAngle < 0 ? hueAngle + 360 : hueAngle;
    
    // Yellow-leaning (warm): hue > 50°
    // Red-leaning (cool): hue < 40°
    // Neutral: 40-50°
    
    if (normalizedHue > 50 || (b_mean > a_mean * 1.2)) {
      return 'warm';
    }
    if (normalizedHue < 40 || (a_mean > b_mean * 1.2)) {
      return 'cool';
    }
    return 'neutral';
  }

  /**
   * Convert RGB to LAB color space
   */
  private rgbToLab(rgb: number[]): number[] {
    // First convert RGB to XYZ
    let r = rgb[0] / 255;
    let g = rgb[1] / 255;
    let b = rgb[2] / 255;

    // Apply gamma correction
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    // Convert to XYZ
    const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) * 100;
    const y = (r * 0.2126 + g * 0.7152 + b * 0.0722) * 100;
    const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) * 100;

    // Convert XYZ to LAB
    // Reference white D65
    const refX = 95.047;
    const refY = 100.0;
    const refZ = 108.883;

    let labX = x / refX;
    let labY = y / refY;
    let labZ = z / refZ;

    labX = labX > 0.008856 ? Math.pow(labX, 1/3) : (7.787 * labX) + (16/116);
    labY = labY > 0.008856 ? Math.pow(labY, 1/3) : (7.787 * labY) + (16/116);
    labZ = labZ > 0.008856 ? Math.pow(labZ, 1/3) : (7.787 * labZ) + (16/116);

    const L = (116 * labY) - 16;
    const a = 500 * (labX - labY);
    const bVal = 200 * (labY - labZ);

    return [L, a, bVal];
  }

  private calculateSkinToneConfidence(labValues: number[][]): number {
    // Confidence based on consistency of skin pixels
    const L_std = this.standardDeviation(labValues.map(lab => lab[0]));
    const a_std = this.standardDeviation(labValues.map(lab => lab[1]));
    const b_std = this.standardDeviation(labValues.map(lab => lab[2]));
    
    // Lower standard deviation = higher confidence
    const avgStd = (L_std + a_std + b_std) / 3;
    const confidence = Math.max(0.3, Math.min(0.99, 1 - (avgStd / 50)));
    
    return confidence;
  }

  private mean(values: number[]): number {
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private standardDeviation(values: number[]): number {
    const avg = this.mean(values);
    const squareDiffs = values.map(value => Math.pow(value - avg, 2));
    return Math.sqrt(this.mean(squareDiffs));
  }

  /**
   * Get complementary makeup colors for a skin tone
   */
  getComplementaryColors(monkScale: MonkScale, undertone: SkinUndertone): {
    lipColors: string[];
    eyeColors: string[];
    blushColors: string[];
  } {
    // Color recommendations based on skin tone and undertone
    const colorMap: Record<string, { lipColors: string[]; eyeColors: string[]; blushColors: string[] }> = {
      // Deep tones (Monk 8-10) with warm undertone
      'deep_warm': {
        lipColors: ['deep_berry', 'burgundy', 'wine', 'plum', 'nude_brown', 'terracotta'],
        eyeColors: ['bronze', 'copper', 'gold', 'deep_purple', 'forest_green', 'burnt_orange'],
        blushColors: ['deep_coral', 'berry', 'bronze', 'warm_plum'],
      },
      // Deep tones with cool undertone
      'deep_cool': {
        lipColors: ['berry', 'deep_plum', 'mauve', 'wine', 'cool_nude', 'raspberry'],
        eyeColors: ['silver', 'navy', 'purple', 'charcoal', 'cool_brown', 'taupe'],
        blushColors: ['berry', 'mauve', 'plum', 'cool_rose'],
      },
      // Medium-dark tones (Monk 6-7) with warm undertone
      'medium_warm': {
        lipColors: ['terracotta', 'coral', 'nude_peach', 'burnt_orange', 'warm_brown', 'brick_red'],
        eyeColors: ['bronze', 'peach', 'warm_brown', 'gold', 'olive', 'copper'],
        blushColors: ['coral', 'peach', 'terracotta', 'warm_nude'],
      },
      // Medium-dark tones with cool undertone
      'medium_cool': {
        lipColors: ['rose', 'berry', 'mauve', 'dusty_rose', 'cool_pink', 'plum'],
        eyeColors: ['taupe', 'cool_brown', 'purple', 'silver', 'navy', 'grey'],
        blushColors: ['rose', 'mauve', 'cool_pink', 'berry'],
      },
      // Medium tones (Monk 4-5)
      'medium_neutral': {
        lipColors: ['nude', 'rose', 'coral', 'soft_pink', 'berry', 'mauve'],
        eyeColors: ['bronze', 'taupe', 'brown', 'purple', 'green', 'gold'],
        blushColors: ['peach', 'rose', 'coral', 'soft_pink'],
      },
      // Light-medium tones (Monk 2-3)
      'light_neutral': {
        lipColors: ['soft_pink', 'peach', 'nude_pink', 'rose', 'coral', 'berry'],
        eyeColors: ['soft_brown', 'taupe', 'bronze', 'purple', 'green', 'navy'],
        blushColors: ['soft_peach', 'pink', 'rose', 'coral'],
      },
    };

    // Determine color category
    let category: string;
    if (monkScale >= 8) {
      category = undertone === 'warm' ? 'deep_warm' : 'deep_cool';
    } else if (monkScale >= 6) {
      category = undertone === 'warm' ? 'medium_warm' : 'medium_cool';
    } else if (monkScale >= 4) {
      category = 'medium_neutral';
    } else {
      category = 'light_neutral';
    }

    return colorMap[category] || colorMap['medium_neutral'];
  }
}

// =============================================================================
// HAIR TYPE ANALYSIS
// =============================================================================

/**
 * Hair type classifier using Andre Walker system (1A-4C)
 * Specialized for African/textured hair types
 */
export class HairTypeAnalyzer {
  
  /**
   * Analyze hair type from texture features
   */
  analyzeHair(textureFeatures: {
    curlDefinition: number;
    coilTightness: number;
    shrinkage: number;
    density: number;
    shine: number;
  }): HairAnalysis {
    const hairType = this.classifyHairType(textureFeatures);
    const density = this.classifyDensity(textureFeatures.density);
    const porosity = this.estimatePorosity(textureFeatures.shine, hairType);
    const confidence = this.calculateConfidence(textureFeatures);

    return {
      hairType,
      density,
      porosity,
      lengthCategory: 'medium', // Would be determined from image
      textureFeatures: {
        gaborFeatures: [],
        lbpHistogram: [],
        smoothness: 1 - textureFeatures.coilTightness,
        shine: textureFeatures.shine,
        curlDefinition: textureFeatures.curlDefinition,
        coilTightness: textureFeatures.coilTightness,
      },
      confidence,
    };
  }

  /**
   * Classify hair type based on curl pattern metrics
   */
  private classifyHairType(features: {
    curlDefinition: number;
    coilTightness: number;
    shrinkage: number;
  }): HairType {
    const { curlDefinition, coilTightness, shrinkage } = features;
    
    // Type 4 (Coily/Kinky): High coil tightness
    if (coilTightness >= 0.7) {
      // 4C: Very tight coils, minimal definition
      if (curlDefinition < 0.3 && shrinkage > 0.6) {
        return '4C';
      }
      // 4B: Z-pattern, medium definition
      if (curlDefinition < 0.5) {
        return '4B';
      }
      // 4A: Defined S-pattern coils
      return '4A';
    }
    
    // Type 3 (Curly): Medium coil tightness
    if (coilTightness >= 0.4) {
      // 3C: Tight curls
      if (coilTightness >= 0.55) {
        return '3C';
      }
      // 3B: Medium curls
      if (curlDefinition >= 0.5) {
        return '3B';
      }
      // 3A: Loose curls
      return '3A';
    }
    
    // Type 2 (Wavy): Low coil tightness
    if (coilTightness >= 0.2) {
      if (coilTightness >= 0.3) return '2C';
      if (coilTightness >= 0.25) return '2B';
      return '2A';
    }
    
    // Type 1 (Straight)
    if (coilTightness >= 0.1) return '1C';
    if (coilTightness >= 0.05) return '1B';
    return '1A';
  }

  private classifyDensity(densityValue: number): HairDensity {
    if (densityValue > 0.7) return 'thick';
    if (densityValue > 0.4) return 'medium';
    return 'thin';
  }

  private estimatePorosity(shine: number, hairType: HairType): HairPorosity {
    // Type 4 hair typically has lower shine due to curl structure
    const isType4 = hairType.startsWith('4');
    
    if (isType4) {
      // Adjust shine threshold for type 4
      if (shine > 0.5) return 'low'; // Rare for type 4, indicates low porosity
      if (shine > 0.2) return 'normal';
      return 'high';
    }
    
    if (shine > 0.7) return 'low';
    if (shine > 0.4) return 'normal';
    return 'high';
  }

  private calculateConfidence(features: {
    curlDefinition: number;
    coilTightness: number;
  }): number {
    // Confidence based on how clearly the features indicate a type
    const { curlDefinition, coilTightness } = features;
    
    // Higher confidence when features are clearly in one category
    const coilClarity = Math.abs(coilTightness - 0.5) * 2; // Distance from ambiguous middle
    const definitionClarity = Math.abs(curlDefinition - 0.5) * 2;
    
    return Math.min(0.95, 0.5 + (coilClarity + definitionClarity) / 4);
  }

  /**
   * Get style recommendations based on hair type
   */
  getSuitableStyles(hairType: HairType): string[] {
    const stylesByHairType: Record<string, string[]> = {
      '3A': ['loose_waves', 'wash_and_go', 'twist_out', 'braid_out'],
      '3B': ['twist_out', 'wash_and_go', 'flexi_rod_set', 'bantu_knot_out'],
      '3C': ['twist_out', 'braid_out', 'wash_and_go', 'flexi_rod_set', 'box_braids'],
      '4A': ['twist_out', 'braid_out', 'wash_and_go', 'coil_out', 'box_braids', 'locs'],
      '4B': ['twist_out', 'braid_out', 'stretched_styles', 'protective_styles', 'locs', 'cornrows'],
      '4C': ['twist_out', 'braid_out', 'stretched_styles', 'protective_styles', 'locs', 'cornrows', 'knotless_braids'],
    };
    
    return stylesByHairType[hairType] || stylesByHairType['4A'];
  }
}

// =============================================================================
// UNIFIED FEATURE EXTRACTOR
// =============================================================================

/**
 * Main feature extraction service that combines all analyzers
 */
export class FeatureExtractor {
  private faceAnalyzer: FaceShapeAnalyzer;
  private skinAnalyzer: SkinToneAnalyzer;
  private hairAnalyzer: HairTypeAnalyzer;

  constructor() {
    this.faceAnalyzer = new FaceShapeAnalyzer();
    this.skinAnalyzer = new SkinToneAnalyzer();
    this.hairAnalyzer = new HairTypeAnalyzer();
  }

  /**
   * Process an image analysis request
   * In production, this would connect to actual ML models
   */
  async analyzeImage(request: ImageAnalysisRequest): Promise<ImageAnalysisResponse> {
    const startTime = Date.now();
    const response: ImageAnalysisResponse = {
      success: true,
      processingTime: 0,
    };

    try {
      // In production, these would be actual ML model calls
      // For now, we return structured responses that can be populated
      
      if (request.analysisTypes.includes('face_shape')) {
        // This would call a face detection model
        response.faceShape = await this.detectFaceShape(request);
      }

      if (request.analysisTypes.includes('skin_tone')) {
        // This would call a skin segmentation + color analysis pipeline
        response.skinTone = await this.detectSkinTone(request);
      }

      if (request.analysisTypes.includes('hair_type')) {
        // This would call a hair segmentation + texture analysis model
        response.hairAnalysis = await this.detectHairType(request);
      }

    } catch (error) {
      response.success = false;
      response.errors = [error instanceof Error ? error.message : 'Unknown error'];
    }

    response.processingTime = Date.now() - startTime;
    return response;
  }

  private async detectFaceShape(request: ImageAnalysisRequest): Promise<FaceShapeAnalysis> {
    // In production: Call face detection model (MediaPipe, dlib, etc.)
    // Return mock analysis for now - would be replaced with actual model output
    return {
      shape: 'oval',
      landmarks: {
        jawWidth: 120,
        cheekboneWidth: 140,
        foreheadWidth: 130,
        faceLength: 180,
        chinLength: 40,
        cheekboneProminence: 0.1,
      },
      widthToHeightRatio: 0.78,
      foreheadToJawRatio: 1.08,
      confidence: 0.85,
    };
  }

  private async detectSkinTone(request: ImageAnalysisRequest): Promise<SkinToneAnalysis> {
    // In production: Segment skin pixels and analyze color
    return {
      monkScale: 7,
      undertone: 'warm',
      ita: 5.2,
      hueAngle: 52.3,
      lightness: 45.6,
      confidence: 0.88,
    };
  }

  private async detectHairType(request: ImageAnalysisRequest): Promise<HairAnalysis> {
    // In production: Segment hair region and analyze texture
    return {
      hairType: '4B',
      density: 'thick',
      porosity: 'normal',
      lengthCategory: 'medium',
      textureFeatures: {
        gaborFeatures: [],
        lbpHistogram: [],
        smoothness: 0.3,
        shine: 0.4,
        curlDefinition: 0.4,
        coilTightness: 0.75,
      },
      confidence: 0.82,
    };
  }

  // Expose individual analyzers for direct use
  getFaceAnalyzer(): FaceShapeAnalyzer {
    return this.faceAnalyzer;
  }

  getSkinAnalyzer(): SkinToneAnalyzer {
    return this.skinAnalyzer;
  }

  getHairAnalyzer(): HairTypeAnalyzer {
    return this.hairAnalyzer;
  }
}

// Export singleton instance
export const featureExtractor = new FeatureExtractor();
