
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { safeQuery, safeCast } from "./supabaseHelper";

export interface StaffMember {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  role: 'manager' | 'chef' | 'waiter' | 'cashier' | 'delivery';
  status: 'active' | 'inactive' | 'on_leave';
  hire_date: string;
  hourly_rate?: number;
}

export interface Shift {
  id: string;
  staff_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'missed' | 'sick';
  hours_worked?: number;
}

export interface Attendance {
  id: string;
  staff_id: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  status: 'present' | 'absent' | 'late' | 'half_day';
}

export const staffService = {
  // Get all staff members
  getAllStaff: async (): Promise<StaffMember[]> => {
    try {
      // Mock data - would be replaced with actual DB call
      const mockStaff: StaffMember[] = [
        {
          id: '1',
          user_id: 'user-1',
          full_name: 'John Doe',
          email: 'john@example.com',
          phone: '+880123456789',
          role: 'manager',
          status: 'active',
          hire_date: '2022-05-01',
          hourly_rate: 15
        },
        {
          id: '2',
          user_id: 'user-2',
          full_name: 'Alice Smith',
          email: 'alice@example.com',
          phone: '+880123456788',
          role: 'chef',
          status: 'active',
          hire_date: '2022-06-15',
          hourly_rate: 12
        },
        {
          id: '3',
          user_id: 'user-3',
          full_name: 'Bob Johnson',
          email: 'bob@example.com',
          phone: '+880123456787',
          role: 'waiter',
          status: 'on_leave',
          hire_date: '2023-01-10',
          hourly_rate: 8
        },
        {
          id: '4',
          user_id: 'user-4',
          full_name: 'Sarah Williams',
          email: 'sarah@example.com',
          phone: '+880123456786',
          role: 'delivery',
          status: 'active',
          hire_date: '2023-03-22',
          hourly_rate: 10
        },
      ];
      
      return mockStaff;
    } catch (error: any) {
      console.error('Error fetching staff:', error);
      toast({
        title: "Failed to load staff",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
  },
  
  // Update staff role
  updateStaffRole: async (staffId: string, role: StaffMember['role']): Promise<boolean> => {
    try {
      // In real implementation, this would update the database
      console.log(`Updated staff #${staffId} role to ${role}`);
      
      toast({
        title: "Role updated",
        description: `Staff role has been updated to ${role}`,
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating staff role:', error);
      toast({
        title: "Failed to update role",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  },
  
  // Schedule shift for staff
  scheduleShift: async (shift: Omit<Shift, 'id'>): Promise<Shift | null> => {
    try {
      // Mock creating a shift with ID
      const newShift: Shift = {
        id: `shift-${Math.random().toString(36).substr(2, 9)}`,
        ...shift
      };
      
      toast({
        title: "Shift scheduled",
        description: `Shift scheduled for ${shift.date}`,
      });
      
      return newShift;
    } catch (error: any) {
      console.error('Error scheduling shift:', error);
      toast({
        title: "Failed to schedule shift",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  },
  
  // Get staff shifts
  getStaffShifts: async (staffId: string): Promise<Shift[]> => {
    try {
      // Mock data - would be replaced with actual DB call
      return [
        {
          id: 'shift-1',
          staff_id: staffId,
          date: '2025-05-12',
          start_time: '09:00',
          end_time: '17:00',
          status: 'scheduled'
        },
        {
          id: 'shift-2',
          staff_id: staffId,
          date: '2025-05-13',
          start_time: '10:00',
          end_time: '18:00',
          status: 'scheduled'
        }
      ];
    } catch (error: any) {
      console.error('Error fetching shifts:', error);
      return [];
    }
  },
  
  // Record attendance
  recordAttendance: async (attendance: Omit<Attendance, 'id'>): Promise<boolean> => {
    try {
      // Mock recording attendance
      console.log('Recording attendance:', attendance);
      
      toast({
        title: "Attendance recorded",
        description: `Attendance recorded for ${attendance.date}`,
      });
      
      return true;
    } catch (error: any) {
      console.error('Error recording attendance:', error);
      toast({
        title: "Failed to record attendance",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  },
  
  // Calculate payroll
  calculatePayroll: async (staffId: string, startDate: string, endDate: string): Promise<{hours: number, amount: number}> => {
    try {
      // Mock payroll calculation
      // In real implementation, this would calculate based on worked hours and rates
      const hours = 40; // Example: 40 hours worked
      const hourlyRate = 12; // Example: $12 per hour
      
      return {
        hours,
        amount: hours * hourlyRate
      };
    } catch (error: any) {
      console.error('Error calculating payroll:', error);
      return { hours: 0, amount: 0 };
    }
  }
};
