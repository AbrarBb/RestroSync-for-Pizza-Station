
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
import { Search, User, Users, ShoppingCart, CalendarCheck } from "lucide-react";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  status: "active" | "inactive";
}

const customers: Customer[] = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+880 1712-345678",
    joinDate: "2024-01-15",
    totalOrders: 12,
    totalSpent: 12500.50,
    lastOrder: "2025-05-02",
    status: "active"
  },
  {
    id: 2,
    name: "Emily Johnson",
    email: "emily.j@example.com",
    phone: "+880 1812-567890",
    joinDate: "2024-02-20",
    totalOrders: 8,
    totalSpent: 8750.25,
    lastOrder: "2025-04-28",
    status: "active"
  },
  {
    id: 3,
    name: "Michael Brown",
    email: "michael.b@example.com",
    phone: "+880 1912-123456",
    joinDate: "2024-01-05",
    totalOrders: 5,
    totalSpent: 4320.75,
    lastOrder: "2025-04-15",
    status: "inactive"
  },
  {
    id: 4,
    name: "Sarah Davis",
    email: "sarah.d@example.com",
    phone: "+880 1612-789012",
    joinDate: "2024-03-10",
    totalOrders: 15,
    totalSpent: 15850.00,
    lastOrder: "2025-05-05",
    status: "active"
  },
  {
    id: 5,
    name: "David Wilson",
    email: "david.w@example.com",
    phone: "+880 1512-345678",
    joinDate: "2024-02-28",
    totalOrders: 3,
    totalSpent: 2450.50,
    lastOrder: "2025-03-20",
    status: "inactive"
  },
  {
    id: 6,
    name: "Jessica Thompson",
    email: "jessica.t@example.com",
    phone: "+880 1712-901234",
    joinDate: "2024-01-22",
    totalOrders: 10,
    totalSpent: 9875.25,
    lastOrder: "2025-05-01",
    status: "active"
  }
];

// Sample order history data
const orderHistory = [
  {
    id: "ORD-5623",
    date: "2025-05-02",
    items: "1× Margherita, 1× Garlic Breadsticks",
    total: 1655.24,
    status: "delivered"
  },
  {
    id: "ORD-5520",
    date: "2025-04-18",
    items: "2× Pepperoni, 1× Caesar Salad",
    total: 3311.36,
    status: "delivered"
  },
  {
    id: "ORD-5412",
    date: "2025-04-05",
    items: "1× Vegetarian, 2× Soda",
    total: 1828.27,
    status: "delivered"
  },
  {
    id: "ORD-5389",
    date: "2025-03-22",
    items: "1× Margherita, 1× Pepperoni",
    total: 2440.04,
    status: "delivered"
  },
];

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    
    const matchesStatus = !statusFilter || customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const viewCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const sendPromotion = (customerId: number) => {
    toast({
      title: "Promotion Sent",
      description: `Promotional offer sent to customer #${customerId}`,
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Customer Management</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Users className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">Total Customers</h3>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="bg-green-100 p-2 rounded-full">
                  <ShoppingCart className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
                <p className="text-2xl font-bold">
                  {customers.reduce((sum, customer) => sum + customer.totalOrders, 0)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="bg-blue-100 p-2 rounded-full">
                  <CalendarCheck className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
                <p className="text-2xl font-bold">
                  ৳{customers.reduce((sum, customer) => sum + customer.totalSpent, 0).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Management Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
                <CardTitle>Customers</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="search"
                      placeholder="Search customers..."
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
                    variant={statusFilter === "active" ? "default" : "outline"}
                    onClick={() => setStatusFilter("active")}
                    size="sm"
                    className="bg-green-100 text-green-800 hover:bg-green-200 border-green-300"
                  >
                    Active
                  </Button>
                  <Button 
                    variant={statusFilter === "inactive" ? "default" : "outline"}
                    onClick={() => setStatusFilter("inactive")}
                    size="sm"
                    className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300"
                  >
                    Inactive
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead className="text-right">Total Spent</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell>
                            <div>
                              <p className="text-xs">{customer.email}</p>
                              <p className="text-xs text-gray-500">{customer.phone}</p>
                            </div>
                          </TableCell>
                          <TableCell>{customer.totalOrders}</TableCell>
                          <TableCell className="text-right">৳{customer.totalSpent.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                customer.status === "active" 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {customer.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => viewCustomerDetails(customer)}
                            >
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

          {/* Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCustomer ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-center flex-col space-y-2">
                    <div className="bg-primary/10 p-4 rounded-full">
                      <User className="h-12 w-12" />
                    </div>
                    <h3 className="font-bold text-xl">{selectedCustomer.name}</h3>
                    <Badge
                      variant="outline"
                      className={
                        selectedCustomer.status === "active" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {selectedCustomer.status}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Contact Information</p>
                    <div className="grid grid-cols-[auto_1fr] gap-2 text-sm">
                      <span className="font-medium">Email:</span>
                      <span>{selectedCustomer.email}</span>
                      <span className="font-medium">Phone:</span>
                      <span>{selectedCustomer.phone}</span>
                      <span className="font-medium">Joined:</span>
                      <span>{selectedCustomer.joinDate}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Order Summary</p>
                    <div className="grid grid-cols-[auto_1fr] gap-2 text-sm">
                      <span className="font-medium">Total Orders:</span>
                      <span>{selectedCustomer.totalOrders}</span>
                      <span className="font-medium">Total Spent:</span>
                      <span>৳{selectedCustomer.totalSpent.toLocaleString()}</span>
                      <span className="font-medium">Last Order:</span>
                      <span>{selectedCustomer.lastOrder}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Recent Orders</p>
                    <div className="space-y-2">
                      {orderHistory.map((order) => (
                        <div key={order.id} className="border rounded p-2 text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">{order.id}</span>
                            <span>{order.date}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{order.items}</p>
                          <div className="flex justify-between mt-2">
                            <span>৳{order.total.toFixed(2)}</span>
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <Button 
                      className="w-full" 
                      onClick={() => sendPromotion(selectedCustomer.id)}
                    >
                      Send Promotion
                    </Button>
                    <Button variant="outline" className="w-full">
                      Edit Customer
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-center p-4">
                  <User className="h-12 w-12 text-gray-300 mb-2" />
                  <h3 className="text-lg font-medium text-gray-600">No Customer Selected</h3>
                  <p className="text-gray-400 mt-1">
                    Select a customer from the list to view their details
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Customers;
