
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { OrderFeedback } from '@/lib/feedbackService';

interface FeedbackDisplayProps {
  feedback: OrderFeedback[];
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ feedback }) => {
  if (feedback.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        No feedback available yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedback.map((item) => (
        <Card key={item.id} className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{item.customer_name}</span>
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < item.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(item.created_at).toLocaleDateString()}
              </span>
            </div>
            
            {item.review && (
              <p className="text-gray-700 mb-3">{item.review}</p>
            )}
            
            {item.response && (
              <div className="bg-gray-50 p-3 rounded-md border-l-2 border-l-green-500">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-green-700">
                    Response from {item.response.staff_name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(item.response.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{item.response.response}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FeedbackDisplay;
