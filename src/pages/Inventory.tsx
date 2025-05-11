
import { useState, useEffect } from "react";
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
import { Search, Plus, AlertCircle, Package, RefreshCcw, Bell } from "lucide-react";
import { InventoryItem, inventoryService } from "@/lib/inventoryService";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRestocking, setIsRestocking] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(0);

  useEffect(() => {
    loadInventoryItems();
    // Check for low stock on load
    checkLowStock();
  }, []);

  const loadInventoryItems = async () => {
    setLoading(true);
    const items = await inventoryService.getInventoryItems();
    setInventoryItems(items);
    setLoading(false);
  };

  const checkLowStock = async () => {
    const lowStockItems = await inventoryService.checkLowStockItems();
    if (lowStockItems.length > 0) {
      toast({
        title: "Low Stock Alert",
        description: `${lowStockItems.length} items are below minimum stock levels`,
        variant: "destructive",
      });
    }
  };

  const handleAutoRestock = async () => {
    setIsRestocking(true);
    const result = await inventoryService.processAutoRestock();
    if (result.success) {
      // Update local inventory with restocked items
      setInventoryItems(prev => 
        prev.map(item => {
          const restocked = result.restockedItems.find(r => r.id === item.id);
          return restocked || item;
        })
      );
    }
    setIsRestocking(false);
  };

  const handleManualRestock = async () => {
    if (!selectedItem) return;
    
    const success = await inventoryService.restockItem(selectedItem.id, restockAmount);
    if (success) {
      // Simulate updating the item locally
      setInventoryItems(prev => 
        prev.map(item => 
          item.id === selectedItem.id 
            ? { 
                ...item, 
                quantity: item.quantity + restockAmount,
                lastRestocked: new Date().toISOString().split('T')[0]
              } 
            : item
        )
      );
    }
  };

  const handleSendAlerts = async () => {
    await inventoryService.sendLowStockAlerts();
  };

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(inventoryItems.map(item => item.category)));

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

        {/* Action buttons */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Button 
            onClick={handleAutoRestock} 
            disabled={isRestocking}
            className="flex items-center gap-2"
          >
            {isRestocking ? (
              <div className="flex items-center gap-2">
                <RefreshCcw className="h-4 w-4 animate-spin" />
                Processing...
              </div>
            ) : (
              <>
                <RefreshCcw className="h-4 w-4" />
                Auto-Restock Low Items
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleSendAlerts} className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Send Stock Alerts
          </Button>
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

            {loading ? (
              <div className="flex justify-center items-center h-48">
                <RefreshCcw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Auto-Restock</TableHead>
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
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch 
                              id={`auto-restock-${item.id}`} 
                              checked={item.isAutoRestock || false} 
                              onCheckedChange={(checked) => {
                                setInventoryItems(prev => 
                                  prev.map(i => i.id === item.id ? {...i, isAutoRestock: checked} : i)
                                );
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell>{item.supplier}</TableCell>
                        <TableCell>{item.lastRestocked}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant={item.quantity < item.minLevel ? "default" : "outline"}
                                onClick={() => {
                                  setSelectedItem(item);
                                  setRestockAmount(item.reorderAmount || 5);
                                }}
                              >
                                Restock
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Restock {selectedItem?.name}</DialogTitle>
                              </DialogHeader>
                              <div className="py-4">
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="current-quantity">Current Quantity</Label>
                                    <Input 
                                      id="current-quantity" 
                                      value={selectedItem?.quantity} 
                                      disabled 
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="restock-amount">Restock Amount</Label>
                                    <Input 
                                      id="restock-amount" 
                                      type="number" 
                                      value={restockAmount} 
                                      onChange={(e) => setRestockAmount(Number(e.target.value))}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="supplier">Supplier</Label>
                                    <Input 
                                      id="supplier" 
                                      value={selectedItem?.supplier} 
                                      disabled 
                                    />
                                  </div>
                                </div>
                              </div>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button onClick={handleManualRestock}>Place Order</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
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

export default Inventory;
