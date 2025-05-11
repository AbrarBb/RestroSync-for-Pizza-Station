
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Reservation {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  guest_count: number;
  reservation_date: string;
  special_requests: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

const ReservationsManagement = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  
  useEffect(() => {
    fetchReservations();
    
    // Set up real-time listener
    const channel = supabase
      .channel('reservations_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'reservations'
      }, payload => {
        setReservations(prev => [payload.new as Reservation, ...prev]);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const fetchReservations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setReservations(data as Reservation[]);
    } catch (error: any) {
      console.error('Error fetching reservations:', error.message);
      toast({
        title: "Failed to load reservations",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateStatus = async (id: string, status: Reservation['status']) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setReservations(prev => 
        prev.map(res => res.id === id ? { ...res, status } : res)
      );
      
      toast({
        title: `Reservation ${status}`,
        description: `Reservation has been ${status} successfully.`
      });
    } catch (error: any) {
      console.error(`Error ${status} reservation:`, error.message);
      toast({
        title: `Failed to ${status} reservation`,
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleSendResponse = async () => {
    if (!selectedReservation || !responseMessage.trim()) return;
    
    try {
      // In a real app, you would send an email here
      // For now, we'll just show a toast
      toast({
        title: "Response sent",
        description: `Response sent to ${selectedReservation.customer_name}`,
      });
      
      setResponseMessage("");
      setSelectedReservation(null);
    } catch (error: any) {
      toast({
        title: "Failed to send response",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Confirmed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Cancelled</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reservation Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {reservations.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No reservation requests found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell className="font-medium">
                    {reservation.id.substring(0, 8)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{reservation.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{reservation.customer_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{reservation.guest_count}</TableCell>
                  <TableCell>{formatDate(reservation.reservation_date)}</TableCell>
                  <TableCell>{formatDate(reservation.created_at)}</TableCell>
                  <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {reservation.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="bg-green-50 hover:bg-green-100 text-green-700"
                            onClick={() => handleUpdateStatus(reservation.id, 'confirmed')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Confirm
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="bg-red-50 hover:bg-red-100 text-red-700"
                            onClick={() => handleUpdateStatus(reservation.id, 'cancelled')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Decline
                          </Button>
                        </>
                      )}
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedReservation(reservation)}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Send Response</DialogTitle>
                            <DialogDescription>
                              Send a message to {reservation.customer_name} regarding their reservation.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Reservation Details:</p>
                              <div className="bg-muted p-3 rounded-md text-sm">
                                <p>Date: {formatDate(reservation.reservation_date)}</p>
                                <p>Guests: {reservation.guest_count}</p>
                                {reservation.special_requests && (
                                  <p className="mt-2">
                                    <span className="font-medium">Special Requests:</span> {reservation.special_requests}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <Textarea
                              value={responseMessage}
                              onChange={e => setResponseMessage(e.target.value)}
                              placeholder="Type your response here..."
                              className="min-h-[120px]"
                            />
                          </div>
                          
                          <DialogFooter>
                            <Button onClick={handleSendResponse}>
                              Send Response
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ReservationsManagement;
