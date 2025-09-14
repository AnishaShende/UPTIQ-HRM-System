import React from "react";
import {
  Users,
  Settings,
  Shield,
  Database,
  BarChart3,
  Bell,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { Card, ListCard, ListItem, StatsCard } from "@/components/ui/Card";

export const AdminPanelPage: React.FC = () => {
  // Mock admin data
  const adminStats = [
    {
      title: "Total Users",
      value: "247",
      subtitle: "+12 this month",
      icon: Users,
      variant: "blue" as const,
    },
    {
      title: "Active Sessions",
      value: "89",
      subtitle: "Currently online",
      icon: Activity,
      variant: "green" as const,
    },
    {
      title: "System Alerts",
      value: "3",
      subtitle: "Requires attention",
      icon: AlertTriangle,
      variant: "orange" as const,
    },
    {
      title: "Database Size",
      value: "2.4GB",
      subtitle: "+15% this month",
      icon: Database,
      variant: "purple" as const,
    },
  ];

  const recentActivities = [
    {
      id: 1,
      action: "User Login",
      user: "john.doe@uptiq.com",
      timestamp: "2 minutes ago",
      status: "success",
    },
    {
      id: 2,
      action: "Password Reset",
      user: "sarah.wilson@uptiq.com",
      timestamp: "15 minutes ago",
      status: "success",
    },
    {
      id: 3,
      action: "Failed Login Attempt",
      user: "unknown@example.com",
      timestamp: "1 hour ago",
      status: "warning",
    },
    {
      id: 4,
      action: "System Backup",
      user: "system",
      timestamp: "2 hours ago",
      status: "success",
    },
  ];

  const systemAlerts = [
    {
      id: 1,
      type: "warning",
      title: "High CPU Usage",
      message: "Server CPU usage is above 80%",
      timestamp: "5 minutes ago",
    },
    {
      id: 2,
      type: "error",
      title: "Database Connection Error",
      message: "Failed to connect to primary database",
      timestamp: "1 hour ago",
    },
    {
      id: 3,
      type: "info",
      title: "Scheduled Maintenance",
      message: "System maintenance scheduled for tonight",
      timestamp: "3 hours ago",
    },
  ];

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-accent-success";
      case "warning":
        return "text-accent-warning";
      case "error":
        return "text-accent-error";
      default:
        return "text-text-secondary";
    }
  };

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-accent-warning bg-opacity-10 text-accent-warning";
      case "error":
        return "bg-accent-error bg-opacity-10 text-accent-error";
      case "info":
        return "bg-accent-info bg-opacity-10 text-accent-info";
      default:
        return "bg-neutral-background text-text-secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Admin Panel</h1>
          <p className="text-text-secondary mt-1">
            System administration and monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-accent-success rounded-full"></div>
          <span className="text-sm text-text-secondary">System Online</span>
        </div>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {adminStats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
            variant={stat.variant}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Alerts */}
        <div className="lg:col-span-1">
          <ListCard title="System Alerts">
            {systemAlerts.map((alert) => (
              <ListItem key={alert.id}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-neutral-background rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 text-text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-text-primary">
                        {alert.title}
                      </p>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getAlertTypeColor(alert.type)}`}
                      >
                        {alert.type}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary">
                      {alert.message}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      {alert.timestamp}
                    </p>
                  </div>
                </div>
              </ListItem>
            ))}
          </ListCard>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <ListCard title="Recent Activities">
            {recentActivities.map((activity) => (
              <ListItem key={activity.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-neutral-background rounded-lg flex items-center justify-center">
                      <Activity className="w-4 h-4 text-text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {activity.action}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {activity.user}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-xs ${getActivityStatusColor(activity.status)}`}
                    >
                      {activity.status}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              </ListItem>
            ))}
          </ListCard>
        </div>
      </div>

      {/* Admin Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-primary-blue-light rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-primary-blue-dark" />
          </div>
          <h3 className="font-semibold text-text-primary mb-2">
            User Management
          </h3>
          <p className="text-sm text-text-secondary">
            Manage user accounts and permissions
          </p>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-primary-green-light rounded-lg flex items-center justify-center mx-auto mb-4">
            <Settings className="w-6 h-6 text-primary-green-dark" />
          </div>
          <h3 className="font-semibold text-text-primary mb-2">
            System Settings
          </h3>
          <p className="text-sm text-text-secondary">
            Configure system parameters
          </p>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-primary-orange-light rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-primary-orange-dark" />
          </div>
          <h3 className="font-semibold text-text-primary mb-2">Security</h3>
          <p className="text-sm text-text-secondary">
            Security settings and logs
          </p>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-primary-purple-light rounded-lg flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-6 h-6 text-primary-purple-dark" />
          </div>
          <h3 className="font-semibold text-text-primary mb-2">Analytics</h3>
          <p className="text-sm text-text-secondary">
            System performance metrics
          </p>
        </Card>
      </div>

      {/* System Status */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-6">
          System Status
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-accent-success bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Database className="w-8 h-8 text-accent-success" />
            </div>
            <h4 className="font-medium text-text-primary">Database</h4>
            <p className="text-sm text-accent-success">Operational</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-accent-success bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Activity className="w-8 h-8 text-accent-success" />
            </div>
            <h4 className="font-medium text-text-primary">API Services</h4>
            <p className="text-sm text-accent-success">Operational</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-accent-warning bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Bell className="w-8 h-8 text-accent-warning" />
            </div>
            <h4 className="font-medium text-text-primary">Notifications</h4>
            <p className="text-sm text-accent-warning">Degraded</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
