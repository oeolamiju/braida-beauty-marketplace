import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { serviceImages } from "../profiles/storage";
import db from "../db";
import { APIError } from "encore.dev/api";
import { extractMimeTypeFromDataUrl, validateFileUpload, PRESETS } from "../shared/file_validation";

interface UploadServiceImageRequest {
  serviceId: number;
  image: string;
  displayOrder?: number;
}

interface UploadServiceImageResponse {
  id: number;
  imageUrl: string;
  displayOrder: number;
}

export const uploadImage = api(
  { expose: true, method: "POST", path: "/services/:serviceId/images" },
  async ({ serviceId, image, displayOrder }: UploadServiceImageRequest): Promise<UploadServiceImageResponse> => {
    const auth = getAuthData();
    if (!auth) {
      throw APIError.unauthenticated("Authentication required");
    }

    const service = await db.queryRow<{ freelancer_id: string }>`
      SELECT freelancer_id FROM services WHERE id = ${serviceId}
    `;

    if (!service) {
      throw APIError.notFound("Service not found");
    }

    if (service.freelancer_id !== auth.userID) {
      throw APIError.permissionDenied("Not authorized to modify this service");
    }

    const mimeType = extractMimeTypeFromDataUrl(image);
    const base64Data = image.replace(/^data:[^;]+;base64,/, "");
    const buffer = validateFileUpload(base64Data, mimeType, PRESETS.IMAGE_5MB);
    
    const extension = mimeType.split("/")[1] || "jpg";
    const fileName = `service-${serviceId}-${Date.now()}.${extension}`;
    
    await serviceImages.upload(fileName, buffer);
    const imageUrl = await serviceImages.publicUrl(fileName);

    const maxOrder = displayOrder ?? (await db.queryRow<{ max_order: number | null }>`
      SELECT COALESCE(MAX(display_order), -1) + 1 as max_order 
      FROM service_images 
      WHERE service_id = ${serviceId}
    `)?.max_order ?? 0;

    const result = await db.queryRow<{ id: number }>`
      INSERT INTO service_images (service_id, image_url, display_order)
      VALUES (${serviceId}, ${imageUrl}, ${maxOrder})
      RETURNING id
    `;

    if (!result) {
      throw APIError.internal("Failed to insert service image");
    }

    return {
      id: result!.id,
      imageUrl,
      displayOrder: maxOrder,
    };
  }
);
