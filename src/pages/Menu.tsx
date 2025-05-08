
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Search, Plus, Minus, User, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { menuItemsService, ordersService, MenuItem } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";

// Cart item interface
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const Menu = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);
  const [guestInfo, setGuestInfo] = useState({ name: "", email: "", phone: "" });
  const { user, userRole } = useAuth();
  const navigate = useNavigate();

  // Fetch menu items
  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ["menuItems"],
    queryFn: menuItemsService.getAll,
  });
  
  // Filter menu items based on search query
  const filteredItems = (category: string) => {
    return menuItems
      .filter(item => item.category === category)
      .filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
  };

  // Get unique categories and ensure they are strings
  const categories = Array.from(new Set(menuItems.map(item => item.category)))
    .filter(category => typeof category === 'string') as string[];
  
  // Add item to cart
  const addToCart = (id: string, name: string, price: number) => {
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { id, name, price, quantity: 1 }]);
    }
    
    toast({
      title: "Added to cart",
      description: `${name} has been added to your cart.`,
    });
  };
  
  // Remove item from cart
  const removeFromCart = (id: string) => {
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(item => 
        item.id === id 
          ? { ...item, quantity: item.quantity - 1 } 
          : item
      ));
    } else {
      setCart(cart.filter(item => item.id !== id));
    }
  };
  
  // Calculate total price
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Handle checkout process
  const handleCheckout = () => {
    // If user is logged in, process checkout directly
    if (user) {
      processCheckout();
      return;
    }
    
    // If user is not logged in, show checkout options dialog
    setIsCheckoutDialogOpen(true);
  };

  // Process the checkout
  const processCheckout = async () => {
    try {
      // Prepare order data
      const orderData: any = {
        customer_id: user?.id,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: cartTotal,
        status: "pending" as const,
        order_type: "pickup" as const,
        created_at: new Date().toISOString(),
        payment_status: "pending" as const
      };

      // Add guest info if guest checkout
      if (isGuestCheckout && !user) {
        orderData.customer_name = guestInfo.name;
        orderData.customer_email = guestInfo.email;
        orderData.customer_phone = guestInfo.phone;
      }

      // Create order
      await ordersService.create(orderData);

      // Show success toast
      toast({
        title: "Order Placed",
        description: isGuestCheckout 
          ? `Thank you ${guestInfo.name}! Your order has been placed successfully.` 
          : "Your order has been placed successfully!",
      });

      // Reset cart and checkout state
      setCart([]);
      setIsCheckoutDialogOpen(false);
      setIsGuestCheckout(false);
      setGuestInfo({ name: "", email: "", phone: "" });

      // Redirect to orders page if user is logged in
      if (user) {
        navigate('/orders');
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Error",
        description: "Failed to place your order. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle guest checkout form submission
  const handleGuestCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processCheckout();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center text-lg font-semibold">
            <span className="text-2xl mr-2">🍕</span> Pizza Station
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[200px] md:w-[300px] pr-8"
              />
              <Search className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            
            <div className="relative">
              <Button variant="outline" size="icon" className="relative">
                <ShoppingCart className="h-4 w-4" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </Button>
            </div>
            
            {!user ? (
              <Button asChild size="sm">
                <Link to="/login"><User className="h-4 w-4 mr-1" /> Sign In</Link>
              </Button>
            ) : (
              <>
                {userRole === "customer" ? (
                  <Button asChild size="sm" variant="outline">
                    <Link to="/customer-dashboard">My Account</Link>
                  </Button>
                ) : (
                  <Button asChild size="sm" variant="outline">
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Our Menu</h1>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-gray-500">Loading menu items...</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Menu Items */}
            <div className="flex-grow">
              <Tabs defaultValue={categories[0] || "pizza"} className="w-full">
                <TabsList className="mb-6">
                  {categories.length > 0 ? (
                    categories.map((category: string) => (
                      <TabsTrigger key={category} value={category} className="capitalize">
                        {category}
                      </TabsTrigger>
                    ))
                  ) : (
                    <>
                      <TabsTrigger value="pizza">Pizzas</TabsTrigger>
                      <TabsTrigger value="sides">Sides</TabsTrigger>
                      <TabsTrigger value="drinks">Drinks</TabsTrigger>
                    </>
                  )}
                </TabsList>
                
                {categories.length > 0 ? (
                  categories.map((category: string) => (
                    <TabsContent key={category} value={category} className="mt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredItems(category).length > 0 ? (
                          filteredItems(category).map((item) => (
                            <MenuItemCard 
                              key={item.id}
                              item={item}
                              onAddToCart={() => addToCart(item.id, item.name, item.price)}
                            />
                          ))
                        ) : (
                          <div className="col-span-2 py-10 text-center text-gray-500">
                            No items found in this category
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  ))
                ) : (
                  <div className="py-10 text-center text-gray-500">
                    No menu items available
                  </div>
                )}
              </Tabs>
            </div>
            
            {/* Cart */}
            <div className="md:w-[350px] shrink-0">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-bold mb-4">Your Order</h2>
                  {cart.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Your cart is empty</p>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={item.id} className="flex justify-between items-center">
                          <div className="flex-grow">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">৳{item.price.toFixed(2)} × {item.quantity}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span>{item.quantity}</span>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => addToCart(item.id, item.name, item.price)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between font-medium">
                          <span>Subtotal</span>
                          <span>৳{cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500 mt-1">
                          <span>Tax (7%)</span>
                          <span>৳{(cartTotal * 0.07).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg mt-2">
                          <span>Total</span>
                          <span>৳{(cartTotal * 1.07).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    disabled={cart.length === 0}
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Checkout Options Dialog */}
      <Dialog open={isCheckoutDialogOpen} onOpenChange={setIsCheckoutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Order</DialogTitle>
            <DialogDescription>
              Sign in to your account or continue as a guest to complete your order.
            </DialogDescription>
          </DialogHeader>
          
          {isGuestCheckout ? (
            <form onSubmit={handleGuestCheckoutSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="guest-name">Name</Label>
                  <Input
                    id="guest-name"
                    value={guestInfo.name}
                    onChange={(e) => setGuestInfo({...guestInfo, name: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="guest-email">Email</Label>
                  <Input
                    id="guest-email"
                    type="email"
                    value={guestInfo.email}
                    onChange={(e) => setGuestInfo({...guestInfo, email: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="guest-phone">Phone Number</Label>
                  <Input
                    id="guest-phone"
                    value={guestInfo.phone}
                    onChange={(e) => setGuestInfo({...guestInfo, phone: e.target.value})}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="terms" className="text-sm text-gray-500">
                    By proceeding, you agree to pay upfront before your order is processed.
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsGuestCheckout(false)}>
                  Back
                </Button>
                <Button type="submit">Complete Purchase</Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="grid gap-4 py-4">
              <Button onClick={() => navigate('/login')} className="w-full">
                Sign In to Continue
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              <Button variant="outline" onClick={() => setIsGuestCheckout(true)} className="w-full">
                Continue as Guest
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2025 Pizza Station. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

interface MenuItemProps {
  item: MenuItem;
  onAddToCart: () => void;
}

const MenuItemCard = ({ item, onAddToCart }: MenuItemProps) => {
  // Ensure image is displayed correctly
  const imageUrl = item.image_url || "/placeholder.svg";
  
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48">
        <img 
          src={imageUrl} 
          alt={item.name} 
          className="w-full h-48 object-cover"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
        {item.status !== "active" && (
          <div className="absolute top-2 right-2">
            <Badge 
              variant="outline" 
              className={`${item.status === "out-of-stock" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}
            >
              {item.status === "out-of-stock" ? "Out of stock" : "Seasonal"}
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold">{item.name}</h3>
          <span className="font-bold">৳{item.price.toFixed(2)}</span>
        </div>
        <p className="text-gray-600 text-sm mb-4">{item.description}</p>
      </CardContent>
      <CardFooter className="px-4 pb-4 pt-0 flex justify-end">
        <Button onClick={onAddToCart} disabled={item.status === "out-of-stock"}>
          {item.status === "out-of-stock" ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Menu;
