import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { APIError } from "encore.dev/api";
import db from "../db";

interface DeleteImageRequest {
  id: string;
  image_url: string;
}

export const deleteImage = api(
  { method: "DELETE", path: "/products/:id/images", expose: true, auth: true },
  async ({ id, image_url }: DeleteImageRequest): Promise<{ success: boolean }> => {
    const auth = getAuthData()!;

    const product = await db.queryRow<{ seller_id: string }>`
      SELECT seller_id FROM products WHERE id = ${id}
    `;

    if (!product) {
      throw APIError.notFound("Product not found");
    }

    if (product.seller_id !== auth.userID && auth.role !== "ADMIN") {
      throw APIError.permissionDenied("You don't have permission to delete images from this product");
    }

    await db.exec`
      UPDATE products
      SET images = array_remove(images, ${image_url})
      WHERE id = ${id}
    `;

    return { success: true };
  }
);
