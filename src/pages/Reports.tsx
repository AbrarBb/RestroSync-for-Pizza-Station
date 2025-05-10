
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

const Reports = () => {
  const [reportType, setReportType] = useState("sales");
  const [timeframe, setTimeframe] = useState("week");
  const { userRole } = useAuth();

  // Use the userRole directly to check admin status
  const isAdmin = userRole === 'admin';

  // Redirect if not admin (extra layer of protection)
  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <FileText className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Admin access required</h3>
                <p className="text-sm text-red-700 mt-2">
                  Only administrators can access the reports page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleDownload = (format: string) => {
    toast({
      title: `Report Downloading`,
      description: `Your ${reportType} report is being downloaded as ${format.toUpperCase()}.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Reports</h1>

        {/* Report Generation Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Generate Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/3">
                <label className="text-sm font-medium mb-2 block">Report Type</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales Report</SelectItem>
                    <SelectItem value="inventory">Inventory Report</SelectItem>
                    <SelectItem value="staff">Staff Performance</SelectItem>
                    <SelectItem value="customers">Customer Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-1/3">
                <label className="text-sm font-medium mb-2 block">Time Period</label>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-1/3 flex items-end">
                <div className="flex gap-2 w-full">
                  <Button 
                    onClick={() => handleDownload('pdf')}
                    variant="outline"
                    className="flex items-center gap-2 flex-1"
                  >
                    <Download className="h-4 w-4" />
                    <span>PDF</span>
                  </Button>
                  <Button 
                    onClick={() => handleDownload('excel')}
                    variant="outline"
                    className="flex items-center gap-2 flex-1"
                  >
                    <Download className="h-4 w-4" />
                    <span>Excel</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Report Preview */}
        <Card>
          <CardHeader>
            <CardTitle>
              {reportType === "sales" && "Sales Report"}
              {reportType === "inventory" && "Inventory Report"}
              {reportType === "staff" && "Staff Performance Report"}
              {reportType === "customers" && "Customer Analysis Report"}
              {" - "}
              {timeframe === "day" && "Today"}
              {timeframe === "week" && "This Week"}
              {timeframe === "month" && "This Month"}
              {timeframe === "quarter" && "This Quarter"}
              {timeframe === "year" && "This Year"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 border border-gray-200 rounded-md p-8 text-center">
              <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700">Report Preview</h3>
              <p className="text-gray-500 mt-2">Select report options and click download to generate your report</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
