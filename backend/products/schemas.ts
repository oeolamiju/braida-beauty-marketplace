import { z } from "zod";

export const CreateProductSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(1),
  category: z.enum(["beauty", "hair", "fashion"]),
  price: z.number().min(0),
  stock_quantity: z.number().int().min(0)
});

export const UpdateProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  category: z.enum(["beauty", "hair", "fashion"]).optional(),
  price: z.number().min(0).optional(),
  stock_quantity: z.number().int().min(0).optional(),
  is_active: z.boolean().optional()
});

export const ListProductsSchema = z.object({
  category: z.enum(["beauty", "hair", "fashion"]).optional(),
  seller_id: z.string().uuid().optional(),
  search: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20).optional(),
  offset: z.number().int().min(0).default(0).optional()
});
