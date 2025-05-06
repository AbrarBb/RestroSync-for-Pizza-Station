
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, ShoppingCart, Users, Clock, AlertCircle } from "lucide-react";
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";
import { InventoryAlert } from "@/components/dashboard/InventoryAlert";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

const Dashboard = () => {
  const { toast } = useToast();
  
  useEffect(() => {
    // Show a welcome toast when the dashboard loads
    toast({
      title: "Welcome to the Dashboard",
      description: "You can manage all restaurant operations from here.",
    });
  }, [toast]);

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <StatCard 
            title="Today's Orders"
            value="38"
            description="+5 from yesterday"
            icon={<ShoppingCart className="h-6 w-6" />}
            trend="up"
          />
          <StatCard 
            title="Reservations"
            value="12"
            description="For tonight"
            icon={<CalendarCheck className="h-6 w-6" />}
            trend="same"
          />
          <StatCard 
            title="Active Customers"
            value="126"
            description="+18 this week"
            icon={<Users className="h-6 w-6" />}
            trend="up"
          />
          <StatCard 
            title="Avg. Wait Time"
            value="24m"
            description="-2m from last week"
            icon={<Clock className="h-6 w-6" />}
            trend="down"
          />
        </div>
        
        {/* Recent Orders and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                Latest 5 orders that need attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentOrdersTable />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Inventory Alerts</CardTitle>
              <CardDescription>
                Items that need restocking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryAlert />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'same';
}

const StatCard = ({ title, value, description, icon, trend }: StatCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="bg-primary/10 p-2 rounded-full">
            {icon}
          </div>
          {trend === 'up' && <span className="text-green-500 text-xs font-medium">↑</span>}
          {trend === 'down' && <span className="text-red-500 text-xs font-medium">↓</span>}
          {trend === 'same' && <span className="text-gray-500 text-xs font-medium">→</span>}
        </div>
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
