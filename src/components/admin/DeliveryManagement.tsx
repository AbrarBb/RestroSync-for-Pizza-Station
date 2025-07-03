
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { orderService } from "@/lib/orderService";
import { deliveryService, DeliveryDriver } from "@/lib/deliveryService";
import { Order } from "@/lib/supabase";
import { DeliveryAssignment } from "@/integrations/supabase/database.types";
import { toast } from "@/hooks/use-toast";
import { Loader2, Truck, MapPin, Phone, User, Clock, RefreshCw } from "lucide-react";

const DeliveryManagement = () => {
  const [deliveryOrders, setDeliveryOrders] = useState<Order[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<DeliveryDriver[]>([]);
  const [deliveryAssignments, setDeliveryAssignments] = useState<DeliveryAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<{ [orderId: string]: string }>({});

  const fetchDeliveryData = async () => {
    try {
      setLoading(true);
      
      // Get all orders
      const allOrders = await orderService.getAllOrders();
      
      // Filter delivery orders
      const deliveryOnlyOrders = allOrders.filter(order => order.order_type === 'delivery');
      setDeliveryOrders(deliveryOnlyOrders);
      
      // Get available drivers
      const drivers = await deliveryService.getAvailableDrivers();
      setAvailableDrivers(drivers);
      
      // Get delivery assignments for all delivery orders
      const assignments: DeliveryAssignment[] = [];
      for (const order of deliveryOnlyOrders) {
        const assignment = await orderService.getDeliveryAssignment(order.id);
        if (assignment) {
          assignments.push(assignment);
        }
      }
      setDeliveryAssignments(assignments);
      
    } catch (error) {
      console.error('Error fetching delivery data:', error);
      toast({
        title: "Error loading delivery data",
        description: "Failed to load delivery information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDeliveryData();
    setRefreshing(false);
  };

  const handleAssignDriver = async (orderId: string) => {
    const driverId = selectedDriver[orderId];
    if (!driverId) {
      toast({
        title: "No driver selected",
        description: "Please select a driver to assign to this order.",
        variant: "destructive"
      });
      return;
    }

    const success = await deliveryService.assignDelivery(orderId, driverId);
    if (success) {
      // Clear selection
      setSelectedDriver(prev => ({
        ...prev,
        [orderId]: ''
      }));
      
      // Refresh data
      await fetchDeliveryData();
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: DeliveryAssignment['status']) => {
    const success = await orderService.updateDeliveryStatus(orderId, newStatus);
    if (success) {
      await fetchDeliveryData();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "preparing": return "bg-blue-100 text-blue-800";
      case "ready": return "bg-green-100 text-green-800";
      case "delivering": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-gray-100 text-gray-800";
      case "assigned": return "bg-orange-100 text-orange-800";
      case "picked_up": return "bg-indigo-100 text-indigo-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getDriverStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800";
      case "delivering": return "bg-blue-100 text-blue-800";
      case "offline": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-BD', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAssignmentForOrder = (orderId: string) => {
    return deliveryAssignments.find(assignment => assignment.order_id === orderId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading delivery management...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Delivery Management</h2>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Deliveries</p>
                <p className="text-2xl font-bold">{deliveryOrders.length}</p>
              </div>
              <Truck className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Deliveries</p>
                <p className="text-2xl font-bold">
                  {deliveryOrders.filter(order => 
                    order.status === 'delivering' || order.status === 'ready'
                  ).length}
                </p>
              </div>
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Drivers</p>
                <p className="text-2xl font-bold">
                  {availableDrivers.filter(driver => driver.status === 'available').length}
                </p>
              </div>
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Today</p>
                <p className="text-2xl font-bold">
                  {deliveryOrders.filter(order => 
                    order.status === 'delivered' && 
                    new Date(order.created_at).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Delivery Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deliveryOrders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No delivery orders found
                  </p>
                ) : (
                  deliveryOrders.map((order) => {
                    const assignment = getAssignmentForOrder(order.id);
                    
                    return (
                      <Card key={order.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold">Order #{order.id.substring(0, 8)}</h4>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(order.created_at)}
                              </p>
                            </div>
                            <Badge className={`${getStatusColor(order.status)} capitalize`}>
                              {order.status}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{order.customer_name}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{order.customer_phone}</span>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <span className="text-sm">{order.delivery_address}</span>
                            </div>
                            
                            <div className="text-sm font-medium">
                              Total: ৳{order.total.toFixed(2)}
                            </div>
                          </div>
                          
                          <Separator className="my-3" />
                          
                          {assignment ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Driver: {assignment.driver_name}</span>
                                <Badge className={`${getStatusColor(assignment.status)} capitalize`}>
                                  {assignment.status}
                                </Badge>
                              </div>
                              
                              {assignment.status !== 'delivered' && (
                                <div className="flex gap-2">
                                  {assignment.status === 'assigned' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleStatusUpdate(order.id, 'picked_up')}
                                    >
                                      Mark Picked Up
                                    </Button>
                                  )}
                                  
                                  {(assignment.status === 'assigned' || assignment.status === 'picked_up') && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleStatusUpdate(order.id, 'delivered')}
                                    >
                                      Mark Delivered
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex gap-2">
                                <Select
                                  value={selectedDriver[order.id] || ''}
                                  onValueChange={(value) => setSelectedDriver(prev => ({
                                    ...prev,
                                    [order.id]: value
                                  }))}
                                >
                                  <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Select driver" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableDrivers
                                      .filter(driver => driver.status === 'available')
                                      .map(driver => (
                                        <SelectItem key={driver.id} value={driver.id}>
                                          {driver.name} - {driver.vehicle_type}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                                
                                <Button
                                  onClick={() => handleAssignDriver(order.id)}
                                  disabled={!selectedDriver[order.id]}
                                >
                                  Assign
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Drivers */}
        <Card>
          <CardHeader>
            <CardTitle>Available Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availableDrivers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No drivers available
                </p>
              ) : (
                availableDrivers.map((driver) => (
                  <Card key={driver.id} className="shadow-none border">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{driver.name}</h4>
                        <Badge className={`${getDriverStatusColor(driver.status)} capitalize`}>
                          {driver.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          <span>{driver.phone}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Truck className="h-3 w-3" />
                          <span className="capitalize">{driver.vehicle_type}</span>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2">
                          <span>Rating: {driver.rating}/5</span>
                          <span>Active: {driver.status === 'delivering' ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliveryManagement;
