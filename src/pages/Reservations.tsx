import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DateTimePicker from "@/components/reservation/DateTimePicker";
import GuestSelector from "@/components/reservation/GuestSelector";
import CustomerInfoForm from "@/components/reservation/CustomerInfoForm";
import LocationInfo from "@/components/reservation/LocationInfo";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { sanitizeInput, sanitizeEmail, sanitizePhone } from "@/lib/inputSanitizer";

const Reservations = () => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string | undefined>(undefined);
  const [guests, setGuests] = useState<string | undefined>("2");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // List of available time slots
  const timeSlots = [
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", 
    "2:00 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", 
    "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM"
  ];
  
  // Table capacities
  const guestOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If user is not logged in, show login dialog
    if (!user) {
      setIsLoginDialogOpen(true);
      return;
    }
    
    // Process reservation if user is logged in
    processReservation();
  };
  
  const processReservation = () => {
    setIsSubmitting(true);
    
    // Sanitize all inputs before processing
    const sanitizedData = {
      name: sanitizeInput(name),
      phone: sanitizePhone(phone),
      email: sanitizeEmail(email),
      specialRequests: sanitizeInput(specialRequests)
    };
    
    // Basic validation
    if (!sanitizedData.name || !sanitizedData.phone || !sanitizedData.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields with valid information.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    // Simulate reservation processing
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Reservation Confirmed",
        description: `Your table for ${guests} on ${format(date as Date, "MMMM d, yyyy")} at ${time} has been reserved.`,
      });
      
      // Reset form with sanitized values
      setDate(undefined);
      setTime(undefined);
      setGuests("2");
      setName("");
      setPhone("");
      setEmail("");
      setSpecialRequests("");
      
      setIsLoginDialogOpen(false);
    }, 1500);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Make a Reservation</h1>
          <p className="text-gray-600 mb-8">
            Reserve your table at Pizza Station for a delicious dining experience
          </p>
          
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Table Reservation</CardTitle>
                <CardDescription>
                  Fill out the form below to book your table
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date, Time & Guests Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <DateTimePicker
                      date={date}
                      setDate={setDate}
                      time={time}
                      setTime={setTime}
                      timeSlots={timeSlots}
                    />
                  </div>
                  
                  <GuestSelector
                    guests={guests}
                    setGuests={setGuests}
                    guestOptions={guestOptions}
                  />
                </div>
                
                <CustomerInfoForm
                  name={name}
                  setName={setName}
                  phone={phone}
                  setPhone={setPhone}
                  email={email}
                  setEmail={setEmail}
                  specialRequests={specialRequests}
                  setSpecialRequests={setSpecialRequests}
                />
                
                <LocationInfo />
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-4">
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto" 
                  disabled={!date || !time || !guests || !name || !phone || !email || isSubmitting}
                >
                  {isSubmitting ? "Confirming..." : "Book Table"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full sm:w-auto"
                  asChild
                >
                  <Link to="/menu">View Our Menu Instead</Link>
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>

      {/* Login Dialog */}
      <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in to complete your reservation</DialogTitle>
            <DialogDescription>
              You need to sign in or create an account to confirm your table reservation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button onClick={() => navigate('/login')} className="w-full">
              Sign In
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/login')} 
              className="w-full"
            >
              Create an Account
            </Button>
          </div>
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setIsLoginDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Reservations;
