
import { useState } from "react";
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
import { Search, Plus, Edit, Trash } from "lucide-react";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  status: "active" | "out-of-stock" | "seasonal";
  image: string;
}

const menuItems: MenuItem[] = [
  {
    id: 1,
    name: "Margherita",
    description: "Classic tomato sauce, mozzarella, and fresh basil",
    price: 1132.91,
    category: "pizza",
    status: "active",
    image: "/placeholder.svg"
  },
  {
    id: 2,
    name: "Pepperoni",
    description: "Tomato sauce, mozzarella, and pepperoni",
    price: 1307.13,
    category: "pizza",
    status: "active",
    image: "/placeholder.svg"
  },
  {
    id: 3,
    name: "Vegetarian",
    description: "Tomato sauce, mozzarella, bell peppers, mushrooms, onions",
    price: 1394.13,
    category: "pizza",
    status: "active",
    image: "/placeholder.svg"
  },
  {
    id: 4,
    name: "Garlic Breadsticks",
    description: "Freshly baked breadsticks with garlic butter",
    price: 522.33,
    category: "sides",
    status: "active",
    image: "/placeholder.svg"
  },
  {
    id: 5,
    name: "Caesar Salad",
    description: "Romaine lettuce, croutons, parmesan cheese with Caesar dressing",
    price: 696.55,
    category: "sides",
    status: "active",
    image: "/placeholder.svg"
  },
  {
    id: 6,
    name: "Soda",
    description: "Your choice of Coke, Sprite, or Fanta",
    price: 217.07,
    category: "drinks",
    status: "active",
    image: "/placeholder.svg"
  },
  {
    id: 7,
    name: "Iced Tea",
    description: "Freshly brewed iced tea",
    price: 260.74,
    category: "drinks",
    status: "out-of-stock",
    image: "/placeholder.svg"
  },
  {
    id: 8,
    name: "BBQ Chicken Pizza",
    description: "BBQ sauce, mozzarella, chicken, red onions, and cilantro",
    price: 1481.13,
    category: "pizza",
    status: "active",
    image: "/placeholder.svg"
  },
  {
    id: 9,
    name: "Mango Smoothie",
    description: "Fresh mango blended with yogurt and ice",
    price: 435.32,
    category: "drinks",
    status: "seasonal",
    image: "/placeholder.svg"
  }
];

const MenuManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(menuItems.map(item => item.category)));

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

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      toast({
        title: "Menu Item Updated",
        description: `"${editingItem.name}" has been updated successfully.`,
      });
    } else {
      toast({
        title: "Menu Item Added",
        description: "New menu item has been added successfully.",
      });
    }
    
    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: number, name: string) => {
    toast({
      title: "Menu Item Removed",
      description: `"${name}" has been removed from the menu.`,
    });
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
                          defaultValue={editingItem?.name} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea 
                          required 
                          defaultValue={editingItem?.description}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Price (৳)</label>
                          <Input 
                            type="number" 
                            step="0.01" 
                            required 
                            defaultValue={editingItem?.price}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Category</label>
                          <Select defaultValue={editingItem?.category}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(category => (
                                <SelectItem key={category} value={category}>
                                  {category.charAt(0).toUpperCase() + category.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select defaultValue={editingItem?.status || "active"}>
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
                        <Input type="file" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MenuManagement;
