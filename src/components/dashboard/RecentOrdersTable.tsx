
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

interface Order {
  id: string;
  customer: string;
  items: string;
  status: "pending" | "preparing" | "ready" | "delivered";
  time: string;
  total: number;
}

const orders: Order[] = [
  {
    id: "ORD-5623",
    customer: "John Smith",
    items: "1× Margherita, 1× Garlic Breadsticks",
    status: "preparing",
    time: "10 min ago",
    total: 18.98,
  },
  {
    id: "ORD-5622",
    customer: "Emily Johnson",
    items: "2× Pepperoni, 1× Caesar Salad",
    status: "pending",
    time: "15 min ago",
    total: 37.97,
  },
  {
    id: "ORD-5621",
    customer: "Michael Brown",
    items: "1× Vegetarian, 2× Soda",
    status: "ready",
    time: "25 min ago",
    total: 20.97,
  },
  {
    id: "ORD-5620",
    customer: "Sarah Davis",
    items: "1× Margherita, 1× Pepperoni",
    status: "delivered",
    time: "35 min ago",
    total: 27.98,
  },
  {
    id: "ORD-5619",
    customer: "David Wilson",
    items: "1× Vegetarian, 1× Garlic Breadsticks, 1× Iced Tea",
    status: "delivered",
    time: "45 min ago",
    total: 24.97,
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

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Status</TableHead>
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
              <TableCell>{order.time}</TableCell>
              <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm">View</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
