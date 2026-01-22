import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { APIError } from "encore.dev/api";
import db from "../db";

interface UploadImageRequest {
  id: string;
  image: string;
  filename: string;
}

interface UploadImageResponse {
  url: string;
}

export const uploadImage = api(
  { method: "POST", path: "/products/:id/images", expose: true, auth: true },
  async ({ id, image, filename }: UploadImageRequest): Promise<UploadImageResponse> => {
    const auth = getAuthData()!;

    const product = await db.queryRow<{ seller_id: string; images: string[] }>`
      SELECT seller_id, images FROM products WHERE id = ${id}
    `;

    if (!product) {
      throw APIError.notFound("Product not found");
    }

    if (product.seller_id !== auth.userID && auth.role !== "ADMIN") {
      throw APIError.permissionDenied("You don't have permission to upload images to this product");
    }

    if (product.images.length >= 5) {
      throw APIError.invalidArgument("Maximum 5 images per product");
    }

    const url = image;

    await db.exec`UPDATE products SET images = array_append(images, ${url}) WHERE id = ${id}`

    return { url };
  }
);
