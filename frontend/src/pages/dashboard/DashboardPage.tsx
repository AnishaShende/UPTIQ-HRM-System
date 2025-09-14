import React from 'react';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  UserPlus
} from 'lucide-react';
import { StatsCard, ListCard, ListItem } from '@/components/ui/Card';
import { Card } from '@/components/ui/Card';

export const DashboardPage: React.FC = () => {
  // Mock data
  const stats = [
    {
      title: 'Total Employees',
      value: '247',
      subtitle: '+12 this month',
      icon: Users,
      variant: 'blue' as const,
    },
    {
      title: 'Active Projects',
      value: '18',
      subtitle: '3 completed this week',
      icon: CheckCircle,
      variant: 'green' as const,
    },
    {
      title: 'Pending Leaves',
      value: '23',
      subtitle: '5 urgent approvals',
      icon: Calendar,
      variant: 'orange' as const,
    },
    {
      title: 'Monthly Payroll',
      value: '$2.4M',
      subtitle: '+8% from last month',
      icon: DollarSign,
      variant: 'purple' as const,
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'leave',
      message: 'Sarah Johnson requested 3 days leave',
      time: '2 hours ago',
      status: 'pending',
    },
    {
      id: 2,
      type: 'hire',
      message: 'New employee John Smith joined',
      time: '4 hours ago',
      status: 'completed',
    },
    {
      id: 3,
      type: 'payroll',
      message: 'Payroll processed for 247 employees',
      time: '1 day ago',
      status: 'completed',
    },
    {
      id: 4,
      type: 'urgent',
      message: 'IT Security policy update required',
      time: '2 days ago',
      status: 'urgent',
    },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Team Meeting',
      date: 'Today, 2:00 PM',
      type: 'meeting',
    },
    {
      id: 2,
      title: 'Performance Review',
      date: 'Tomorrow, 10:00 AM',
      type: 'review',
    },
    {
      id: 3,
      title: 'Company All-Hands',
      date: 'Friday, 3:00 PM',
      type: 'company',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'leave':
        return Calendar;
      case 'hire':
        return UserPlus;
      case 'payroll':
        return DollarSign;
      case 'urgent':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-accent-success';
      case 'pending':
        return 'text-accent-warning';
      case 'urgent':
        return 'text-accent-error';
      default:
        return 'text-text-secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
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
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <ListCard title="Recent Activities">
            {recentActivities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <ListItem key={activity.id}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-neutral-background rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary">{activity.message}</p>
                      <p className={`text-xs mt-1 ${getActivityColor(activity.status)}`}>
                        {activity.time}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      activity.status === 'completed' ? 'bg-accent-success bg-opacity-10 text-accent-success' :
                      activity.status === 'pending' ? 'bg-accent-warning bg-opacity-10 text-accent-warning' :
                      'bg-accent-error bg-opacity-10 text-accent-error'
                    }`}>
                      {activity.status}
                    </div>
                  </div>
                </ListItem>
              );
            })}
          </ListCard>
        </div>

        {/* Upcoming Events */}
        <div>
          <ListCard title="Upcoming Events">
            {upcomingEvents.map((event) => (
              <ListItem key={event.id}>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary-green-dark rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">{event.title}</p>
                    <p className="text-xs text-text-secondary">{event.date}</p>
                  </div>
                </div>
              </ListItem>
            ))}
          </ListCard>

          {/* Quick Actions */}
          <Card className="mt-6 p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-primary-green-light hover:bg-primary-green-medium transition-colors duration-200">
                <UserPlus className="w-5 h-5 text-primary-green-dark" />
                <span className="text-sm font-medium text-primary-green-dark">Add New Employee</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-primary-blue-light hover:bg-primary-blue-medium transition-colors duration-200">
                <Calendar className="w-5 h-5 text-primary-blue-dark" />
                <span className="text-sm font-medium text-primary-blue-dark">Request Leave</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-primary-purple-light hover:bg-primary-purple-medium transition-colors duration-200">
                <DollarSign className="w-5 h-5 text-primary-purple-dark" />
                <span className="text-sm font-medium text-primary-purple-dark">View Payroll</span>
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Team Performance Overview</h3>
        <div className="h-64 bg-neutral-background rounded-lg flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-text-muted mx-auto mb-2" />
            <p className="text-text-secondary">Performance chart will be displayed here</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
