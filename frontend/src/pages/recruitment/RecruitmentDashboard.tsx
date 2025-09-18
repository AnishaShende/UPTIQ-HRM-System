import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  PlusCircle, 
  Users, 
  Briefcase, 
  Clock, 
  TrendingUp,
  Calendar,
  Target,
  UserCheck,
  FileText,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  useRecruitmentOverview, 
  useFunnelStats, 
  useJobPostings, 
  useApplications 
} from '@/hooks/useRecruitment';
import { format, subDays } from 'date-fns';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  onClick
}) => (
  <Card 
    className={`${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    onClick={onClick}
  >
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
      {trend && (
        <p className={`text-xs mt-1 flex items-center ${
          trend.isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend.isPositive ? '↗️' : '↘️'} {Math.abs(trend.value)}% from last month
        </p>
      )}
    </CardContent>
  </Card>
);

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'outline';
}

const QuickAction: React.FC<QuickActionProps> = ({
  title,
  description,
  icon,
  onClick,
  variant = 'default'
}) => (
  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
    <CardContent className="flex items-center space-x-4 p-4">
      <div className={`rounded-lg p-2 ${
        variant === 'default' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
      }`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </CardContent>
  </Card>
);

interface RecentActivityItemProps {
  title: string;
  description: string;
  time: string;
  type: 'application' | 'interview' | 'offer' | 'hiring';
}

const RecentActivityItem: React.FC<RecentActivityItemProps> = ({
  title,
  description,
  time,
  type
}) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'application': return 'bg-blue-100 text-blue-800';
      case 'interview': return 'bg-yellow-100 text-yellow-800';
      case 'offer': return 'bg-purple-100 text-purple-800';
      case 'hiring': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
      <div className={`w-2 h-2 rounded-full mt-2 ${getTypeColor(type).split(' ')[0]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
      <Badge variant="secondary" className={`text-xs ${getTypeColor(type)}`}>
        {type}
      </Badge>
    </div>
  );
};

const RecruitmentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('30'); // days
  
  // Calculate date range for queries
  const endDate = new Date();
  const startDate = subDays(endDate, parseInt(dateRange));
  
  const dateParams = {
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd')
  };

  // Fetch data using React Query hooks
  const { data: overview, isLoading: overviewLoading } = useRecruitmentOverview(dateParams);
  const { data: funnelData, isLoading: funnelLoading } = useFunnelStats(dateParams);
  const { data: jobPostings, isLoading: jobsLoading } = useJobPostings({ 
    limit: 5, 
    sortBy: 'createdAt', 
    sortOrder: 'desc' 
  });
  const { data: recentApplications, isLoading: applicationsLoading } = useApplications({ 
    limit: 5, 
    sortBy: 'appliedAt', 
    sortOrder: 'desc' 
  });

  // Mock data for fallback
  const mockOverview = {
    totalJobPostings: 24,
    activeJobPostings: 18,
    totalApplicants: 142,
    totalApplications: 256,
    averageTimeToHire: 21,
    hireRate: 8.5,
    interviewRate: 15.2,
    offerAcceptanceRate: 78.5
  };

  const mockFunnel = {
    submitted: 256,
    underReview: 89,
    interviewed: 45,
    offerExtended: 18,
    hired: 12,
    rejected: 167
  };

  const stats = overview?.data || mockOverview;
  const funnel = funnelData?.data?.stages || Object.entries(mockFunnel).map(([stage, count]) => ({
    stage: stage.toUpperCase(),
    count,
    percentage: (count / mockFunnel.submitted) * 100
  }));

  // Mock recent activity
  const recentActivity = [
    {
      title: "New Application Received",
      description: "John Doe applied for Senior Software Engineer",
      time: "2 hours ago",
      type: "application" as const
    },
    {
      title: "Interview Scheduled",
      description: "Technical interview with Sarah Johnson",
      time: "4 hours ago",
      type: "interview" as const
    },
    {
      title: "Offer Extended",
      description: "Offer sent to Michael Chen for Product Manager role",
      time: "1 day ago",
      type: "offer" as const
    },
    {
      title: "New Hire",
      description: "Emma Wilson joined as UX Designer",
      time: "2 days ago",
      type: "hiring" as const
    }
  ];

  const isLoading = overviewLoading || funnelLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recruitment Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your recruitment activities and performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => navigate('/recruitment/jobs/new')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Job Posting
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Active Job Postings"
          value={stats.activeJobPostings}
          icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
          description="Currently open positions"
          onClick={() => navigate('/recruitment/jobs')}
        />
        <DashboardCard
          title="Total Applications"
          value={stats.totalApplications}
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          description="Applications received"
          trend={{ value: 12, isPositive: true }}
          onClick={() => navigate('/recruitment/applications')}
        />
        <DashboardCard
          title="Candidates in Pipeline"
          value={stats.totalApplicants}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description="Active candidates"
          onClick={() => navigate('/recruitment/candidates')}
        />
        <DashboardCard
          title="Avg. Time to Hire"
          value={`${stats.averageTimeToHire} days`}
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          description="From application to offer"
          trend={{ value: 8, isPositive: false }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <QuickAction
              title="Post New Job"
              description="Create and publish a new job posting"
              icon={<PlusCircle className="h-5 w-5" />}
              onClick={() => navigate('/recruitment/jobs/new')}
            />
            <QuickAction
              title="Review Applications"
              description="Check pending applications for review"
              icon={<UserCheck className="h-5 w-5" />}
              onClick={() => navigate('/recruitment/applications?status=UNDER_REVIEW')}
              variant="outline"
            />
            <QuickAction
              title="Schedule Interviews"
              description="Manage upcoming interviews"
              icon={<Calendar className="h-5 w-5" />}
              onClick={() => navigate('/recruitment/interviews')}
              variant="outline"
            />
            <QuickAction
              title="View Reports"
              description="Analyze recruitment metrics and trends"
              icon={<TrendingUp className="h-5 w-5" />}
              onClick={() => navigate('/recruitment/reports')}
              variant="outline"
            />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {recentActivity.map((activity, index) => (
                <RecentActivityItem
                  key={index}
                  title={activity.title}
                  description={activity.description}
                  time={activity.time}
                  type={activity.type}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="funnel" className="space-y-4">
        <TabsList>
          <TabsTrigger value="funnel">Hiring Funnel</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="recent">Recent Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="funnel">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5" />
                Hiring Funnel Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {funnel.map((stage, index) => (
                    <div key={stage.stage} className="flex items-center space-x-4">
                      <div className="w-24 text-sm font-medium">
                        {stage.stage.replace('_', ' ')}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-200 rounded-full h-6 relative">
                          <div 
                            className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${stage.percentage}%` }}
                          >
                            <span className="text-white text-xs font-medium">
                              {stage.count}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-16 text-right text-sm text-muted-foreground">
                        {stage.percentage.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Hire Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.hireRate}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Applications to hires
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Interview Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.interviewRate}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Applications to interviews
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Offer Acceptance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {stats.offerAcceptanceRate}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Offers accepted
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Job Postings</CardTitle>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {(jobPostings?.data?.data || []).slice(0, 5).map((job: any) => (
                    <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {job.department} • {job.location}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          job.status === 'PUBLISHED' ? 'default' : 
                          job.status === 'DRAFT' ? 'secondary' : 'outline'
                        }>
                          {job.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {job._count?.applications || 0} applications
                        </span>
                      </div>
                    </div>
                  ))}
                  {(!jobPostings?.data?.data || jobPostings.data.data.length === 0) && (
                    <p className="text-center text-muted-foreground py-8">
                      No recent job postings found
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecruitmentDashboard;
