import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { requireFreelancer } from "../auth/middleware";
import db from "../db";
import { APIError } from "encore.dev/api";

export interface ReorderImagesRequest {
  serviceId: number;
  imageOrder: number[]; // Array of image IDs in new order
}

export interface ReorderImagesResponse {
  success: boolean;
  message: string;
}

export const reorderImages = api<ReorderImagesRequest, ReorderImagesResponse>(
  { method: "PUT", path: "/services/:serviceId/images/reorder", expose: true, auth: true },
  async (req): Promise<ReorderImagesResponse> => {
    requireFreelancer();
    const auth = getAuthData()!;

    // Verify service ownership
    const service = await db.queryRow<{ freelancer_id: string }>`
      SELECT freelancer_id FROM services WHERE id = ${req.serviceId}
    `;

    if (!service) {
      throw APIError.notFound("Service not found");
    }

    if (service.freelancer_id !== auth.userID) {
      throw APIError.permissionDenied("You can only reorder images for your own services");
    }

    // Verify all image IDs belong to this service
    const existingImagesGen = db.query<{ id: number }>`
      SELECT id FROM service_images WHERE service_id = ${req.serviceId}
    `;

    const existingIds = new Set<number>();
    for await (const img of existingImagesGen) {
      existingIds.add(img.id);
    }

    for (const imageId of req.imageOrder) {
      if (!existingIds.has(imageId)) {
        throw APIError.invalidArgument(`Image ${imageId} does not belong to this service`);
      }
    }

    // Update display order for each image
    for (let i = 0; i < req.imageOrder.length; i++) {
      await db.exec`
        UPDATE service_images
        SET display_order = ${i}
        WHERE id = ${req.imageOrder[i]}
      `;
    }

    return {
      success: true,
      message: "Image order updated successfully",
    };
  }
);

