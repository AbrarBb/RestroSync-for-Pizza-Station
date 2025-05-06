
import { Dispatch, SetStateAction } from "react";
import { Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GuestSelectorProps {
  guests: string | undefined;
  setGuests: Dispatch<SetStateAction<string | undefined>>;
  guestOptions: string[];
}

const GuestSelector = ({ guests, setGuests, guestOptions }: GuestSelectorProps) => {
  return (
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
  );
};

export default GuestSelector;
