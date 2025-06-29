
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SecurityEvent {
  id: string;
  event_type: 'login_attempt' | 'unauthorized_access' | 'data_access' | 'profile_update';
  severity: 'low' | 'medium' | 'high';
  description: string;
  user_email?: string;
  timestamp: string;
  status: 'resolved' | 'pending' | 'investigating';
}

const SecurityAudit = () => {
  const { userRole } = useAuth();
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock security events for demonstration
  useEffect(() => {
    if (userRole === 'admin') {
      setSecurityEvents([
        {
          id: '1',
          event_type: 'login_attempt',
          severity: 'medium',
          description: 'Multiple failed login attempts detected',
          user_email: 'suspicious@example.com',
          timestamp: new Date().toISOString(),
          status: 'pending'
        },
        {
          id: '2',
          event_type: 'unauthorized_access',
          severity: 'high',
          description: 'Attempt to access admin panel without proper role',
          user_email: 'customer@example.com',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'investigating'
        },
        {
          id: '3',
          event_type: 'profile_update',
          severity: 'low',
          description: 'Customer profile updated successfully',
          user_email: 'user@example.com',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: 'resolved'
        }
      ]);
    }
  }, [userRole]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'investigating': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (userRole !== 'admin') {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <Shield className="h-5 w-5" />
            <span>Access denied. Admin privileges required.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityEvents.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No security events recorded.</p>
              </div>
            ) : (
              securityEvents.map((event) => (
                <div key={event.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(event.status)}
                      <span className="font-medium">{event.event_type.replace('_', ' ').toUpperCase()}</span>
                      <Badge className={getSeverityColor(event.severity)}>
                        {event.severity}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  <p className="text-sm mb-2">{event.description}</p>
                  
                  {event.user_email && (
                    <p className="text-xs text-muted-foreground mb-2">
                      User: {event.user_email}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="capitalize">
                      {event.status}
                    </Badge>
                    
                    {event.status === 'pending' && (
                      <Button variant="outline" size="sm">
                        Investigate
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Row Level Security (RLS) is enabled on all tables</span>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Input sanitization is implemented</span>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Role-based access control is active</span>
            </div>
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Consider implementing rate limiting for API endpoints</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityAudit;
