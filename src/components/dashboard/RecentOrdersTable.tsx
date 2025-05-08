
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  Eye,
  Truck, 
  MapPin,
  Loader2 
} from "lucide-react";
import { ordersService, Order } from "@/lib/supabase";

export function RecentOrdersTable() {
  // Fetch recent orders
  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ["recentOrders"],
    queryFn: () => ordersService.getRecentOrders(5),
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
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
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

  const formatOrderTime = (createdAt: string) => {
    const orderDate = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - orderDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const formatOrderItems = (items: any[]) => {
    if (!items || items.length === 0) return "No items";
    
    return items.slice(0, 3).map(item => 
      `${item.quantity || 1}× ${item.name}`
    ).join(', ') + (items.length > 3 ? `, +${items.length - 3} more` : '');
  };

  const handleViewOrder = (order: Order) => {
    toast({
      title: `Order ${order.id}`,
      description: `Viewing details for order placed ${formatOrderTime(order.created_at)}`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        Error loading orders. Please try again later.
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No orders found. New orders will appear here.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Delivery</TableHead>
            <TableHead>Time</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id.substring(0, 8).toUpperCase()}</TableCell>
              <TableCell>{order.customer_name || "Unknown"}</TableCell>
              <TableCell>{formatOrderItems(order.items as any[])}</TableCell>
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
                  {getDeliveryMethodIcon(order.order_type)}
                  <span className="text-xs capitalize">
                    {order.order_type === "delivery" 
                      ? `${order.delivery_address?.substring(0, 15) || "Address"} ${order.delivery_address?.length > 15 ? "..." : ""}` 
                      : order.order_type}
                  </span>
                </div>
              </TableCell>
              <TableCell>{formatOrderTime(order.created_at)}</TableCell>
              <TableCell className="text-right">৳{order.total.toFixed(2)}</TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewOrder(order)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
