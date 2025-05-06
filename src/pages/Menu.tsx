
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { ShoppingCart, Search, Plus, Minus } from "lucide-react";

// Sample menu data
const menuItems = [
  {
    id: 1,
    category: "pizza",
    name: "Margherita",
    description: "Classic tomato sauce, mozzarella, and fresh basil",
    price: 12.99,
    image: "/placeholder.svg"
  },
  {
    id: 2,
    category: "pizza",
    name: "Pepperoni",
    description: "Tomato sauce, mozzarella, and pepperoni",
    price: 14.99,
    image: "/placeholder.svg"
  },
  {
    id: 3,
    category: "pizza",
    name: "Vegetarian",
    description: "Tomato sauce, mozzarella, bell peppers, mushrooms, onions",
    price: 15.99,
    image: "/placeholder.svg"
  },
  {
    id: 4,
    category: "sides",
    name: "Garlic Breadsticks",
    description: "Freshly baked breadsticks with garlic butter",
    price: 5.99,
    image: "/placeholder.svg"
  },
  {
    id: 5,
    category: "sides",
    name: "Caesar Salad",
    description: "Romaine lettuce, croutons, parmesan cheese with Caesar dressing",
    price: 7.99,
    image: "/placeholder.svg"
  },
  {
    id: 6,
    category: "drinks",
    name: "Soda",
    description: "Your choice of Coke, Sprite, or Fanta",
    price: 2.49,
    image: "/placeholder.svg"
  },
  {
    id: 7,
    category: "drinks",
    name: "Iced Tea",
    description: "Freshly brewed iced tea",
    price: 2.99,
    image: "/placeholder.svg"
  }
];

const Menu = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<{id: number, name: string, price: number, quantity: number}[]>([]);
  
  // Filter menu items based on search query
  const filteredItems = (category: string) => {
    return menuItems
      .filter(item => item.category === category)
      .filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
  };
  
  // Add item to cart
  const addToCart = (id: number, name: string, price: number) => {
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
  const removeFromCart = (id: number) => {
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
            
            <Button asChild size="sm">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Our Menu</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Menu Items */}
          <div className="flex-grow">
            <Tabs defaultValue="pizza" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="pizza">Pizzas</TabsTrigger>
                <TabsTrigger value="sides">Sides</TabsTrigger>
                <TabsTrigger value="drinks">Drinks</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pizza" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredItems("pizza").map((item) => (
                    <MenuItemCard 
                      key={item.id}
                      item={item}
                      onAddToCart={() => addToCart(item.id, item.name, item.price)}
                    />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="sides" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredItems("sides").map((item) => (
                    <MenuItemCard 
                      key={item.id}
                      item={item}
                      onAddToCart={() => addToCart(item.id, item.name, item.price)}
                    />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="drinks" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredItems("drinks").map((item) => (
                    <MenuItemCard 
                      key={item.id}
                      item={item}
                      onAddToCart={() => addToCart(item.id, item.name, item.price)}
                    />
                  ))}
                </div>
              </TabsContent>
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
                          <p className="text-sm text-gray-500">${item.price.toFixed(2)} × {item.quantity}</p>
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
                        <span>${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>Tax (7%)</span>
                        <span>${(cartTotal * 0.07).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg mt-2">
                        <span>Total</span>
                        <span>${(cartTotal * 1.07).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  disabled={cart.length === 0}
                  onClick={() => {
                    toast({
                      title: "Order Placed",
                      description: "Your order has been placed successfully!",
                    });
                    setCart([]);
                  }}
                >
                  Checkout
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

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
  item: {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
  };
  onAddToCart: () => void;
}

const MenuItemCard = ({ item, onAddToCart }: MenuItemProps) => {
  return (
    <Card className="overflow-hidden">
      <img 
        src={item.image} 
        alt={item.name} 
        className="w-full h-48 object-cover"
      />
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold">{item.name}</h3>
          <span className="font-bold">${item.price.toFixed(2)}</span>
        </div>
        <p className="text-gray-600 text-sm mb-4">{item.description}</p>
      </CardContent>
      <CardFooter className="px-4 pb-4 pt-0 flex justify-end">
        <Button onClick={onAddToCart}>Add to Cart</Button>
      </CardFooter>
    </Card>
  );
};

export default Menu;
