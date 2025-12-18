import { api, APIError } from "encore.dev/api";
import { requireAdmin } from "../auth/middleware";
import { styleImages } from "./storage";
import { validateFileUpload, PRESETS } from "../shared/file_validation";

interface UploadStyleImageRequest {
  fileName: string;
  fileData: string;
  contentType: string;
}

interface UploadStyleImageResponse {
  url: string;
}

export const uploadImage = api<UploadStyleImageRequest, UploadStyleImageResponse>(
  { expose: true, method: "POST", path: "/admin/styles/upload-image", auth: true },
  async (req: UploadStyleImageRequest): Promise<UploadStyleImageResponse> => {
    requireAdmin();

    if (!req.fileName || !req.fileData || req.fileData.length === 0) {
      throw APIError.invalidArgument("file name and data are required");
    }

    const fileBuffer = validateFileUpload(req.fileData, req.contentType, PRESETS.IMAGE_5MB);

    const timestamp = Date.now();
    const sanitizedFileName = req.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const objectName = `style-${timestamp}-${sanitizedFileName}`;

    await styleImages.upload(objectName, fileBuffer, {
      contentType: req.contentType,
    });

    const url = styleImages.publicUrl(objectName);

    return { url };
  }
);
