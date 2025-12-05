import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts, Product } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2, X } from 'lucide-react';

const Admin = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { products, loading, refreshProducts } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    gender: 'men',
    retail_price: '',
    wholesale_price: '',
    image_url: '',
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="font-display text-4xl text-foreground mb-4">Access Denied</h1>
            <p className="font-body text-muted-foreground">
              You do not have permission to access the admin panel.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      gender: 'men',
      retail_price: '',
      wholesale_price: '',
      image_url: '',
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      title: product.title,
      description: product.description || '',
      gender: product.gender,
      retail_price: product.retail_price.toString(),
      wholesale_price: product.wholesale_price.toString(),
      image_url: product.image_url || '',
    });
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Product deleted',
        description: 'The product has been removed',
      });
      refreshProducts();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const productData = {
      title: formData.title,
      description: formData.description || null,
      gender: formData.gender,
      retail_price: parseFloat(formData.retail_price),
      wholesale_price: parseFloat(formData.wholesale_price),
      image_url: formData.image_url || null,
    };

    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update product',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Product updated',
          description: 'The product has been updated successfully',
        });
        resetForm();
        refreshProducts();
      }
    } else {
      const { error } = await supabase
        .from('products')
        .insert(productData);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to add product',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Product added',
          description: 'The product has been added successfully',
        });
        resetForm();
        refreshProducts();
      }
    }

    setFormLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-4xl text-foreground mb-2">
                Admin <span className="text-primary">Panel</span>
              </h1>
              <p className="font-body text-muted-foreground">
                Manage your product catalog
              </p>
            </div>
            <Button
              variant="gold"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>

          {/* Product Form Modal */}
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
              <div className="glass-card rounded-xl p-6 w-full max-w-lg animate-scale-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl text-foreground">
                    {editingProduct ? 'Edit Product' : 'Add Product'}
                  </h2>
                  <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="mt-1 bg-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1 bg-input"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => setFormData({ ...formData, gender: value })}
                    >
                      <SelectTrigger className="mt-1 bg-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="men">Men</SelectItem>
                        <SelectItem value="women">Women</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="retail_price">Retail Price ($)</Label>
                      <Input
                        id="retail_price"
                        type="number"
                        step="0.01"
                        value={formData.retail_price}
                        onChange={(e) => setFormData({ ...formData, retail_price: e.target.value })}
                        required
                        className="mt-1 bg-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="wholesale_price">Wholesale Price ($)</Label>
                      <Input
                        id="wholesale_price"
                        type="number"
                        step="0.01"
                        value={formData.wholesale_price}
                        onChange={(e) => setFormData({ ...formData, wholesale_price: e.target.value })}
                        required
                        className="mt-1 bg-input"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                      id="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="mt-1 bg-input"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" variant="gold" className="flex-1" disabled={formLoading}>
                      {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editingProduct ? 'Update' : 'Add'} Product
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Products Table */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 glass-card rounded-lg">
              <p className="font-display text-2xl text-muted-foreground mb-4">
                No products yet
              </p>
              <p className="font-body text-muted-foreground">
                Add your first product to get started
              </p>
            </div>
          ) : (
            <div className="glass-card rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left font-body text-sm text-muted-foreground uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left font-body text-sm text-muted-foreground uppercase tracking-wider">
                        Gender
                      </th>
                      <th className="px-4 py-3 text-left font-body text-sm text-muted-foreground uppercase tracking-wider">
                        Retail
                      </th>
                      <th className="px-4 py-3 text-left font-body text-sm text-muted-foreground uppercase tracking-wider">
                        Wholesale
                      </th>
                      <th className="px-4 py-3 text-right font-body text-sm text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded bg-secondary flex-shrink-0 overflow-hidden">
                              {product.image_url ? (
                                <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="font-display text-lg text-muted-foreground/30">
                                    {product.title.charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-display text-foreground">{product.title}</p>
                              {product.description && (
                                <p className="font-body text-sm text-muted-foreground line-clamp-1">
                                  {product.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-body text-sm text-foreground capitalize">
                            {product.gender}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-display text-primary">
                            ${product.retail_price.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-body text-muted-foreground">
                            ${product.wholesale_price.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(product)}
                              className="h-8 w-8"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(product.id)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
