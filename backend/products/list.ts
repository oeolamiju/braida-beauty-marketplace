import { api } from "encore.dev/api";
import db from "../db";
import { ListProductsRequest, ListProductsResponse, Product } from "./types";
import { ListProductsSchema } from "./schemas";

export const list = api(
  { method: "GET", path: "/products", expose: true },
  async (req: ListProductsRequest): Promise<ListProductsResponse> => {
    ListProductsSchema.parse(req);

    const { category, seller_id, search, limit = 20, offset = 0 } = req;

    let query = `
      SELECT COUNT(*) as count
      FROM products
      WHERE is_active = true
    `;

    let listQuery = `
      SELECT 
        p.id, p.seller_id, p.name, p.description, p.category, 
        p.price, p.stock_quantity, p.images, p.is_active, 
        p.created_at, p.updated_at,
        u.full_name as seller_name
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE p.is_active = true
    `;

    if (category) {
      query += ` AND category = '${category}'`;
      listQuery += ` AND p.category = '${category}'`;
    }

    if (seller_id) {
      query += ` AND seller_id = '${seller_id}'`;
      listQuery += ` AND p.seller_id = '${seller_id}'`;
    }

    if (search) {
      const searchTerm = search.replace(/'/g, "''");
      query += ` AND (name ILIKE '%${searchTerm}%' OR description ILIKE '%${searchTerm}%')`;
      listQuery += ` AND (p.name ILIKE '%${searchTerm}%' OR p.description ILIKE '%${searchTerm}%')`;
    }

    const countRows = await db.rawQueryAll<{ count: number }>(query);
    const total = countRows.length > 0 ? countRows[0].count : 0;

    listQuery += ` ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    const products = await db.rawQueryAll<Product & { seller_name: string }>(listQuery)

    return { products, total };
  }
);
