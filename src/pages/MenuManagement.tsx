import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Search, Plus, Edit, Trash, Loader2 } from "lucide-react";
import { MenuItem, menuItemsService } from "@/lib/supabase";

const MenuManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    status: "active" as "active" | "out-of-stock" | "seasonal",
  });
  
  const queryClient = useQueryClient();
  
  // Fetch menu items with better error handling
  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ["menuItems"],
    queryFn: async () => {
      console.log("Fetching menu items in MenuManagement component");
      const items = await menuItemsService.getAll();
      console.log("Menu items fetched:", items);
      return items;
    },
  });

  // Create menu item mutation
  const createMutation = useMutation({
    mutationFn: async (newItem: Omit<MenuItem, 'id' | 'created_at'>) => {
      console.log("Creating new menu item:", newItem);
      return menuItemsService.create(newItem);
    },
    onSuccess: () => {
      console.log("Successfully created menu item, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
      toast({
        title: "Menu Item Added",
        description: "New menu item has been added successfully.",
      });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error("Error in create mutation:", error);
      toast({
        title: "Failed to add item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update menu item mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MenuItem> }) => {
      return menuItemsService.update(id, data);
    },
    onSuccess: () => {
      console.log("Successfully updated menu item, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
      toast({
        title: "Menu Item Updated",
        description: "Menu item has been updated successfully.",
      });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error("Error in update mutation:", error);
      toast({
        title: "Failed to update item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete menu item mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return menuItemsService.delete(id);
    },
    onSuccess: () => {
      console.log("Successfully deleted menu item, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
      toast({
        title: "Menu Item Deleted",
        description: "Menu item has been deleted successfully.",
      });
    },
    onError: (error) => {
      console.error("Error in delete mutation:", error);
      toast({
        title: "Failed to delete item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      status: "active",
    });
    setFileUpload(null);
    setEditingItem(null);
  };

  // Set form data when editing item
  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        description: editingItem.description,
        price: editingItem.price.toString(),
        category: editingItem.category,
        status: editingItem.status,
      });
    } else {
      resetForm();
    }
  }, [editingItem]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle select input changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file input changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFileUpload(file);
  };

  // Handle form submission
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log("Saving menu item, form data:", formData);
      let imageUrl = editingItem?.image_url || '';
      
      // Upload image if available
      if (fileUpload) {
        console.log("Uploading file:", fileUpload.name);
        const fileName = `${Date.now()}_${fileUpload.name}`;
        imageUrl = await menuItemsService.uploadImage(fileUpload, fileName);
      }
      
      const itemData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        status: formData.status,
        image_url: imageUrl,
      };
      
      console.log("Prepared item data:", itemData);
      
      if (editingItem) {
        updateMutation.mutate({ id: editingItem.id, data: itemData });
      } else {
        createMutation.mutate(itemData);
      }
    } catch (error) {
      console.error("Error saving menu item:", error);
      toast({
        title: "Error",
        description: "Failed to save menu item",
        variant: "destructive",
      });
    }
  };

  // Handle delete item
  const handleDeleteItem = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };
  
  // Filter menu items based on search term and category
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories from menu items
  const categories = Array.from(new Set(menuItems.map(item => item.category)))
    .filter(category => typeof category === 'string') as string[];

  // Get status color for badges
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "out-of-stock":
        return "bg-red-100 text-red-800";
      case "seasonal":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Menu Management</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">Total Menu Items</h3>
                <p className="text-2xl font-bold">{menuItems.length}</p>
                <p className="text-xs text-gray-500 mt-1">Across {categories.length} categories</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">Out of Stock</h3>
                <p className="text-2xl font-bold">
                  {menuItems.filter(item => item.status === "out-of-stock").length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Items unavailable</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">Seasonal Items</h3>
                <p className="text-2xl font-bold">
                  {menuItems.filter(item => item.status === "seasonal").length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Limited time offerings</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Menu Items Table */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
            <CardTitle>Menu Items</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search menu items..."
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingItem(null)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingItem 
                        ? "Update the details of this menu item." 
                        : "Fill in the details to add a new menu item."}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSaveItem}>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Item Name</label>
                        <Input 
                          required
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea 
                          required
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Price (৳)</label>
                          <Input 
                            type="number" 
                            step="0.01"
                            required
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Category</label>
                          <Select 
                            value={formData.category} 
                            onValueChange={(value) => handleSelectChange("category", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.length > 0 ? (
                                categories.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                  </SelectItem>
                                ))
                              ) : (
                                <>
                                  <SelectItem value="pizza">Pizza</SelectItem>
                                  <SelectItem value="sides">Sides</SelectItem>
                                  <SelectItem value="drinks">Drinks</SelectItem>
                                </>
                              )}
                              <SelectItem value="new">+ Add New Category</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select 
                          value={formData.status} 
                          onValueChange={(value: "active" | "out-of-stock" | "seasonal") => 
                            handleSelectChange("status", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                            <SelectItem value="seasonal">Seasonal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Image</label>
                        <Input 
                          type="file" 
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                        {editingItem?.image_url && !fileUpload && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500">Current image:</p>
                            <img 
                              src={editingItem.image_url} 
                              alt={editingItem.name} 
                              className="mt-1 h-20 w-auto object-cover rounded-md"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setDialogOpen(false);
                          resetForm();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                        {(createMutation.isPending || updateMutation.isPending) && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {editingItem ? "Save Changes" : "Add Item"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap gap-2">
              <Button 
                variant={categoryFilter === null ? "default" : "outline"}
                onClick={() => setCategoryFilter(null)}
                size="sm"
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={categoryFilter === category ? "default" : "outline"}
                  onClick={() => setCategoryFilter(category)}
                  size="sm"
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-gray-500">Loading menu items...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500">No menu items found</p>
                {searchTerm && (
                  <p className="text-gray-400 text-sm mt-1">
                    Try adjusting your search or filter
                  </p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="capitalize">{item.category}</TableCell>
                        <TableCell className="max-w-[300px] truncate">{item.description}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${getStatusColor(item.status)} capitalize`}
                          >
                            {item.status.replace("-", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">৳{item.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setEditingItem(item);
                                setDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => handleDeleteItem(item.id, item.name)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MenuManagement;
