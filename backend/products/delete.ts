import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { APIError } from "encore.dev/api";
import db from "../db";

export const deleteProduct = api(
  { method: "DELETE", path: "/products/:id", expose: true, auth: true },
  async ({ id }: { id: string }): Promise<{ success: boolean }> => {
    const auth = getAuthData()!;

    const existing = await db.queryRow<{ seller_id: string }>`
      SELECT seller_id FROM products WHERE id = ${id}
    `;

    if (!existing) {
      throw APIError.notFound("Product not found");
    }

    if (existing.seller_id !== auth.userID && auth.role !== "ADMIN") {
      throw APIError.permissionDenied("You don't have permission to delete this product");
    }

    await db.exec`
      DELETE FROM products WHERE id = ${id}
    `;

    return { success: true };
  }
);
