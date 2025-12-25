import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { serviceImages } from "../profiles/storage";
import db from "../db";
import { APIError } from "encore.dev/api";

interface DeleteServiceImageRequest {
  serviceId: number;
  imageId: number;
}

export const deleteImage = api(
  { expose: true, method: "DELETE", path: "/services/:serviceId/images/:imageId" },
  async ({ serviceId, imageId }: DeleteServiceImageRequest): Promise<void> => {
    const auth = getAuthData();
    if (!auth) {
      throw APIError.unauthenticated("Authentication required");
    }

    const result = await db.queryRow<{ image_url: string; stylist_id: string }>`
      SELECT si.image_url, s.stylist_id
      FROM service_images si
      JOIN services s ON s.id = si.service_id
      WHERE si.id = ${imageId} AND si.service_id = ${serviceId}
    `;

    if (!result) {
      throw APIError.notFound("Service image not found");
    }

    if (result.stylist_id !== auth.userID) {
      throw APIError.permissionDenied("Not authorized to delete this image");
    }

    const fileName = result.image_url.split("/").pop();
    if (fileName) {
      try {
        await serviceImages.remove(fileName);
      } catch (error) {
        console.error("Failed to delete image from storage:", error);
      }
    }

    await db.exec`
      DELETE FROM service_images WHERE id = ${imageId}
    `;
  }
);
