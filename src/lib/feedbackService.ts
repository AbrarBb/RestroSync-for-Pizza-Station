
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { safeQuery, safeCast } from "./supabaseHelper";

export interface OrderFeedback {
  id: string;
  order_id: string;
  customer_id: string;
  customer_name: string;
  rating: number; // 1-5
  review: string;
  created_at: string;
  response?: FeedbackResponse;
  images?: string[];
}

export interface FeedbackResponse {
  id: string;
  feedback_id: string;
  staff_id: string;
  staff_name: string;
  response: string;
  created_at: string;
}

export const feedbackService = {
  // Submit order feedback
  submitFeedback: async (feedback: Omit<OrderFeedback, 'id' | 'created_at' | 'response'>): Promise<boolean> => {
    try {
      // In real implementation, this would insert into a feedback table
      console.log('Submitting feedback:', feedback);
      
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Failed to submit feedback",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  },
  
  // Get feedback for an order
  getOrderFeedback: async (orderId: string): Promise<OrderFeedback | null> => {
    try {
      // Mock data - would be replaced with actual DB call
      return {
        id: 'feedback-1',
        order_id: orderId,
        customer_id: 'customer-1',
        customer_name: 'John Doe',
        rating: 4,
        review: 'The food was delicious and delivery was prompt. Highly recommended!',
        created_at: new Date().toISOString(),
        images: []
      };
    } catch (error: any) {
      console.error('Error fetching order feedback:', error);
      return null;
    }
  },
  
  // Get all customer feedback (for admin dashboard)
  getAllFeedback: async (page: number = 1, limit: number = 10): Promise<{
    feedback: OrderFeedback[];
    total: number;
  }> => {
    try {
      // Mock data - would be replaced with actual DB call with pagination
      const mockFeedback: OrderFeedback[] = [
        {
          id: 'feedback-1',
          order_id: 'order-1',
          customer_id: 'customer-1',
          customer_name: 'John Doe',
          rating: 5,
          review: 'Amazing food and quick delivery!',
          created_at: '2025-05-09T14:30:00Z',
          response: {
            id: 'response-1',
            feedback_id: 'feedback-1',
            staff_id: 'staff-1',
            staff_name: 'Manager',
            response: 'Thank you for your wonderful feedback!',
            created_at: '2025-05-09T16:00:00Z'
          }
        },
        {
          id: 'feedback-2',
          order_id: 'order-2',
          customer_id: 'customer-2',
          customer_name: 'Alice Smith',
          rating: 4,
          review: 'Great food but delivery was a bit late.',
          created_at: '2025-05-08T18:45:00Z'
        },
        {
          id: 'feedback-3',
          order_id: 'order-3',
          customer_id: 'customer-3',
          customer_name: 'Bob Johnson',
          rating: 3,
          review: 'Food was okay but missing items from my order.',
          created_at: '2025-05-07T12:15:00Z',
          response: {
            id: 'response-2',
            feedback_id: 'feedback-3',
            staff_id: 'staff-1',
            staff_name: 'Manager',
            response: 'We apologize for the inconvenience. Please contact us for a refund on the missing items.',
            created_at: '2025-05-07T14:30:00Z'
          }
        }
      ];
      
      return {
        feedback: mockFeedback,
        total: mockFeedback.length
      };
    } catch (error: any) {
      console.error('Error fetching all feedback:', error);
      return {
        feedback: [],
        total: 0
      };
    }
  },
  
  // Respond to feedback (for staff/admin)
  respondToFeedback: async (
    feedbackId: string, 
    staffId: string, 
    staffName: string, 
    responseText: string
  ): Promise<boolean> => {
    try {
      // In real implementation, this would insert a response into the database
      console.log(`Staff ${staffName} responding to feedback ${feedbackId}:`, responseText);
      
      toast({
        title: "Response submitted",
        description: "Your response has been submitted.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error responding to feedback:', error);
      toast({
        title: "Failed to submit response",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  },
  
  // Get average rating stats
  getRatingStats: async (): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingCounts: {[key: number]: number}
  }> => {
    try {
      // Mock data - would be calculated from actual DB in production
      return {
        averageRating: 4.2,
        totalReviews: 157,
        ratingCounts: {
          1: 5,
          2: 8,
          3: 22,
          4: 56,
          5: 66
        }
      };
    } catch (error: any) {
      console.error('Error fetching rating stats:', error);
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingCounts: {}
      };
    }
  }
};
