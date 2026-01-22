import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import backend from "~backend/client";
import type { Product } from "~backend/products/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search, ShoppingCart, Filter } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [page, setPage] = useState(1);
  const limit = 12;
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, [category, page]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const result = await backend.products.list({
        category: category as any || undefined,
        search: search || undefined,
        limit,
        offset: (page - 1) * limit
      });
      setProducts(result.products);
      setTotal(result.total);
    } catch (error) {
      console.error("Failed to load products:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadProducts();
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setPage(1);
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("category", value);
    } else {
      params.delete("category");
    }
    setSearchParams(params);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Shop Beauty Products</h1>
          <p className="text-muted-foreground">Discover curated beauty, hair, and fashion products from our community</p>
        </div>

        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>
          <Select value={category} onValueChange={handleCategoryChange}>
            <option value="">All Categories</option>
            <option value="beauty">Beauty</option>
            <option value="hair">Hair</option>
            <option value="fashion">Fashion</option>
          </Select>
          <Button onClick={handleSearch} className="md:col-span-1">
            <Filter className="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="w-full h-64" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">No products found</h2>
            <p className="text-muted-foreground">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card 
                  key={product.id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => navigate(`/shop/${product.id}`)}
                >
                  <div className="relative aspect-square bg-muted">
                    {product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                    {product.stock_quantity === 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="mb-2">
                      <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full capitalize">
                        {product.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground">
                        {product.stock_quantity} in stock
                      </span>
                    </div>
                    {product.seller_name && (
                      <p className="text-xs text-muted-foreground mt-2">by {product.seller_name}</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
