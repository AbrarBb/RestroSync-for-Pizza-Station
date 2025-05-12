
import { useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Table, BarChart3, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { uploadFile } from "@/lib/supabaseStorageHelper";

// Mock data for reports demonstration
const mockSalesData = [
  { date: '2025-05-01', total: 8750, orders: 35 },
  { date: '2025-05-02', total: 7200, orders: 28 },
  { date: '2025-05-03', total: 9600, orders: 42 },
  { date: '2025-05-04', total: 8100, orders: 33 },
  { date: '2025-05-05', total: 7800, orders: 31 },
  { date: '2025-05-06', total: 9300, orders: 37 },
  { date: '2025-05-07', total: 10500, orders: 45 },
];

const mockInventoryData = [
  { item: 'Flour', current_stock: 25, reorder_point: 10, unit: 'kg' },
  { item: 'Tomato Sauce', current_stock: 15, reorder_point: 5, unit: 'liters' },
  { item: 'Cheese', current_stock: 8, reorder_point: 10, unit: 'kg' },
  { item: 'Pepperoni', current_stock: 12, reorder_point: 3, unit: 'kg' },
  { item: 'Onions', current_stock: 18, reorder_point: 5, unit: 'kg' },
];

const mockStaffData = [
  { name: 'Jane Smith', orders_processed: 156, hours_worked: 40, efficiency: 3.9 },
  { name: 'John Doe', orders_processed: 120, hours_worked: 38, efficiency: 3.2 },
  { name: 'Emily Johnson', orders_processed: 142, hours_worked: 42, efficiency: 3.4 },
  { name: 'Robert Williams', orders_processed: 98, hours_worked: 35, efficiency: 2.8 },
];

const mockCustomerData = [
  { segment: 'New Customers', count: 125, revenue: 15600, avg_order: 124.8 },
  { segment: 'Returning', count: 350, revenue: 52500, avg_order: 150 },
  { segment: 'Frequent', count: 75, revenue: 18750, avg_order: 250 },
  { segment: 'VIP', count: 25, revenue: 12500, avg_order: 500 },
];

const Reports = () => {
  const [reportType, setReportType] = useState("sales");
  const [timeframe, setTimeframe] = useState("week");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { userRole } = useAuth();
  const reportRef = useRef(null);

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

  const handleGenerate = () => {
    setIsGenerating(true);
    
    // Simulate report generation delay
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Report Generated",
        description: `Your ${reportType} report for ${timeframe} has been generated.`,
      });
    }, 1500);
  };

  const handleDownload = async (format: string) => {
    setIsLoading(true);
    
    try {
      let content = '';
      let filename = '';
      let contentType = '';
      
      // Generate the appropriate report format
      if (format === 'pdf') {
        // In a real app, you would generate a PDF
        content = `This would be a PDF file for ${reportType} data`;
        filename = `${reportType}_report_${Date.now()}.pdf`;
        contentType = 'application/pdf';
        
        // For demo, create a simple text file
        const blob = new Blob([content], { type: 'text/plain' });
        const file = new File([blob], filename, { type: 'text/plain' });
        
        // Upload to Supabase
        const filePath = `reports/${filename}`;
        await uploadFile('reports', filePath, file);
      } else if (format === 'excel') {
        // Create CSV content based on report type
        let csvContent = 'data:text/csv;charset=utf-8,';
        
        if (reportType === 'sales') {
          csvContent += 'Date,Total Sales,Orders\n';
          mockSalesData.forEach(row => {
            csvContent += `${row.date},${row.total},${row.orders}\n`;
          });
        } else if (reportType === 'inventory') {
          csvContent += 'Item,Current Stock,Reorder Point,Unit\n';
          mockInventoryData.forEach(row => {
            csvContent += `${row.item},${row.current_stock},${row.reorder_point},${row.unit}\n`;
          });
        } else if (reportType === 'staff') {
          csvContent += 'Name,Orders Processed,Hours Worked,Efficiency\n';
          mockStaffData.forEach(row => {
            csvContent += `${row.name},${row.orders_processed},${row.hours_worked},${row.efficiency}\n`;
          });
        } else if (reportType === 'customers') {
          csvContent += 'Segment,Count,Revenue,Average Order\n';
          mockCustomerData.forEach(row => {
            csvContent += `${row.segment},${row.count},${row.revenue},${row.avg_order}\n`;
          });
        }
        
        // Convert to blob
        const blob = new Blob([csvContent], { type: 'text/csv' });
        filename = `${reportType}_report_${Date.now()}.csv`;
        const file = new File([blob], filename, { type: 'text/csv' });
        
        // Upload to Supabase
        const filePath = `reports/${filename}`;
        await uploadFile('reports', filePath, file);
        
        // Also trigger download in browser
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      toast({
        title: `Report Downloaded`,
        description: `Your ${reportType} report has been downloaded as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: "Download Failed",
        description: "There was an error generating your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get report data based on type
  const getReportData = () => {
    switch (reportType) {
      case 'sales':
        return mockSalesData;
      case 'inventory':
        return mockInventoryData;
      case 'staff':
        return mockStaffData;
      case 'customers':
        return mockCustomerData;
      default:
        return [];
    }
  };

  // Function to render table headers
  const renderTableHeaders = () => {
    switch (reportType) {
      case 'sales':
        return (
          <tr>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-right">Total Sales (৳)</th>
            <th className="px-4 py-2 text-right">Orders</th>
          </tr>
        );
      case 'inventory':
        return (
          <tr>
            <th className="px-4 py-2 text-left">Item</th>
            <th className="px-4 py-2 text-right">Current Stock</th>
            <th className="px-4 py-2 text-right">Reorder Point</th>
            <th className="px-4 py-2 text-left">Unit</th>
          </tr>
        );
      case 'staff':
        return (
          <tr>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-right">Orders Processed</th>
            <th className="px-4 py-2 text-right">Hours Worked</th>
            <th className="px-4 py-2 text-right">Efficiency</th>
          </tr>
        );
      case 'customers':
        return (
          <tr>
            <th className="px-4 py-2 text-left">Segment</th>
            <th className="px-4 py-2 text-right">Count</th>
            <th className="px-4 py-2 text-right">Revenue (৳)</th>
            <th className="px-4 py-2 text-right">Avg. Order (৳)</th>
          </tr>
        );
      default:
        return null;
    }
  };

  // Function to render table rows
  const renderTableRows = () => {
    const data = getReportData();
    
    switch (reportType) {
      case 'sales':
        return data.map((row: any, index) => (
          <tr key={index} className="border-t">
            <td className="px-4 py-2">{row.date}</td>
            <td className="px-4 py-2 text-right">৳{row.total.toLocaleString()}</td>
            <td className="px-4 py-2 text-right">{row.orders}</td>
          </tr>
        ));
      case 'inventory':
        return data.map((row: any, index) => (
          <tr key={index} className="border-t">
            <td className="px-4 py-2">{row.item}</td>
            <td className="px-4 py-2 text-right">{row.current_stock}</td>
            <td className="px-4 py-2 text-right">{row.reorder_point}</td>
            <td className="px-4 py-2">{row.unit}</td>
          </tr>
        ));
      case 'staff':
        return data.map((row: any, index) => (
          <tr key={index} className="border-t">
            <td className="px-4 py-2">{row.name}</td>
            <td className="px-4 py-2 text-right">{row.orders_processed}</td>
            <td className="px-4 py-2 text-right">{row.hours_worked}</td>
            <td className="px-4 py-2 text-right">{row.efficiency.toFixed(1)}</td>
          </tr>
        ));
      case 'customers':
        return data.map((row: any, index) => (
          <tr key={index} className="border-t">
            <td className="px-4 py-2">{row.segment}</td>
            <td className="px-4 py-2 text-right">{row.count}</td>
            <td className="px-4 py-2 text-right">৳{row.revenue.toLocaleString()}</td>
            <td className="px-4 py-2 text-right">৳{row.avg_order.toFixed(2)}</td>
          </tr>
        ));
      default:
        return null;
    }
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
                <Button 
                  onClick={handleGenerate}
                  className="w-full"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2 justify-end">
              <Button 
                onClick={() => handleDownload('pdf')}
                variant="outline"
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                <span>PDF</span>
              </Button>
              <Button 
                onClick={() => handleDownload('excel')}
                variant="outline"
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                <span>Excel/CSV</span>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Report Preview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
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
            
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">
                View as:
              </span>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Table className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div ref={reportRef} className="border rounded-md">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    {renderTableHeaders()}
                  </thead>
                  <tbody>
                    {renderTableRows()}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
