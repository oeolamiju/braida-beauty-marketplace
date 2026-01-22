import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import backend from "~backend/client";
import type { Product } from "~backend/products/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart, Heart, Share2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await backend.products.get({ id: id! });
      setProduct(data);
    } catch (error) {
      console.error("Failed to load product:", error);
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Product link copied to clipboard"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Product not found</h2>
          <Button onClick={() => navigate("/shop")}>Back to Shop</Button>
        </div>
      </div>
    );
  }

  const images = product.images.length > 0 ? product.images : ["/placeholder-product.jpg"];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/shop")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Shop
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="aspect-square bg-muted">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <Card
                    key={idx}
                    className={`overflow-hidden cursor-pointer ${
                      selectedImage === idx ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedImage(idx)}
                  >
                    <div className="aspect-square bg-muted">
                      <img
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full capitalize">
                  {product.category}
                </span>
                {product.stock_quantity === 0 && (
                  <span className="text-sm font-medium px-3 py-1 bg-destructive/10 text-destructive rounded-full">
                    Out of Stock
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
              {product.seller_name && (
                <p className="text-muted-foreground">by {product.seller_name}</p>
              )}
            </div>

            <div className="text-4xl font-bold">${product.price.toFixed(2)}</div>

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className={product.stock_quantity > 0 ? "text-green-600" : "text-destructive"}>
                {product.stock_quantity > 0 
                  ? `${product.stock_quantity} in stock` 
                  : "Out of stock"}
              </span>
            </div>

            <div className="flex gap-3">
              <Button 
                className="flex-1" 
                size="lg"
                disabled={product.stock_quantity === 0}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            <Card className="p-4 bg-muted/50">
              <h3 className="font-semibold mb-2">Product Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="capitalize">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Availability</span>
                  <span>{product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seller</span>
                  <span>{product.seller_name || "Unknown"}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
