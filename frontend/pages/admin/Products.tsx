import { useState, useEffect } from "react";
import backend from "~backend/client";
import type { Product, ProductCategory } from "~backend/products/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, Upload, X } from "lucide-react";
import { Table } from "@/components/ui/table";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "beauty" as ProductCategory,
    price: 0,
    stock_quantity: 0,
    is_active: true
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const result = await backend.products.list({ limit: 100 });
      setProducts(result.products);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let product: Product;
      
      if (editingProduct) {
        product = await backend.products.update({
          id: editingProduct.id,
          ...formData
        });
        toast({
          title: "Success",
          description: "Product updated successfully"
        });
      } else {
        product = await backend.products.create(formData);
        toast({
          title: "Success",
          description: "Product created successfully"
        });
      }

      for (const file of imageFiles) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            await backend.products.uploadImage({
              id: product.id,
              image: reader.result as string,
              filename: file.name
            });
          } catch (error) {
            console.error("Failed to upload image:", error);
          }
        };
        reader.readAsDataURL(file);
      }

      setShowDialog(false);
      resetForm();
      loadProducts();
    } catch (error) {
      console.error("Failed to save product:", error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await backend.products.deleteProduct({ id });
      toast({
        title: "Success",
        description: "Product deleted successfully"
      });
      loadProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      stock_quantity: product.stock_quantity,
      is_active: product.is_active
    });
    setShowDialog(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      category: "beauty",
      price: 0,
      stock_quantity: 0,
      is_active: true
    });
    setImageFiles([]);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files).slice(0, 5));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Card className="p-6">
        <Table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  {product.images[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded" />
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded" />
                  )}
                </td>
                <td className="font-medium">{product.name}</td>
                <td className="capitalize">{product.category}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>{product.stock_quantity}</td>
                <td>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    product.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    {product.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Dialog open={showDialog} onOpenChange={(open) => {
        setShowDialog(open);
        if (!open) resetForm();
      }}>
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold mb-4">
            {editingProduct ? "Edit Product" : "Add Product"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as ProductCategory })}
                >
                  <option value="beauty">Beauty</option>
                  <option value="hair">Hair</option>
                  <option value="fashion">Fashion</option>
                </Select>
              </div>

              <div>
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Stock Quantity</Label>
              <Input
                type="number"
                min="0"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })}
                required
              />
            </div>

            <div>
              <Label>Images (up to 5)</Label>
              <div className="mt-2">
                <label className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload images</span>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              </div>
              {imageFiles.length > 0 && (
                <div className="mt-2 flex gap-2">
                  {imageFiles.map((file, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${idx + 1}`}
                        className="w-20 h-20 object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingProduct ? "Update" : "Create"} Product
              </Button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
}
