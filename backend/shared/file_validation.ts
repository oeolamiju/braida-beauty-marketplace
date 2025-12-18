import { APIError } from "encore.dev/api";

// Maximum file sizes (in bytes)
export const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024,      // 10MB
  video: 100 * 1024 * 1024,     // 100MB
  document: 25 * 1024 * 1024,   // 25MB (for KYC documents)
};

// Validation presets for common use cases
export const PRESETS = {
  IMAGE_5MB: { maxSize: 5 * 1024 * 1024, allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"] },
  IMAGE_10MB: { maxSize: 10 * 1024 * 1024, allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"] },
  VIDEO_100MB: { maxSize: 100 * 1024 * 1024, allowedTypes: ["video/mp4", "video/webm", "video/quicktime"] },
  DOCUMENT_5MB: { maxSize: 5 * 1024 * 1024, allowedTypes: ["application/pdf", "image/jpeg", "image/jpg", "image/png"] },
  DOCUMENT_10MB: { maxSize: 10 * 1024 * 1024, allowedTypes: ["application/pdf", "image/jpeg", "image/jpg", "image/png"] },
  DOCUMENT_25MB: { maxSize: 25 * 1024 * 1024, allowedTypes: ["application/pdf", "image/jpeg", "image/jpg", "image/png"] },
};

// Allowed MIME types
export const ALLOWED_MIME_TYPES = {
  image: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ],
  video: [
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ],
  document: [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ],
};

// Magic number signatures for file type verification
const FILE_SIGNATURES: Record<string, number[][]> = {
  "image/jpeg": [[0xFF, 0xD8, 0xFF]],
  "image/png": [[0x89, 0x50, 0x4E, 0x47]],
  "image/gif": [[0x47, 0x49, 0x46, 0x38]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]],
  "video/mp4": [[0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70]],
  "application/pdf": [[0x25, 0x50, 0x44, 0x46]],
};

export interface FileValidationResult {
  valid: boolean;
  mimeType: string;
  size: number;
  error?: string;
}

// Validate file type by magic numbers
export function validateFileSignature(buffer: Buffer, declaredType: string): boolean {
  const signatures = FILE_SIGNATURES[declaredType];
  if (!signatures) return true; // Skip if no signature defined

  return signatures.some(signature => {
    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) return false;
    }
    return true;
  });
}

// Full file validation
export function validateFile(
  buffer: Buffer,
  declaredMimeType: string,
  category: "image" | "video" | "document"
): FileValidationResult {
  const maxSize = MAX_FILE_SIZES[category];
  const allowedTypes = ALLOWED_MIME_TYPES[category];

  // Check size
  if (buffer.length > maxSize) {
    return {
      valid: false,
      mimeType: declaredMimeType,
      size: buffer.length,
      error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
    };
  }

  // Check MIME type
  if (!allowedTypes.includes(declaredMimeType)) {
    return {
      valid: false,
      mimeType: declaredMimeType,
      size: buffer.length,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  // Verify file signature matches declared type
  if (!validateFileSignature(buffer, declaredMimeType)) {
    return {
      valid: false,
      mimeType: declaredMimeType,
      size: buffer.length,
      error: "File content does not match declared type",
    };
  }

  return {
    valid: true,
    mimeType: declaredMimeType,
    size: buffer.length,
  };
}

// Validate file from base64 string
export function validateBase64File(
  base64Data: string,
  declaredMimeType: string,
  category: "image" | "video" | "document"
): FileValidationResult {
  // Extract actual base64 data (remove data URL prefix if present)
  const base64Match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
  const actualBase64 = base64Match ? base64Match[2] : base64Data;
  const extractedMimeType = base64Match ? base64Match[1] : declaredMimeType;

  try {
    const buffer = Buffer.from(actualBase64, "base64");
    return validateFile(buffer, extractedMimeType, category);
  } catch (error) {
    return {
      valid: false,
      mimeType: declaredMimeType,
      size: 0,
      error: "Invalid base64 encoding",
    };
  }
}

// Sanitize filename
export function sanitizeFilename(filename: string): string {
  // Remove path components
  const basename = filename.split(/[\\/]/).pop() || filename;
  
  // Remove dangerous characters
  const sanitized = basename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.{2,}/g, ".")
    .replace(/^\./, "_")
    .substring(0, 255);

  return sanitized || "file";
}

// Generate safe unique filename
export function generateSafeFilename(
  originalFilename: string,
  mimeType: string
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  
  // Get extension from MIME type
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "application/pdf": "pdf",
  };
  
  const ext = extensions[mimeType] || "bin";
  
  return `${timestamp}_${random}.${ext}`;
}

// Helper to validate and process uploaded file
export async function processUploadedFile(
  base64Data: string,
  declaredMimeType: string,
  category: "image" | "video" | "document"
): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
  const validation = validateBase64File(base64Data, declaredMimeType, category);
  
  if (!validation.valid) {
    throw APIError.invalidArgument(validation.error || "Invalid file");
  }

  // Extract actual base64 data
  const base64Match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
  const actualBase64 = base64Match ? base64Match[2] : base64Data;
  const buffer = Buffer.from(actualBase64, "base64");
  const filename = generateSafeFilename("upload", validation.mimeType);

  return {
    buffer,
    filename,
    mimeType: validation.mimeType,
  };
}

// Extract MIME type from data URL
export function extractMimeTypeFromDataUrl(dataUrl: string): string {
  const match = dataUrl.match(/^data:([^;]+);base64,/);
  if (!match) {
    throw APIError.invalidArgument("Invalid data URL format");
  }
  return match[1];
}

// Validate file upload with preset configuration
export function validateFileUpload(
  base64Data: string,
  mimeType: string,
  preset: { maxSize: number; allowedTypes: string[] }
): Buffer {
  // Extract actual base64 data
  const base64Match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
  const actualBase64 = base64Match ? base64Match[2] : base64Data;
  const extractedMimeType = base64Match ? base64Match[1] : mimeType;

  let buffer: Buffer;
  try {
    buffer = Buffer.from(actualBase64, "base64");
  } catch (error) {
    throw APIError.invalidArgument("Invalid base64 encoding");
  }

  // Check size
  if (buffer.length > preset.maxSize) {
    throw APIError.invalidArgument(
      `File too large. Maximum size is ${preset.maxSize / 1024 / 1024}MB`
    );
  }

  // Check MIME type
  if (!preset.allowedTypes.includes(extractedMimeType)) {
    throw APIError.invalidArgument(
      `File type not allowed. Allowed types: ${preset.allowedTypes.join(", ")}`
    );
  }

  // Verify file signature matches declared type
  if (!validateFileSignature(buffer, extractedMimeType)) {
    throw APIError.invalidArgument("File content does not match declared type");
  }

  return buffer;
}
