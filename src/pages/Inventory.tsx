
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Search, Plus, AlertCircle, Package } from "lucide-react";

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minLevel: number;
  supplier: string;
  lastRestocked: string;
}

const inventoryItems: InventoryItem[] = [
  {
    id: 1,
    name: "Mozzarella Cheese",
    category: "Dairy",
    quantity: 2.5,
    unit: "kg",
    minLevel: 5,
    supplier: "BD Dairy Suppliers",
    lastRestocked: "2025-04-30"
  },
  {
    id: 2,
    name: "Pepperoni",
    category: "Meat",
    quantity: 0.8,
    unit: "kg",
    minLevel: 2,
    supplier: "Meat Masters Ltd.",
    lastRestocked: "2025-04-29"
  },
  {
    id: 3,
    name: "Pizza Dough",
    category: "Bakery",
    quantity: 10,
    unit: "balls",
    minLevel: 15,
    supplier: "Fresh Dough Co.",
    lastRestocked: "2025-05-01"
  },
  {
    id: 4,
    name: "Tomato Sauce",
    category: "Sauce",
    quantity: 3,
    unit: "liters",
    minLevel: 5,
    supplier: "Sauce Kings",
    lastRestocked: "2025-04-28"
  },
  {
    id: 5,
    name: "Bell Peppers",
    category: "Vegetable",
    quantity: 8,
    unit: "kg",
    minLevel: 5,
    supplier: "Fresh Farms",
    lastRestocked: "2025-05-02"
  },
  {
    id: 6,
    name: "Mushrooms",
    category: "Vegetable",
    quantity: 6,
    unit: "kg",
    minLevel: 4,
    supplier: "Fresh Farms",
    lastRestocked: "2025-05-02"
  },
  {
    id: 7,
    name: "Onions",
    category: "Vegetable",
    quantity: 12,
    unit: "kg",
    minLevel: 8,
    supplier: "Fresh Farms",
    lastRestocked: "2025-05-01"
  }
];

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(inventoryItems.map(item => item.category)));

  const handleRestock = (itemId: number) => {
    toast({
      title: "Restock Order Placed",
      description: `Restock order placed for item #${itemId}`,
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Inventory Management</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Package className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">Total Items</h3>
                <p className="text-2xl font-bold">{inventoryItems.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="bg-red-100 p-2 rounded-full">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">Low Stock Items</h3>
                <p className="text-2xl font-bold">
                  {inventoryItems.filter(item => item.quantity < item.minLevel).length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="bg-green-100 p-2 rounded-full">
                  <Package className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">Categories</h3>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Package className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">Suppliers</h3>
                <p className="text-2xl font-bold">
                  {new Set(inventoryItems.map(item => item.supplier)).size}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Table */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
            <CardTitle>Inventory Items</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search inventory..."
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
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
                  {category}
                </Button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Last Restocked</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            item.quantity < item.minLevel
                              ? "bg-red-100 text-red-800"
                              : item.quantity > item.minLevel * 2
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {item.quantity < item.minLevel
                            ? "Low Stock"
                            : item.quantity > item.minLevel * 2
                            ? "Well Stocked"
                            : "Adequate"}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.supplier}</TableCell>
                      <TableCell>{item.lastRestocked}</TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant={item.quantity < item.minLevel ? "default" : "outline"}
                          onClick={() => handleRestock(item.id)}
                        >
                          Restock
                        </Button>
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

export default Inventory;
