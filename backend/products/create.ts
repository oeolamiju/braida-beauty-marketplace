import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { CreateProductRequest, Product } from "./types";
import { CreateProductSchema } from "./schemas";

export const create = api(
  { method: "POST", path: "/products", expose: true, auth: true },
  async (req: CreateProductRequest): Promise<Product> => {
    const auth = getAuthData()!;
    
    CreateProductSchema.parse(req);

    const result = await db.queryRow<Product>`
      INSERT INTO products (seller_id, name, description, category, price, stock_quantity)
      VALUES (${auth.userID}, ${req.name}, ${req.description}, ${req.category}, ${req.price}, ${req.stock_quantity})
      RETURNING id, seller_id, name, description, category, price, stock_quantity, images, is_active, created_at, updated_at
    `;

    return result!;
  }
);
