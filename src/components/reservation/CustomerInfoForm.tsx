
import { Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CustomerInfoFormProps {
  name: string;
  setName: Dispatch<SetStateAction<string>>;
  phone: string;
  setPhone: Dispatch<SetStateAction<string>>;
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  specialRequests: string;
  setSpecialRequests: Dispatch<SetStateAction<string>>;
}

const CustomerInfoForm = ({
  name,
  setName,
  phone,
  setPhone,
  email,
  setEmail,
  specialRequests,
  setSpecialRequests,
}: CustomerInfoFormProps) => {
  return (
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
  );
};

export default CustomerInfoForm;
