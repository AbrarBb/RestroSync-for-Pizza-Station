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
import { Search, Plus, Users, Calendar, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface StaffMember {
  id: number;
  name: string;
  position: string;
  phone: string;
  email: string;
  status: "active" | "on-leave" | "off-duty";
  joinDate: string;
  salary: number;
}

const staffMembers: StaffMember[] = [
  {
    id: 1,
    name: "Anik Rahman",
    position: "Head Chef",
    phone: "+880 1712-345678",
    email: "anik@pizzastation.com",
    status: "active",
    joinDate: "2023-05-15",
    salary: 75000
  },
  {
    id: 2,
    name: "Priya Sharma",
    position: "Cashier",
    phone: "+880 1812-567890",
    email: "priya@pizzastation.com",
    status: "active",
    joinDate: "2023-08-20",
    salary: 35000
  },
  {
    id: 3,
    name: "Mohammad Ali",
    position: "Waiter",
    phone: "+880 1912-123456",
    email: "ali@pizzastation.com",
    status: "active",
    joinDate: "2024-01-10",
    salary: 28000
  },
  {
    id: 4,
    name: "Fatima Khan",
    position: "Sous Chef",
    phone: "+880 1612-789012",
    email: "fatima@pizzastation.com",
    status: "on-leave",
    joinDate: "2023-11-05",
    salary: 45000
  },
  {
    id: 5,
    name: "Rahul Patel",
    position: "Delivery Rider",
    phone: "+880 1512-345678",
    email: "rahul@pizzastation.com",
    status: "off-duty",
    joinDate: "2024-02-15",
    salary: 30000
  },
  {
    id: 6,
    name: "Nusrat Jahan",
    position: "Manager",
    phone: "+880 1412-901234",
    email: "nusrat@pizzastation.com",
    status: "active",
    joinDate: "2023-04-01",
    salary: 85000
  }
];

const Staff = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { isAdmin } = useAuth();
  
  // Redirect or show error if not admin - this is an extra layer of protection
  // since we already use ProtectedRoute in App.tsx
  if (!isAdmin()) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Admin access required</h3>
                <p className="text-sm text-red-700 mt-2">
                  Only administrators can access the staff management page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  const filteredStaff = staffMembers.filter((staff) => {
    const matchesSearch = 
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || staff.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "on-leave":
        return "bg-yellow-100 text-yellow-800";
      case "off-duty":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Staff Member Added",
      description: "New staff member has been added successfully",
    });
    setDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Staff Management</h1>
        
        {/* Admin notice */}
        <div className="bg-purple-50 border border-purple-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Shield className="h-5 w-5 text-purple-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-purple-800">Admin Access</h3>
              <p className="text-sm text-purple-700 mt-2">
                You're viewing this page as an administrator. Only admins can manage staff members.
              </p>
            </div>
          </div>
        </div>

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
                <h3 className="text-sm font-medium text-gray-500">Total Staff</h3>
                <p className="text-2xl font-bold">{staffMembers.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="bg-green-100 p-2 rounded-full">
                  <Users className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">Active Staff</h3>
                <p className="text-2xl font-bold">
                  {staffMembers.filter(staff => staff.status === "active").length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">Monthly Payroll</h3>
                <p className="text-2xl font-bold">
                  ৳{staffMembers.reduce((sum, staff) => sum + staff.salary, 0).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Staff Table */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
            <CardTitle>Staff Members</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search staff..."
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Staff
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Staff Member</DialogTitle>
                    <DialogDescription>
                      Fill in the details to add a new staff member.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddStaff}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label className="text-right">Name</label>
                        <Input className="col-span-3" required />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label className="text-right">Position</label>
                        <Input className="col-span-3" required />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label className="text-right">Phone</label>
                        <Input className="col-span-3" required />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label className="text-right">Email</label>
                        <Input type="email" className="col-span-3" required />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label className="text-right">Salary</label>
                        <Input type="number" className="col-span-3" required />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Add Staff Member</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
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
                variant={statusFilter === "on-leave" ? "default" : "outline"}
                onClick={() => setStatusFilter("on-leave")}
                size="sm"
                className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300"
              >
                On Leave
              </Button>
              <Button 
                variant={statusFilter === "off-duty" ? "default" : "outline"}
                onClick={() => setStatusFilter("off-duty")}
                size="sm"
                className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300"
              >
                Off Duty
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead className="text-right">Salary</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium">{staff.name}</TableCell>
                      <TableCell>{staff.position}</TableCell>
                      <TableCell>
                        <div>
                          <p>{staff.phone}</p>
                          <p className="text-xs text-gray-500">{staff.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(staff.status)} capitalize`}
                        >
                          {staff.status.replace("-", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>{staff.joinDate}</TableCell>
                      <TableCell className="text-right">৳{staff.salary.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">Schedule</Button>
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

export default Staff;
