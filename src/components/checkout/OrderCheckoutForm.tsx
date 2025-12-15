import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

interface OrderCheckoutFormProps {
  items: OrderItem[];
  subtotal: number;
  onSubmitOrder: (orderData: any) => Promise<boolean>;
}

const OrderCheckoutForm = ({ items, subtotal, onSubmitOrder }: OrderCheckoutFormProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: user?.email || "",
    phone: "",
    address: "",
    paymentMethod: "bkash",
    specialRequests: "",
    orderType: ""
  });
  const [loading, setLoading] = useState(false);

  // Fetch profile data when user is logged in
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone, address')
        .eq('user_id', user.id)
        .single();
      
      if (profile) {
        setFormData(prev => ({
          ...prev,
          name: profile.full_name || prev.name,
          email: user.email || prev.email,
          phone: profile.phone || prev.phone,
          address: profile.address || prev.address,
        }));
      }
    };
    
    fetchProfile();
  }, [user]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Missing information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.orderType) {
      toast({
        title: "Order type required",
        description: "Please select an order type (delivery or dine-in)",
        variant: "destructive"
      });
      return;
    }
    
    // Validate for delivery type
    if (formData.orderType === "delivery" && !formData.address) {
      toast({
        title: "Missing delivery address",
        description: "Please provide an address for delivery",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Add generated ID to ensure we have a valid ID even if database doesn't generate one
      const orderData = {
        id: crypto.randomUUID(), // Ensure we have an ID
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        customer_id: user?.id || null,
        delivery_address: formData.orderType === "delivery" ? formData.address : null,
        order_type: formData.orderType,
        items: items,
        total: subtotal,
        payment_method: formData.paymentMethod,
        payment_status: "pending",
        status: "pending",
        special_requests: formData.specialRequests,
      };
      
      console.log('Submitting order data:', orderData);
      const success = await onSubmitOrder(orderData);
      
      if (!success) {
        toast({
          title: "Order failed",
          description: "There was a problem placing your order. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Error placing order:", error);
      toast({
        title: "Order failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="Your phone number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Order Type & Delivery Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Order Type *</Label>
            <RadioGroup
              value={formData.orderType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, orderType: value }))}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="delivery" id="delivery" />
                <Label htmlFor="delivery">Home Delivery</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dine_in" id="dine_in" />
                <Label htmlFor="dine_in">Dine In</Label>
              </div>
            </RadioGroup>
          </div>
          
          {formData.orderType === "delivery" && (
            <div className="grid gap-2">
              <Label htmlFor="address">Delivery Address *</Label>
              <Textarea
                id="address"
                name="address"
                placeholder="Enter your full address for delivery"
                value={formData.address}
                onChange={handleChange}
                className="min-h-[100px]"
                required={formData.orderType === "delivery"}
              />
            </div>
          )}
          
          <div className="grid gap-2">
            <Label htmlFor="specialRequests">Special Requests</Label>
            <Textarea
              id="specialRequests"
              name="specialRequests"
              placeholder="Any special requests or instructions?"
              value={formData.specialRequests}
              onChange={handleChange}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            defaultValue="bkash"
            value={formData.paymentMethod}
            onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="bkash" id="bkash" />
              <Label htmlFor="bkash" className="flex items-center cursor-pointer">
                <span className="inline-flex items-center justify-center w-10 h-6 rounded bg-pink-500 text-white text-xs font-bold mr-2">
                  bKash
                </span>
                bKash Mobile Banking
              </Label>
            </div>
            
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="nagad" id="nagad" />
              <Label htmlFor="nagad" className="flex items-center cursor-pointer">
                <span className="inline-flex items-center justify-center w-10 h-6 rounded bg-orange-500 text-white text-xs font-bold mr-2">
                  নগদ
                </span>
                Nagad Mobile Banking
              </Label>
            </div>
            
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="rocket" id="rocket" />
              <Label htmlFor="rocket" className="flex items-center cursor-pointer">
                <span className="inline-flex items-center justify-center w-10 h-6 rounded bg-purple-600 text-white text-xs font-bold mr-2">
                  🚀
                </span>
                Rocket Mobile Banking
              </Label>
            </div>
            
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex items-center cursor-pointer">
                <span className="inline-flex items-center justify-center w-10 h-6 rounded bg-blue-600 text-white text-xs font-bold mr-2">
                  💳
                </span>
                Credit/Debit Card
              </Label>
            </div>
            
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="cash" id="cash" />
              <Label htmlFor="cash" className="flex items-center cursor-pointer">
                <span className="inline-flex items-center justify-center w-10 h-6 rounded bg-green-600 text-white text-xs font-bold mr-2">
                  💵
                </span>
                Cash on Delivery
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>{item.quantity}x {item.name}</span>
              <span>৳{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          
          <div className="pt-4 border-t">
            <div className="flex justify-between font-medium">
              <span>Subtotal</span>
              <span>৳{subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between font-bold mt-2 pt-2 border-t">
              <span>Total</span>
              <span>৳{subtotal.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Place Order - ৳${subtotal.toFixed(2)}`
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default OrderCheckoutForm;
