import { api } from "encore.dev/api";
import { APIError } from "encore.dev/api";
import db from "../db";
import { Product } from "./types";

export const get = api(
  { method: "GET", path: "/products/:id", expose: true },
  async ({ id }: { id: string }): Promise<Product> => {
    const product = await db.queryRow<Product & { seller_name: string }>`
      SELECT 
        p.id, p.seller_id, p.name, p.description, p.category, 
        p.price, p.stock_quantity, p.images, p.is_active, 
        p.created_at, p.updated_at,
        u.first_name || ' ' || u.last_name as seller_name
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE p.id = ${id}
    `;

    if (!product) {
      throw APIError.notFound("Product not found");
    }

    return product;
  }
);
