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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Search, Truck, MapPin, User, Phone, Clock, Plus } from "lucide-react";

interface DeliveryRider {
  id: number;
  name: string;
  phone: string;
  status: "available" | "delivering" | "off-duty";
  activeDeliveries: number;
  completedToday: number;
  rating: number;
  joinDate: string;
}

interface DeliveryOrder {
  id: string;
  customer: string;
  address: string;
  phone: string;
  items: string;
  status: "pending" | "assigned" | "picked" | "delivered";
  orderTime: string;
  assignedRider?: number;
  total: number;
  estimatedDelivery?: string;
}

// Sample riders data
const riders: DeliveryRider[] = [
  {
    id: 1,
    name: "Ahmed Khan",
    phone: "+880 1712-111222",
    status: "available",
    activeDeliveries: 0,
    completedToday: 5,
    rating: 4.8,
    joinDate: "2024-02-10"
  },
  {
    id: 2,
    name: "Rahul Mitra",
    phone: "+880 1812-333444",
    status: "delivering",
    activeDeliveries: 2,
    completedToday: 3,
    rating: 4.5,
    joinDate: "2023-11-15"
  },
  {
    id: 3,
    name: "Farhan Jamal",
    phone: "+880 1912-555666",
    status: "available",
    activeDeliveries: 0,
    completedToday: 7,
    rating: 4.9,
    joinDate: "2023-08-22"
  },
  {
    id: 4,
    name: "Sajid Laskar",
    phone: "+880 1612-777888",
    status: "off-duty",
    activeDeliveries: 0,
    completedToday: 0,
    rating: 4.6,
    joinDate: "2024-01-05"
  },
  {
    id: 5,
    name: "Karim Uddin",
    phone: "+880 1512-999000",
    status: "delivering",
    activeDeliveries: 1,
    completedToday: 4,
    rating: 4.7,
    joinDate: "2023-10-10"
  }
];

// Sample delivery orders
const deliveryOrders: DeliveryOrder[] = [
  {
    id: "ORD-5623",
    customer: "John Smith",
    address: "123 Main St, Apt 4B, Gulshan",
    phone: "+880 1712-345678",
    items: "1× Margherita, 1× Garlic Breadsticks",
    status: "assigned",
    orderTime: "10 min ago",
    assignedRider: 2,
    total: 1655.24,
    estimatedDelivery: "20-30 min"
  },
  {
    id: "ORD-5622",
    customer: "Emily Johnson",
    address: "56 Park Avenue, Banani",
    phone: "+880 1812-567890",
    items: "2× Pepperoni, 1× Caesar Salad",
    status: "pending",
    orderTime: "15 min ago",
    total: 3311.36
  },
  {
    id: "ORD-5620",
    customer: "Sarah Davis",
    address: "789 Lake View, Dhanmondi",
    phone: "+880 1612-789012",
    items: "1× Margherita, 1× Pepperoni",
    status: "picked",
    orderTime: "25 min ago",
    assignedRider: 5,
    total: 2440.04,
    estimatedDelivery: "10-15 min"
  },
  {
    id: "ORD-5618",
    customer: "Michael Rahman",
    address: "45 Green Road, Farmgate",
    phone: "+880 1912-234567",
    items: "1× BBQ Chicken Pizza, 2× Soda",
    status: "delivered",
    orderTime: "50 min ago",
    assignedRider: 3,
    total: 1698.20
  },
  {
    id: "ORD-5617",
    customer: "Nadia Khan",
    address: "123 New Market, Dhaka",
    phone: "+880 1512-345678",
    items: "1× Vegetarian, 1× Garlic Breadsticks",
    status: "delivered",
    orderTime: "1 hour ago",
    assignedRider: 1,
    total: 1916.46
  }
];

const DeliveryManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const filteredOrders = deliveryOrders.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "picked":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "available":
        return "bg-green-100 text-green-800";
      case "delivering":
        return "bg-blue-100 text-blue-800";
      case "off-duty":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const assignRider = (orderId: string, riderId: number) => {
    const rider = riders.find(r => r.id === riderId);
    const order = deliveryOrders.find(o => o.id === orderId);
    
    if (rider && order) {
      toast({
        title: "Rider Assigned",
        description: `${rider.name} has been assigned to order ${orderId}`,
      });
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    toast({
      title: "Order Status Updated",
      description: `Order ${orderId} status changed to ${newStatus}`,
    });
  };

  const getRider = (riderId?: number) => {
    return riderId ? riders.find(rider => rider.id === riderId) : null;
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Delivery Management</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Truck className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">Active Deliveries</h3>
                <p className="text-2xl font-bold">
                  {deliveryOrders.filter(order => order.status !== "delivered").length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="bg-green-100 p-2 rounded-full">
                  <User className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">Available Riders</h3>
                <p className="text-2xl font-bold">
                  {riders.filter(rider => rider.status === "available").length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Clock className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">Completed Today</h3>
                <p className="text-2xl font-bold">
                  {deliveryOrders.filter(order => order.status === "delivered").length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Delivery Management Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Delivery Orders */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
                <CardTitle>Delivery Orders</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="search"
                      placeholder="Search orders..."
                      className="pl-10 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-wrap gap-2">
                  <Button 
                    variant={statusFilter === null ? "default" : "outline"}
                    onClick={() => setStatusFilter(null)}
                    size="sm"
                  >
                    All
                  </Button>
                  <Button 
                    variant={statusFilter === "pending" ? "default" : "outline"}
                    onClick={() => setStatusFilter("pending")}
                    size="sm"
                    className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300"
                  >
                    Pending
                  </Button>
                  <Button 
                    variant={statusFilter === "assigned" ? "default" : "outline"}
                    onClick={() => setStatusFilter("assigned")}
                    size="sm"
                    className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300"
                  >
                    Assigned
                  </Button>
                  <Button 
                    variant={statusFilter === "picked" ? "default" : "outline"}
                    onClick={() => setStatusFilter("picked")}
                    size="sm"
                    className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-300"
                  >
                    Picked Up
                  </Button>
                  <Button 
                    variant={statusFilter === "delivered" ? "default" : "outline"}
                    onClick={() => setStatusFilter("delivered")}
                    size="sm"
                    className="bg-green-100 text-green-800 hover:bg-green-200 border-green-300"
                  >
                    Delivered
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Rider</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => {
                        const rider = getRider(order.assignedRider);
                        
                        return (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.id}</TableCell>
                            <TableCell>
                              <div>
                                <p>{order.customer}</p>
                                <div className="flex items-center text-xs text-gray-500 gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate max-w-[150px]">
                                    {order.address}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`${getStatusColor(order.status)} capitalize`}
                              >
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {order.status === "pending" ? (
                                <select 
                                  className="border rounded p-1 text-sm"
                                  onChange={(e) => assignRider(order.id, Number(e.target.value))}
                                  defaultValue=""
                                >
                                  <option value="" disabled>Assign rider</option>
                                  {riders
                                    .filter(rider => rider.status === "available")
                                    .map(rider => (
                                      <option key={rider.id} value={rider.id}>
                                        {rider.name}
                                      </option>
                                    ))
                                  }
                                </select>
                              ) : rider ? (
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3 text-gray-500" />
                                  <span>{rider.name}</span>
                                </div>
                              ) : "Not assigned"}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{order.orderTime}</span>
                                {order.estimatedDelivery && (
                                  <span className="text-xs text-gray-500">
                                    Est. {order.estimatedDelivery}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {order.status === "pending" && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => updateOrderStatus(order.id, "assigned")}
                                  disabled={!order.assignedRider}
                                >
                                  Assign
                                </Button>
                              )}
                              {order.status === "assigned" && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => updateOrderStatus(order.id, "picked")}
                                >
                                  Mark Picked
                                </Button>
                              )}
                              {order.status === "picked" && (
                                <Button 
                                  size="sm"
                                  onClick={() => updateOrderStatus(order.id, "delivered")}
                                >
                                  Complete
                                </Button>
                              )}
                              {order.status === "delivered" && (
                                <Button 
                                  size="sm"
                                  variant="outline"
                                >
                                  View
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Riders */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Delivery Riders</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Rider
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Rider</DialogTitle>
                    <DialogDescription>
                      Enter the details of the new delivery rider.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Rider Name</label>
                        <Input placeholder="Full name" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Phone Number</label>
                        <Input type="tel" placeholder="+880 1XXX-XXXXXX" required />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={() => toast({
                        title: "Rider Added",
                        description: "New delivery rider has been added successfully.",
                      })}>
                        Add Rider
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riders.map((rider) => (
                  <Card key={rider.id} className="shadow-none border">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{rider.name}</h3>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <Phone className="h-3 w-3" />
                            <span>{rider.phone}</span>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(rider.status)} capitalize`}
                        >
                          {rider.status.replace("-", " ")}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mt-4 text-center text-sm">
                        <div>
                          <p className="text-gray-500">Active</p>
                          <p className="font-medium">{rider.activeDeliveries}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Today</p>
                          <p className="font-medium">{rider.completedToday}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Rating</p>
                          <p className="font-medium">{rider.rating}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className={
                            rider.status !== "off-duty" ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" : ""
                          }
                        >
                          {rider.status !== "off-duty" ? "Set Off-duty" : "Set Available"}
                        </Button>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DeliveryManagement;
