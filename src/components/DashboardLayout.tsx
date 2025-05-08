
import { ReactNode, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  Menu,
  CalendarCheck,
  ShoppingCart,
  Users,
  Package,
  Settings,
  LogOut,
  Bell,
  Search,
  FileText,
  Download,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { signOut, isAdmin, userRole } = useAuth();

  // Redirect customers away from dashboard
  if (userRole === "customer") {
    toast({
      title: "Access denied",
      description: "You don't have permission to access this page.",
      variant: "destructive",
    });
    navigate("/menu");
    return null;
  }

  const handleLogout = () => {
    signOut();
  };

  // Check if user is staff or admin
  const isAdminUser = userRole === "admin";
  const isStaffUser = userRole === "staff";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`bg-white border-r transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-64" : "w-16"
        } flex flex-col fixed h-full z-10`}
      >
        {/* Logo */}
        <div className="py-4 px-3 flex items-center justify-between border-b">
          {isSidebarOpen ? (
            <Link to="/dashboard" className="flex items-center">
              <span className="text-2xl mr-2">🍕</span>
              <span className="font-bold">Pizza Station</span>
            </Link>
          ) : (
            <span className="text-2xl mx-auto">🍕</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="ml-auto"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 pt-4 px-2">
          <ul className="space-y-1">
            <NavItem
              to="/dashboard"
              icon={<Home />}
              label="Dashboard"
              isOpen={isSidebarOpen}
            />
            <NavItem
              to="/orders"
              icon={<ShoppingCart />}
              label="Orders"
              isOpen={isSidebarOpen}
            />
            <NavItem
              to="/reservations"
              icon={<CalendarCheck />}
              label="Reservations"
              isOpen={isSidebarOpen}
            />
            <NavItem
              to="/menu-management"
              icon={<Menu />}
              label="Menu Management"
              isOpen={isSidebarOpen}
            />
            
            {/* Staff can see customers but not manage staff */}
            <NavItem
              to="/customers"
              icon={<Users />}
              label="Customers"
              isOpen={isSidebarOpen}
            />
            
            <NavItem
              to="/inventory"
              icon={<Package />}
              label="Inventory"
              isOpen={isSidebarOpen}
            />
            
            {/* Only show Staff Management to admin */}
            {isAdminUser && (
              <NavItem
                to="/staff"
                icon={<Users />}
                label="Staff Management"
                isOpen={isSidebarOpen}
              />
            )}
            
            {/* Admin-only reports section */}
            {isAdminUser && (
              <NavItem
                to="/reports"
                icon={<FileText />}
                label="Reports"
                isOpen={isSidebarOpen}
              />
            )}
            
            <NavItem
              to="/settings"
              icon={<Settings />}
              label="Settings"
              isOpen={isSidebarOpen}
            />
          </ul>
        </nav>

        {/* User Role Badge */}
        {userRole && isSidebarOpen && (
          <div className="px-4 py-2">
            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium 
              ${userRole === "admin" ? "bg-purple-100 text-purple-800" : 
                userRole === "staff" ? "bg-blue-100 text-blue-800" : 
                "bg-green-100 text-green-800"}`}>
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </span>
          </div>
        )}

        {/* User */}
        <div className="border-t p-4">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={`w-full justify-${isSidebarOpen ? "start" : "center"}`}
          >
            <LogOut className="h-5 w-5" />
            {isSidebarOpen && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "ml-64" : "ml-16"
        }`}
      >
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center px-6">
          <div className="flex-1 flex gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="search"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
              {isSidebarOpen && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {userRole === "admin" ? "Admin User" : 
                     userRole === "staff" ? "Staff User" : "Customer"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        {children}
      </main>
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
}

const NavItem = ({ to, icon, label, isOpen }: NavItemProps) => {
  return (
    <li>
      <Link
        to={to}
        className={`flex items-center p-2 rounded-md hover:bg-gray-100 transition-all ${
          !isOpen ? "justify-center" : ""
        }`}
      >
        <span className="text-gray-700">{icon}</span>
        {isOpen && <span className="ml-3 text-gray-700">{label}</span>}
      </Link>
    </li>
  );
};

export default DashboardLayout;
