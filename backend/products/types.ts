export type ProductCategory = "beauty" | "hair" | "fashion";

export interface Product {
  id: string;
  seller_id: string;
  seller_name?: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  stock_quantity: number;
  images: string[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  stock_quantity: number;
}

export interface UpdateProductRequest {
  id: string;
  name?: string;
  description?: string;
  category?: ProductCategory;
  price?: number;
  stock_quantity?: number;
  is_active?: boolean;
}

export interface ListProductsRequest {
  category?: ProductCategory;
  seller_id?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ListProductsResponse {
  products: Product[];
  total: number;
}
