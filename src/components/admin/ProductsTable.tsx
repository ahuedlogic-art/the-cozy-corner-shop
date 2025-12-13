import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProductForm, ProductFormData } from "./ProductForm";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image: string | null;
  category: string;
  brand: string;
  rating: number | null;
  review_count: number | null;
  is_top_item: boolean | null;
  in_stock: boolean | null;
  stock_quantity: number;
  sizes: string[] | null;
  colors: string[] | null;
  created_at: string;
}

export function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch products");
      console.error(error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreate = async (data: ProductFormData) => {
    const { error } = await supabase.from("products").insert({
      name: data.name,
      description: data.description || null,
      price: data.price,
      original_price: data.original_price ? Number(data.original_price) : null,
      image: data.image || null,
      category: data.category,
      brand: data.brand,
      sizes: data.sizes || [],
      colors: data.colors || [],
      stock_quantity: data.stock_quantity,
      is_top_item: data.is_top_item,
      in_stock: data.in_stock,
    });

    if (error) {
      toast.error("Failed to create product");
      console.error(error);
    } else {
      toast.success("Product created successfully");
      fetchProducts();
    }
  };

  const handleUpdate = async (data: ProductFormData) => {
    if (!editingProduct) return;

    const { error } = await supabase
      .from("products")
      .update({
        name: data.name,
        description: data.description || null,
        price: data.price,
        original_price: data.original_price ? Number(data.original_price) : null,
        image: data.image || null,
        category: data.category,
        brand: data.brand,
        sizes: data.sizes || [],
        colors: data.colors || [],
        stock_quantity: data.stock_quantity,
        is_top_item: data.is_top_item,
        in_stock: data.in_stock,
      })
      .eq("id", editingProduct.id);

    if (error) {
      toast.error("Failed to update product");
      console.error(error);
    } else {
      toast.success("Product updated successfully");
      setEditingProduct(null);
      fetchProducts();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase.from("products").delete().eq("id", deleteId);

    if (error) {
      toast.error("Failed to delete product");
      console.error(error);
    } else {
      toast.success("Product deleted successfully");
      fetchProducts();
    }
    setDeleteId(null);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading products...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Products</h2>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No products found. Add your first product!
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-muted" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.brand}</TableCell>
                  <TableCell>
                    ${product.price.toFixed(2)}
                    {product.original_price && (
                      <span className="ml-2 text-xs text-muted-foreground line-through">
                        ${product.original_price.toFixed(2)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span>{product.stock_quantity}</span>
                      {product.stock_quantity < 10 && product.stock_quantity > 0 && (
                        <Badge variant="outline" className="text-amber-600 border-amber-600">
                          Low
                        </Badge>
                      )}
                      {product.stock_quantity === 0 && (
                        <Badge variant="destructive">Out</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Badge variant={product.in_stock ? "default" : "secondary"}>
                        {product.in_stock ? "In Stock" : "Out of Stock"}
                      </Badge>
                      {product.is_top_item && <Badge variant="outline">Top</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(product)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => setDeleteId(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProductForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
      />

      <ProductForm
        open={!!editingProduct}
        onOpenChange={(open) => !open && setEditingProduct(null)}
        onSubmit={handleUpdate}
        defaultValues={
          editingProduct
            ? {
                name: editingProduct.name,
                description: editingProduct.description || "",
                price: editingProduct.price,
                original_price: editingProduct.original_price || "",
                image: editingProduct.image || "",
                category: editingProduct.category,
                brand: editingProduct.brand,
                sizes: editingProduct.sizes || [],
                colors: editingProduct.colors || [],
                stock_quantity: editingProduct.stock_quantity,
                is_top_item: editingProduct.is_top_item || false,
                in_stock: editingProduct.in_stock ?? true,
              }
            : undefined
        }
        isEditing
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
