import { api } from "encore.dev/api";
import db from "../db";
import { APIError } from "encore.dev/api";

interface ListServiceImagesRequest {
  serviceId: number;
}

interface ServiceImage {
  id: number;
  imageUrl: string;
  displayOrder: number;
}

interface ListServiceImagesResponse {
  images: ServiceImage[];
}

export const listImages = api(
  { expose: true, method: "GET", path: "/services/:serviceId/images", auth: false },
  async ({ serviceId }: ListServiceImagesRequest): Promise<ListServiceImagesResponse> => {
    const service = await db.queryRow`
      SELECT id FROM services WHERE id = ${serviceId}
    `;

    if (!service) {
      throw APIError.notFound("Service not found");
    }

    const rows = await db.queryAll<{ id: number; image_url: string; display_order: number }>`
      SELECT id, image_url, display_order
      FROM service_images
      WHERE service_id = ${serviceId}
      ORDER BY display_order ASC
    `;

    return {
      images: rows.map((row) => ({
        id: row.id,
        imageUrl: row.image_url,
        displayOrder: row.display_order,
      })),
    };
  }
);
