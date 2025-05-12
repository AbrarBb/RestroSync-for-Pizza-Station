
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
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
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
import { Reservation } from "@/integrations/supabase/database.types";
import { Loader2, MoreHorizontal, Search, Check, X, Calendar, RefreshCw, Clock, Users } from "lucide-react";
import { format } from 'date-fns';

const ReservationManagement = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const fetchReservations = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('reservation_date', { ascending: true });
        
      if (error) {
        throw error;
      }
      
      // Cast the data to ensure status is properly typed
      const typedData = data?.map(reservation => ({
        ...reservation,
        status: reservation.status as Reservation['status']
      })) || [];
      
      setReservations(typedData);
    } catch (error: any) {
      console.error('Error fetching reservations:', error);
      toast({
        title: 'Error loading reservations',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchReservations();
    
    // Set up real-time subscription for reservation changes
    const channel = supabase
      .channel('reservations_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reservations'
      }, () => {
        fetchReservations();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const updateReservationStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('reservations')
        .update({ status })
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: `Reservation ${status}`,
        description: `The reservation has been ${status}.`
      });
      
      await fetchReservations();
    } catch (error: any) {
      console.error(`Error ${status} reservation:`, error);
      toast({
        title: `Failed to ${status} reservation`,
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const formatReservationDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "PPP p"); // Format: "Apr 29, 2021, 5:30 PM"
  };
  
  const filteredReservations = reservations.filter(reservation => 
    reservation.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reservation.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reservation.customer_phone.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Reservation Management</CardTitle>
              <CardDescription>View and manage restaurant reservations</CardDescription>
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reservations..."
                  className="pl-8 w-[200px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Button variant="outline" onClick={fetchReservations}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
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
                    <TableHead>Customer</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Guests</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReservations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">
                        {searchQuery ? 'No reservations match your search' : 'No reservations found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReservations.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell className="font-medium">{reservation.customer_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            {formatReservationDate(reservation.reservation_date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                            {reservation.guest_count}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">{reservation.customer_email}</div>
                            <div className="text-sm text-muted-foreground">{reservation.customer_phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {reservation.status === 'pending' ? (
                            <div className="flex gap-1">
                              <Button 
                                size="icon" 
                                variant="outline" 
                                className="h-8 w-8"
                                onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                              >
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="outline" 
                                className="h-8 w-8"
                                onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                              >
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          ) : (
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
                                {reservation.status === 'cancelled' && (
                                  <DropdownMenuItem onClick={() => updateReservationStatus(reservation.id, 'confirmed')}>
                                    <Check className="h-4 w-4 mr-2 text-green-600" /> Confirm
                                  </DropdownMenuItem>
                                )}
                                {reservation.status === 'confirmed' && (
                                  <DropdownMenuItem onClick={() => updateReservationStatus(reservation.id, 'cancelled')}>
                                    <X className="h-4 w-4 mr-2 text-red-600" /> Cancel
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
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
            Showing {filteredReservations.length} of {reservations.length} reservations
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
              {reservations.filter(r => r.status === 'pending').length} Pending
            </Badge>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              {reservations.filter(r => r.status === 'confirmed').length} Confirmed
            </Badge>
            <Badge variant="outline" className="bg-red-100 text-red-800">
              {reservations.filter(r => r.status === 'cancelled').length} Cancelled
            </Badge>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ReservationManagement;
