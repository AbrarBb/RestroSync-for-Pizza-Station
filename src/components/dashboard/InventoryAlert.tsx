
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface InventoryItem {
  id: number;
  name: string;
  current: number;
  minimum: number;
  unit: string;
}

const lowStockItems: InventoryItem[] = [
  {
    id: 1,
    name: "Mozzarella Cheese",
    current: 2.5,
    minimum: 5,
    unit: "kg"
  },
  {
    id: 2,
    name: "Pepperoni",
    current: 0.8,
    minimum: 2,
    unit: "kg"
  },
  {
    id: 3,
    name: "Pizza Dough",
    current: 10,
    minimum: 15,
    unit: "balls"
  },
  {
    id: 4,
    name: "Tomato Sauce",
    current: 3,
    minimum: 5,
    unit: "liters"
  }
];

export function InventoryAlert() {
  return (
    <div className="space-y-4">
      {lowStockItems.map((item) => (
        <div 
          key={item.id}
          className="flex items-center justify-between p-3 border rounded-lg bg-red-50"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-medium">{item.name}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-white">
                  {item.current} {item.unit}
                </Badge>
                <span className="text-xs text-red-600">
                  (Minimum: {item.minimum} {item.unit})
                </span>
              </div>
            </div>
          </div>
          <Button size="sm">Restock</Button>
        </div>
      ))}
      
      <Button variant="outline" className="w-full mt-4">
        View All Inventory
      </Button>
    </div>
  );
}
