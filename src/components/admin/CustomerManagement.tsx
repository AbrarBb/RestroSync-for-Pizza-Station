
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MoreHorizontal, Plus, Search, UserPlus, Mail, UserCircle, Phone, RefreshCw } from "lucide-react";
import { ProfileData } from "@/integrations/supabase/database.types";

const CustomerManagement = () => {
  const [customers, setCustomers] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddCustomerDialog, setShowAddCustomerDialog] = useState<boolean>(false);
  const [newCustomerData, setNewCustomerData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    address: ''
  });
  
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setCustomers(data || []);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      toast({
        title: 'Error loading customers',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCustomers();
    
    // Set up real-time subscription for profile changes
    const channel = supabase
      .channel('profiles_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, () => {
        fetchCustomers();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const handleAddCustomer = async () => {
    try {
      // Validate form
      if (!newCustomerData.email || !newCustomerData.password || !newCustomerData.full_name) {
        toast({
          title: 'Missing information',
          description: 'Please fill all required fields',
          variant: 'destructive'
        });
        return;
      }
      
      setLoading(true);
      
      // 1. Create the user in auth
      const { data: userData, error: authError } = await supabase.auth.signUp({
        email: newCustomerData.email,
        password: newCustomerData.password,
        options: {
          data: {
            full_name: newCustomerData.full_name,
            role: 'customer'
          }
        }
      });
      
      if (authError) throw authError;
      
      if (!userData.user) {
        throw new Error("Failed to create user");
      }
      
      // 2. Create the profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: crypto.randomUUID(),
          user_id: userData.user.id,
          full_name: newCustomerData.full_name,
          phone: newCustomerData.phone,
          address: newCustomerData.address,
          created_at: new Date().toISOString()
        }]);
      
      if (profileError) throw profileError;
      
      toast({
        title: 'Customer added',
        description: 'New customer has been created successfully'
      });
      
      // Reset form and close dialog
      setNewCustomerData({
        email: '',
        password: '',
        full_name: '',
        phone: '',
        address: ''
      });
      
      setShowAddCustomerDialog(false);
      fetchCustomers();
      
    } catch (error: any) {
      console.error('Error adding customer:', error);
      toast({
        title: 'Failed to add customer',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const filteredCustomers = customers.filter(customer => 
    customer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>Manage your restaurant customers</CardDescription>
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  className="pl-8 w-[200px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Button onClick={() => setShowAddCustomerDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[60px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        {searchQuery ? 'No customers match your search' : 'No customers found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {customer.avatar_url ? (
                              <img 
                                src={customer.avatar_url} 
                                alt={customer.full_name} 
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              <UserCircle className="h-8 w-8 text-muted-foreground" />
                            )}
                            <span className="font-medium">{customer.full_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{customer.phone || 'N/A'}</TableCell>
                        <TableCell>{customer.address || 'N/A'}</TableCell>
                        <TableCell>{new Date(customer.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <UserCircle className="h-4 w-4 mr-2" /> View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="h-4 w-4 mr-2" /> Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Phone className="h-4 w-4 mr-2" /> Call Customer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredCustomers.length} of {customers.length} customers
          </div>
          <Button variant="outline" onClick={fetchCustomers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardFooter>
      </Card>
      
      {/* Add Customer Dialog */}
      <Dialog open={showAddCustomerDialog} onOpenChange={setShowAddCustomerDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input 
                id="full_name"
                value={newCustomerData.full_name}
                onChange={(e) => setNewCustomerData({ ...newCustomerData, full_name: e.target.value })}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input 
                id="email"
                type="email"
                value={newCustomerData.email}
                onChange={(e) => setNewCustomerData({ ...newCustomerData, email: e.target.value })}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="password">Password *</Label>
              <Input 
                id="password"
                type="password"
                value={newCustomerData.password}
                onChange={(e) => setNewCustomerData({ ...newCustomerData, password: e.target.value })}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone"
                value={newCustomerData.phone}
                onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address"
                value={newCustomerData.address}
                onChange={(e) => setNewCustomerData({ ...newCustomerData, address: e.target.value })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCustomerDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCustomer} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerManagement;
