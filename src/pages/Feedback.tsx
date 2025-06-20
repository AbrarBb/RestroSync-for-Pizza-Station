
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { feedbackService } from '@/lib/feedbackService';
import FeedbackDisplay from '@/components/feedback/FeedbackDisplay';
import { Loader2 } from 'lucide-react';

const Feedback = () => {
  const { data: feedbackData, isLoading } = useQuery({
    queryKey: ['allFeedback'],
    queryFn: () => feedbackService.getAllFeedback(),
  });

  const { data: stats } = useQuery({
    queryKey: ['ratingStats'],
    queryFn: () => feedbackService.getRatingStats(),
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Customer Feedback</h1>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
                <p className="text-sm text-gray-500">Average Rating</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.totalReviews}</div>
                <p className="text-sm text-gray-500">Total Reviews</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.ratingCounts[5] || 0}</div>
                <p className="text-sm text-gray-500">5-Star Reviews</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {Math.round(((stats.ratingCounts[4] || 0) + (stats.ratingCounts[5] || 0)) / stats.totalReviews * 100)}%
                </div>
                <p className="text-sm text-gray-500">Positive Reviews</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Feedback List */}
        <Card>
          <CardHeader>
            <CardTitle>All Customer Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <FeedbackDisplay feedback={feedbackData?.feedback || []} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Feedback;
