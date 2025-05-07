
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Shield, User } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { signIn, signUp, isLoading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>("customer");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password, selectedRole);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    await signUp(email, password, selectedRole);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center mb-8 text-lg font-semibold">
          <span className="text-2xl mr-2">🍕</span> Pizza Station
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Welcome</CardTitle>
            <CardDescription>
              Sign in to access the restaurant management system
            </CardDescription>
          </CardHeader>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)} 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)} 
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Login As</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        type="button" 
                        variant={selectedRole === "customer" ? "default" : "outline"}
                        className="flex items-center justify-center gap-2"
                        onClick={() => setSelectedRole("customer")}
                      >
                        <User size={16} />
                        Customer
                      </Button>
                      <Button 
                        type="button" 
                        variant={selectedRole === "admin" ? "default" : "outline"}
                        className="flex items-center justify-center gap-2"
                        onClick={() => setSelectedRole("admin")}
                      >
                        <Shield size={16} />
                        Admin
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)} 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)} 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input 
                      id="signup-password" 
                      type="password" 
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)} 
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Register As</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        type="button" 
                        variant={selectedRole === "customer" ? "default" : "outline"}
                        className="flex items-center justify-center gap-2"
                        onClick={() => setSelectedRole("customer")}
                      >
                        <User size={16} />
                        Customer
                      </Button>
                      <Button 
                        type="button" 
                        variant={selectedRole === "admin" ? "default" : "outline"}
                        className="flex items-center justify-center gap-2"
                        onClick={() => setSelectedRole("admin")}
                      >
                        <Shield size={16} />
                        Admin
                      </Button>
                    </div>
                    {selectedRole === "admin" && (
                      <p className="text-xs text-muted-foreground">
                        Note: Admin accounts require additional verification by system administrators.
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Login;
