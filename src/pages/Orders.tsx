import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  MapPin,
  CreditCard,
  Eye,
  ChevronDown,
  ChevronUp,
  Loader2,
  User,
  Phone,
  AtSign,
  Calendar,
  Bookmark,
  Home,
  LogOut
} from "lucide-react";
import { Order, ordersService, transformOrderItems } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { orderService } from "@/lib/orderService";
import Header from "@/components/layout/Header";
import { Link } from "react-router-dom";

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [orderTypeFilter, setOrderTypeFilter] = useState<string | null>(null);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<keyof Order | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, userRole, signOut } = useAuth();

  const toggleSheet = (order: Order | null) => {
    setSelectedOrder(order);
    setIsSheetOpen(!isSheetOpen);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "preparing":
        return "bg-blue-100 text-blue-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDeliveryMethodIcon = (method: string) => {
    switch (method) {
      case "delivery":
        return <Truck className="h-4 w-4 text-blue-600" />;
      case "pickup":
        return <MapPin className="h-4 w-4 text-green-600" />;
      case "dine-in":
        return <MapPin className="h-4 w-4 text-purple-600" />;
      default:
        return null;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "credit-card":
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      await ordersService.updateStatus(orderId, newStatus);
      toast({
        title: "Order Updated",
        description: `Order status updated to ${newStatus}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSort = (column: keyof Order) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (column: keyof Order) => {
    if (column === sortColumn) {
      return sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    }
    return null;
  };
  
  const processOrders = (data: any[]): Order[] => {
    if (!data) return [];
    
    return data.map(order => ({
      ...order,
      items: transformOrderItems(order.items),
      status: order.status as Order['status'],
      order_type: order.order_type as Order['order_type'],
      payment_status: order.payment_status as Order['payment_status']
    }));
  };

  // Use different query based on user role
  const { data: allOrders = [], isLoading } = useQuery({
    queryKey: ["orders", userRole, user?.id],
    queryFn: async () => {
      if (userRole === "customer" && user) {
        // Customer sees only their orders
        const data = await orderService.getCustomerOrders(user.id);
        return processOrders(data);
      } else {
        // Admin/staff see all orders
        const data = await ordersService.getAll();
        return processOrders(data);
      }
    },
    enabled: !!user && !!userRole,
  });

  const filteredOrders = allOrders
    .filter((order) => {
      const matchesSearch =
        searchTerm === "" ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = !statusFilter || order.status === statusFilter;
      const matchesOrderType = !orderTypeFilter || order.order_type === orderTypeFilter;
      const matchesPaymentStatus = !paymentStatusFilter || order.payment_status === paymentStatusFilter;

      return matchesSearch && matchesStatus && matchesOrderType && matchesPaymentStatus;
    })
    .sort((a, b) => {
      if (!sortColumn) return 0;
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === null || aValue === undefined) return -1;
      if (bValue === null || bValue === undefined) return 1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      } else {
        return 0;
      }
    });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  // Customer view - use regular layout
  if (userRole === "customer") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">My Orders</h1>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/menu">Order Now</Link>
              </Button>
            </div>
          </div>

          {/* Search and Filters for customers */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search orders..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2 flex-wrap w-full md:w-2/3">
              <Button
                variant={statusFilter === null ? "default" : "outline"}
                onClick={() => setStatusFilter(null)}
                size="sm"
              >
                All Statuses
              </Button>
              <Button
                variant={statusFilter === "pending" ? "default" : "outline"}
                onClick={() => setStatusFilter("pending")}
                size="sm"
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === "preparing" ? "default" : "outline"}
                onClick={() => setStatusFilter("preparing")}
                size="sm"
              >
                Preparing
              </Button>
              <Button
                variant={statusFilter === "ready" ? "default" : "outline"}
                onClick={() => setStatusFilter("ready")}
                size="sm"
              >
                Ready
              </Button>
              <Button
                variant={statusFilter === "delivered" ? "default" : "outline"}
                onClick={() => setStatusFilter("delivered")}
                size="sm"
              >
                Delivered
              </Button>
            </div>
          </div>

          {/* Orders Table for customers */}
          <Card>
            <CardHeader>
              <CardTitle>Your Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredOrders.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground mb-4">No orders found.</p>
                  <Button asChild>
                    <Link to="/menu">Place Your First Order</Link>
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead onClick={() => handleSort("id")} className="cursor-pointer">
                          Order ID {getSortIcon("id")}
                        </TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead onClick={() => handleSort("status")} className="cursor-pointer">
                          Status {getSortIcon("status")}
                        </TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead onClick={() => handleSort("created_at")} className="cursor-pointer">
                          Order Date {getSortIcon("created_at")}
                        </TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id.substring(0, 8).toUpperCase()}</TableCell>
                          <TableCell>
                            {order.items.slice(0, 3).map((item) => (
                              <div key={item.id} className="text-sm">
                                {item.quantity}x {item.name}
                              </div>
                            ))}
                            {order.items.length > 3 && <div className="text-xs text-gray-500">+{order.items.length - 3} more</div>}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`${getStatusColor(order.status)} capitalize`}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getDeliveryMethodIcon(order.order_type)}
                              <span className="text-xs capitalize">{order.order_type}</span>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(order.created_at)}</TableCell>
                          <TableCell className="text-right">৳{order.total.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" onClick={() => toggleSheet(order)}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        {/* Order Details Sheet - same for both customer and admin */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>Order Details</SheetTitle>
              <SheetDescription>
                Details for order {selectedOrder?.id.substring(0, 8).toUpperCase()}
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4">
              {/* ... keep existing code (order details content) */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedOrder?.customer_name ? (
                    <>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{selectedOrder.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AtSign className="h-4 w-4" />
                        <span>{selectedOrder.customer_email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{selectedOrder.customer_phone}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No customer information available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Bookmark className="h-4 w-4" />
                    <span>Order ID: {selectedOrder?.id.substring(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Order Date: {formatDate(selectedOrder?.created_at || "")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getDeliveryMethodIcon(selectedOrder?.order_type || "")}
                    <span className="capitalize">
                      {selectedOrder?.order_type}
                      {selectedOrder?.order_type === "delivery" &&
                        `: ${selectedOrder?.delivery_address?.substring(0, 20)}...`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Payment Status: {selectedOrder?.payment_status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Current Status:</span>
                    <Badge variant="outline" className={`${getStatusColor(selectedOrder?.status || "")} capitalize`}>
                      {selectedOrder?.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder?.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell className="text-right">৳{(item.price * item.quantity).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">৳{selectedOrder?.total.toFixed(2)}</div>
                </CardContent>
              </Card>

              {/* Only show status update for admin/staff */}
              {userRole !== "customer" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Update Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue={selectedOrder?.status || "pending"} className="w-full">
                      <TabsList>
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                        <TabsTrigger value="preparing">Preparing</TabsTrigger>
                        <TabsTrigger value="ready">Ready</TabsTrigger>
                        <TabsTrigger value="delivered">Delivered</TabsTrigger>
                        <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                      </TabsList>
                      <TabsContent value="pending">
                        <Button
                          variant="outline"
                          className="w-full mt-2"
                          onClick={() => handleStatusUpdate(selectedOrder?.id || "", "pending")}
                        >
                          Mark as Pending
                        </Button>
                      </TabsContent>
                      <TabsContent value="preparing">
                        <Button
                          variant="outline"
                          className="w-full mt-2"
                          onClick={() => handleStatusUpdate(selectedOrder?.id || "", "preparing")}
                        >
                          Mark as Preparing
                        </Button>
                      </TabsContent>
                      <TabsContent value="ready">
                        <Button
                          variant="outline"
                          className="w-full mt-2"
                          onClick={() => handleStatusUpdate(selectedOrder?.id || "", "ready")}
                        >
                          Mark as Ready
                        </Button>
                      </TabsContent>
                      <TabsContent value="delivered">
                        <Button
                          variant="outline"
                          className="w-full mt-2"
                          onClick={() => handleStatusUpdate(selectedOrder?.id || "", "delivered")}
                        >
                          Mark as Delivered
                        </Button>
                      </TabsContent>
                      <TabsContent value="cancelled">
                        <Button
                          variant="outline"
                          className="w-full mt-2"
                          onClick={() => handleStatusUpdate(selectedOrder?.id || "", "cancelled")}
                        >
                          Mark as Cancelled
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // Admin/Staff view - use DashboardLayout
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Orders</h1>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="search"
              placeholder="Search orders..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 flex-wrap w-full md:w-2/3">
            <Button
              variant={statusFilter === null ? "default" : "outline"}
              onClick={() => setStatusFilter(null)}
              size="sm"
            >
              All Statuses
            </Button>
            <Button
              variant={statusFilter === "pending" ? "default" : "outline"}
              onClick={() => setStatusFilter("pending")}
              size="sm"
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === "preparing" ? "default" : "outline"}
              onClick={() => setStatusFilter("preparing")}
              size="sm"
            >
              Preparing
            </Button>
            <Button
              variant={statusFilter === "ready" ? "default" : "outline"}
              onClick={() => setStatusFilter("ready")}
              size="sm"
            >
              Ready
            </Button>
            <Button
              variant={statusFilter === "delivered" ? "default" : "outline"}
              onClick={() => setStatusFilter("delivered")}
              size="sm"
            >
              Delivered
            </Button>
            <Button
              variant={statusFilter === "cancelled" ? "default" : "outline"}
              onClick={() => setStatusFilter("cancelled")}
              size="sm"
            >
              Cancelled
            </Button>

            <Button
              variant={orderTypeFilter === null ? "default" : "outline"}
              onClick={() => setOrderTypeFilter(null)}
              size="sm"
            >
              All Types
            </Button>
            <Button
              variant={orderTypeFilter === "delivery" ? "default" : "outline"}
              onClick={() => setOrderTypeFilter("delivery")}
              size="sm"
            >
              Delivery
            </Button>
            <Button
              variant={orderTypeFilter === "pickup" ? "default" : "outline"}
              onClick={() => setOrderTypeFilter("pickup")}
              size="sm"
            >
              Pickup
            </Button>
            <Button
              variant={orderTypeFilter === "dine-in" ? "default" : "outline"}
              onClick={() => setOrderTypeFilter("dine-in")}
              size="sm"
            >
              Dine-in
            </Button>

            <Button
              variant={paymentStatusFilter === null ? "default" : "outline"}
              onClick={() => setPaymentStatusFilter(null)}
              size="sm"
            >
              All Payments
            </Button>
            <Button
              variant={paymentStatusFilter === "paid" ? "default" : "outline"}
              onClick={() => setPaymentStatusFilter("paid")}
              size="sm"
            >
              Paid
            </Button>
            <Button
              variant={paymentStatusFilter === "pending" ? "default" : "outline"}
              onClick={() => setPaymentStatusFilter("pending")}
              size="sm"
            >
              Pending Payment
            </Button>
          </div>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
            <CardTitle>Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => handleSort("id")} className="cursor-pointer">
                      Order ID {getSortIcon("id")}
                    </TableHead>
                    <TableHead onClick={() => handleSort("customer_name")} className="cursor-pointer">
                      Customer {getSortIcon("customer_name")}
                    </TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead onClick={() => handleSort("status")} className="cursor-pointer">
                      Status {getSortIcon("status")}
                    </TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead onClick={() => handleSort("payment_status")} className="cursor-pointer">
                      Payment {getSortIcon("payment_status")}
                    </TableHead>
                    <TableHead onClick={() => handleSort("created_at")} className="cursor-pointer">
                      Order Date {getSortIcon("created_at")}
                    </TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id.substring(0, 8).toUpperCase()}</TableCell>
                      <TableCell>{order.customer_name || "Guest"}</TableCell>
                      <TableCell>
                        {order.items.slice(0, 3).map((item) => (
                          <div key={item.id} className="text-sm">
                            {item.quantity}x {item.name}
                          </div>
                        ))}
                        {order.items.length > 3 && <div className="text-xs text-gray-500">+{order.items.length - 3} more</div>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${getStatusColor(order.status)} capitalize`}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getDeliveryMethodIcon(order.order_type)}
                          <span className="text-xs capitalize">{order.order_type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.payment_method && getPaymentMethodIcon(order.payment_method)}
                        <Badge variant="secondary" className="ml-1">{order.payment_status}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell className="text-right">৳{order.total.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => toggleSheet(order)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
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

export default Orders;
