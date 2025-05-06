
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Users, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const Reservations = () => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string | undefined>(undefined);
  const [guests, setGuests] = useState<string | undefined>("2");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    setIsSubmitting(true);
    
    // Simulate reservation processing
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Reservation Confirmed",
        description: `Your table for ${guests} on ${format(date as Date, "MMMM d, yyyy")} at ${time} has been reserved.`,
      });
      
      // Reset form (optional)
      setDate(undefined);
      setTime(undefined);
      setGuests("2");
      setName("");
      setPhone("");
      setEmail("");
      setSpecialRequests("");
    }, 1500);
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
            <Button asChild variant="ghost" size="sm">
              <Link to="/menu">Menu</Link>
            </Button>
            
            <Button asChild variant="ghost" size="sm">
              <Link to="/reservations">Reservations</Link>
            </Button>
            
            <Button asChild size="sm">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
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
                  {/* Date Picker */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-gray-400"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            // Disable past dates and dates more than 30 days in the future
                            return (
                              date < today || 
                              date > new Date(today.setDate(today.getDate() + 30))
                            );
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  {/* Time Picker */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time</label>
                    <Select value={time} onValueChange={setTime}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select time">
                          <div className="flex items-center">
                            {time ? (
                              <>
                                <Clock className="mr-2 h-4 w-4" />
                                {time}
                              </>
                            ) : (
                              "Select time"
                            )}
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Party Size */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Number of Guests</label>
                    <Select value={guests} onValueChange={setGuests}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select guests">
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4" />
                            {guests} {parseInt(guests || "0") === 1 ? "Guest" : "Guests"}
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {guestOptions.map((num) => (
                          <SelectItem key={num} value={num}>
                            {num} {parseInt(num) === 1 ? "Guest" : "Guests"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Customer Information */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-medium">Your Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name</label>
                      <Input 
                        placeholder="John Doe" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone Number</label>
                      <Input 
                        type="tel" 
                        placeholder="(123) 456-7890" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">Email Address</label>
                      <Input 
                        type="email" 
                        placeholder="john@example.com" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Special Requests (Optional)</label>
                    <Textarea
                      placeholder="Any special requests or requirements..."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
                
                {/* Restaurant Location */}
                <div className="bg-gray-50 p-4 rounded-lg flex gap-4 items-start border">
                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Pizza Station - Main Branch</h4>
                    <p className="text-sm text-gray-600">
                      123 Pizza Street, Flavor City, FC 12345
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      For large parties (more than 10 people), please call us directly at (555) 123-4567
                    </p>
                  </div>
                </div>
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

      {/* Footer */}
      <footer className="bg-gray-100 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2025 Pizza Station. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Reservations;
