import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Search, Truck, Users, Package, ShoppingCart, Clock } from "lucide-react";

// Sample order data
const orders = [
  {
    id: "ORD-5623",
    customer: "John Smith",
    items: "1× Margherita, 1× Garlic Breadsticks",
    status: "preparing",
    time: "10 min ago",
    total: 1655.24,
    type: "delivery",
    address: "123 Main St, Apt 4B",
    phone: "+880 1712-345678",
    paymentMethod: "Cash on Delivery",
  },
  {
    id: "ORD-5622",
    customer: "Emily Johnson",
    items: "2× Pepperoni, 1× Caesar Salad",
    status: "pending",
    time: "15 min ago",
    total: 3311.36,
    type: "pickup",
    phone: "+880 1812-567890",
    paymentMethod: "Credit Card",
  },
  {
    id: "ORD-5621",
    customer: "Michael Brown",
    items: "1× Vegetarian, 2× Soda",
    status: "ready",
    time: "25 min ago",
    total: 1828.27,
    type: "dine-in",
    tableNumber: "Table 8",
    phone: "+880 1912-123456",
    paymentMethod: "Credit Card",
  },
  {
    id: "ORD-5620",
    customer: "Sarah Davis",
    items: "1× Margherita, 1× Pepperoni",
    status: "delivered",
    time: "35 min ago",
    total: 2440.04,
    type: "delivery",
    address: "456 Park Ave",
    phone: "+880 1612-789012",
    paymentMethod: "Online Payment",
  },
  {
    id: "ORD-5619",
    customer: "David Wilson",
    items: "1× Vegetarian, 1× Garlic Breadsticks, 1× Iced Tea",
    status: "delivered",
    time: "45 min ago",
    total: 2177.20,
    type: "pickup",
    phone: "+880 1512-345678",
    paymentMethod: "Cash",
  },
];

// Sample delivery riders
const riders = [
  { id: 1, name: "Ahmed K.", status: "available", contact: "+880 1712-111222" },
  { id: 2, name: "Rahul M.", status: "delivering", contact: "+880 1812-333444" },
  { id: 3, name: "Farhan J.", status: "available", contact: "+880 1912-555666" },
  { id: 4, name: "Sajid L.", status: "off-duty", contact: "+880 1612-777888" },
];

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !selectedStatus || order.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "preparing":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "ready":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "delivered":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "delivery":
        return <Truck className="h-4 w-4" />;
      case "pickup":
        return <Package className="h-4 w-4" />;
      case "dine-in":
        return <Users className="h-4 w-4" />;
      default:
        return <ShoppingCart className="h-4 w-4" />;
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    toast({
      title: "Order Status Updated",
      description: `Order ${orderId} status changed to ${newStatus}`,
    });
  };

  const assignRider = (orderId: string, riderName: string) => {
    toast({
      title: "Rider Assigned",
      description: `${riderName} has been assigned to order ${orderId}`,
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Order Management</h1>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="search"
              placeholder="Search orders..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant={selectedStatus === null ? "default" : "outline"}
              onClick={() => setSelectedStatus(null)}
            >
              All
            </Button>
            <Button 
              variant={selectedStatus === "pending" ? "default" : "outline"}
              onClick={() => setSelectedStatus("pending")}
              className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300"
            >
              Pending
            </Button>
            <Button 
              variant={selectedStatus === "preparing" ? "default" : "outline"}
              onClick={() => setSelectedStatus("preparing")}
              className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300"
            >
              Preparing
            </Button>
            <Button 
              variant={selectedStatus === "ready" ? "default" : "outline"}
              onClick={() => setSelectedStatus("ready")}
              className="bg-green-100 text-green-800 hover:bg-green-200 border-green-300"
            >
              Ready
            </Button>
            <Button 
              variant={selectedStatus === "delivered" ? "default" : "outline"}
              onClick={() => setSelectedStatus("delivered")}
              className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300"
            >
              Delivered
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="delivery">Delivery</TabsTrigger>
            <TabsTrigger value="pickup">Pickup</TabsTrigger>
            <TabsTrigger value="dine-in">Dine-in</TabsTrigger>
          </TabsList>
          
          {/* All Orders Tab */}
          <TabsContent value="all" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>
                            <div>
                              <p>{order.customer}</p>
                              <p className="text-xs text-gray-500">{order.phone}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(order.type)}
                              <span className="capitalize">{order.type}</span>
                            </div>
                          </TableCell>
                          <TableCell>{order.items}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`${getStatusColor(order.status)} capitalize`}
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{order.time}</TableCell>
                          <TableCell className="text-right">৳{order.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => updateOrderStatus(order.id, "ready")}>
                                Update
                              </Button>
                              <Button size="sm">Details</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Delivery Tab */}
          <TabsContent value="delivery" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Delivery Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Rider</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders
                          .filter(order => order.type === "delivery")
                          .map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">{order.id}</TableCell>
                              <TableCell>{order.customer}</TableCell>
                              <TableCell>{order.address}</TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={`${getStatusColor(order.status)} capitalize`}
                                >
                                  {order.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <select 
                                  className="border rounded p-1 text-sm"
                                  onChange={(e) => assignRider(order.id, e.target.value)}
                                  defaultValue=""
                                >
                                  <option value="" disabled>Assign rider</option>
                                  {riders
                                    .filter(rider => rider.status === "available")
                                    .map(rider => (
                                      <option key={rider.id} value={rider.name}>
                                        {rider.name}
                                      </option>
                                    ))
                                  }
                                </select>
                              </TableCell>
                            </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Available Riders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {riders.map(rider => (
                      <div key={rider.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{rider.name}</p>
                          <p className="text-xs text-gray-500">{rider.contact}</p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={
                            rider.status === "available" 
                              ? "bg-green-100 text-green-800"
                              : rider.status === "delivering"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {rider.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Other tabs would have similar structures */}
          <TabsContent value="pickup">
            <Card>
              <CardHeader>
                <CardTitle>Pickup Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Pickup Time</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders
                      .filter(order => order.type === "pickup")
                      .map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.customer}</TableCell>
                          <TableCell>{order.items}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`${getStatusColor(order.status)} capitalize`}
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {order.time}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" onClick={() => updateOrderStatus(order.id, "ready")}>
                              Ready for Pickup
                            </Button>
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="dine-in">
            <Card>
              <CardHeader>
                <CardTitle>Dine-in Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Table</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders
                      .filter(order => order.type === "dine-in")
                      .map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.tableNumber}</TableCell>
                          <TableCell>{order.items}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`${getStatusColor(order.status)} capitalize`}
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{order.time}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">Print Bill</Button>
                              <Button size="sm">Complete</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Orders;
