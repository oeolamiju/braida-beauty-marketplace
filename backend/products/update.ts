import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { UpdateProductRequest, Product } from "./types";
import { UpdateProductSchema } from "./schemas";
import { APIError } from "encore.dev/api";

export const update = api(
  { method: "PUT", path: "/products/:id", expose: true, auth: true },
  async ({ id, ...req }: UpdateProductRequest): Promise<Product> => {
    const auth = getAuthData()!;
    
    UpdateProductSchema.parse({ id, ...req });

    const existing = await db.queryRow<{ seller_id: string }>`
      SELECT seller_id FROM products WHERE id = ${id}
    `;

    if (!existing) {
      throw APIError.notFound("Product not found");
    }

    if (existing.seller_id !== auth.userID && auth.role !== "ADMIN") {
      throw APIError.permissionDenied("You don't have permission to update this product");
    }

    let updateQuery = "UPDATE products SET ";
    const setParts: string[] = [];

    if (req.name !== undefined) {
      setParts.push(`name = '${req.name.replace(/'/g, "''")}'`);
    }
    if (req.description !== undefined) {
      setParts.push(`description = '${req.description.replace(/'/g, "''")}'`);
    }
    if (req.category !== undefined) {
      setParts.push(`category = '${req.category}'`);
    }
    if (req.price !== undefined) {
      setParts.push(`price = ${req.price}`);
    }
    if (req.stock_quantity !== undefined) {
      setParts.push(`stock_quantity = ${req.stock_quantity}`);
    }
    if (req.is_active !== undefined) {
      setParts.push(`is_active = ${req.is_active}`);
    }

    setParts.push("updated_at = NOW()");

    updateQuery += setParts.join(", ");
    updateQuery += ` WHERE id = '${id}' RETURNING id, seller_id, name, description, category, price, stock_quantity, images, is_active, created_at, updated_at`;

    const rows = await db.rawQueryAll<Product>(updateQuery);
    const result = rows[0]

    return result!;
  }
);
