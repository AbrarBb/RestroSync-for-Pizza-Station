
import { MapPin } from "lucide-react";

const LocationInfo = () => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg flex gap-4 items-start border">
      <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
      <div>
        <h4 className="font-medium">Pizza Station - Main Branch</h4>
        <p className="text-sm text-gray-600">
          1212 Aftab Nagar, Dhaka, Bangladesh
        </p>
        <p className="text-sm text-gray-600 mt-1">
          For large parties (more than 10 people), please call us directly at +880 1700-000000
        </p>
      </div>
    </div>
  );
};

export default LocationInfo;
