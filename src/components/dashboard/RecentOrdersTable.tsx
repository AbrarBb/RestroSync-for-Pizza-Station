
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
  MapPin
} from "lucide-react";

interface Order {
  id: string;
  customer: string;
  items: string;
  status: "pending" | "preparing" | "ready" | "delivered";
  time: string;
  total: number;
  delivery?: {
    address: string;
    rider?: string;
    method: "delivery" | "pickup" | "dine-in";
  };
}

const orders: Order[] = [
  {
    id: "ORD-5623",
    customer: "John Smith",
    items: "1× Margherita, 1× Garlic Breadsticks",
    status: "preparing",
    time: "10 min ago",
    total: 1655.24,
    delivery: {
      method: "delivery",
      address: "123 Main St, Apt 4B",
      rider: "Ahmed K.",
    },
  },
  {
    id: "ORD-5622",
    customer: "Emily Johnson",
    items: "2× Pepperoni, 1× Caesar Salad",
    status: "pending",
    time: "15 min ago",
    total: 3311.36,
    delivery: {
      method: "pickup",
      address: "Store Pickup",
    },
  },
  {
    id: "ORD-5621",
    customer: "Michael Brown",
    items: "1× Vegetarian, 2× Soda",
    status: "ready",
    time: "25 min ago",
    total: 1828.27,
    delivery: {
      method: "dine-in",
      address: "Table 8",
    },
  },
  {
    id: "ORD-5620",
    customer: "Sarah Davis",
    items: "1× Margherita, 1× Pepperoni",
    status: "delivered",
    time: "35 min ago",
    total: 2440.04,
    delivery: {
      method: "delivery",
      address: "456 Park Ave",
      rider: "Rahul M.",
    },
  },
  {
    id: "ORD-5619",
    customer: "David Wilson",
    items: "1× Vegetarian, 1× Garlic Breadsticks, 1× Iced Tea",
    status: "delivered",
    time: "45 min ago",
    total: 2177.20,
    delivery: {
      method: "pickup",
      address: "Store Pickup",
    },
  },
];

export function RecentOrdersTable() {
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

  const handleViewOrder = (order: Order) => {
    toast({
      title: `Order ${order.id}`,
      description: `Viewing details for ${order.customer}'s order`,
    });
  };

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
                  {order.delivery && getDeliveryMethodIcon(order.delivery.method)}
                  <span className="text-xs">
                    {order.delivery?.method === "delivery" 
                      ? `${order.delivery.address} (${order.delivery.rider})` 
                      : order.delivery?.address}
                  </span>
                </div>
              </TableCell>
              <TableCell>{order.time}</TableCell>
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
