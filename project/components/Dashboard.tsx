import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { 
  Users, 
  Calendar, 
  Briefcase, 
  MessageSquare,
  Star,
  ArrowUp,
  Eye,
  FileText,
  CreditCard,
  Zap,
  BarChart3
} from 'lucide-react';

const statsData = [
  { 
    title: 'Total Employees', 
    value: '289', 
    icon: Users, 
    bgColor: 'bg-[#e9d8fd]',
    iconColor: 'text-[#553c9a]'
  },
  { 
    title: 'On Leave', 
    value: '08', 
    icon: Calendar, 
    bgColor: 'bg-[#c6f6d5]',
    iconColor: 'text-[#276749]'
  },
  { 
    title: 'Hiring Roles', 
    value: '03', 
    icon: Briefcase, 
    bgColor: 'bg-[#fed7cc]',
    iconColor: 'text-[#c05621]'
  },
  { 
    title: 'Requests', 
    value: '28', 
    icon: MessageSquare, 
    bgColor: 'bg-[#bee3f8]',
    iconColor: 'text-[#2b6cb0]'
  },
];

const pieData = [
  { name: 'Finance', value: 122, color: '#bee3f8' },
  { name: 'India', value: 27, color: '#fed7cc' },
  { name: 'USA', value: 36, color: '#c6f6d5' },
  { name: 'Remote', value: 14, color: '#e9d8fd' },
];

const newsEvents = [
  {
    id: 1,
    title: 'Board Meeting',
    subtitle: 'Board Meeting',
    date: '24 Aug',
    color: 'bg-[#e9d8fd]'
  },
  {
    id: 2,
    title: 'Holiday - India',
    subtitle: 'Enjoy Ganesh trip - India',
    date: '24 Aug',
    color: 'bg-[#c6f6d5]'
  },
  {
    id: 3,
    title: 'New Joinee',
    subtitle: 'Welcome Joining, glad to work',
    date: '15 Aug',
    color: 'bg-[#fed7cc]'
  },
  {
    id: 4,
    title: 'New Joinee',
    subtitle: 'Welcome Sarvesh; Fly and high',
    date: '16 Aug',
    color: 'bg-[#bee3f8]'
  },
  {
    id: 5,
    title: 'Work Anniversary',
    subtitle: 'Enjoy Work anniversary + CTC',
    date: '24 Aug',
    color: 'bg-[#e9d8fd]'
  },
  {
    id: 6,
    title: 'Policy Update',
    subtitle: 'Happy Announcement + CTC',
    date: '24 Aug',
    color: 'bg-[#c6f6d5]'
  },
];

const hiringApplications = [
  {
    id: 1,
    name: 'Krist Hansen',
    role: 'HR Manager',
    avatar: '/api/placeholder/40/40',
    status: 'Interview',
    statusColor: 'bg-blue-100 text-blue-700'
  },
  {
    id: 2,
    name: 'Harper Lee',
    role: 'Finance',
    avatar: '/api/placeholder/40/40',
    status: 'Contract Sent',
    statusColor: 'bg-orange-100 text-orange-700'
  },
  {
    id: 3,
    name: 'Francis Degas',
    role: 'Finance',
    avatar: '/api/placeholder/40/40',
    status: 'Front End Developer',
    statusColor: 'bg-green-100 text-green-700'
  },
  {
    id: 4,
    name: 'Leonora Carrington',
    role: 'UX',
    avatar: '/api/placeholder/40/40',
    status: 'Product Manager',
    statusColor: 'bg-purple-100 text-purple-700'
  },
  {
    id: 5,
    name: 'Andrew Hunt..M',
    role: 'PM',
    avatar: '/api/placeholder/40/40',
    status: 'Contract Sent',
    statusColor: 'bg-orange-100 text-orange-700'
  },
];

const hiringUpdates = [
  { label: 'Shortlisted Candidates', hasIcon: true },
  { label: 'Upcoming Interviews', hasIcon: true },
  { label: 'Rejected Applications', hasIcon: true },
];

const quickActions = [
  { icon: Eye, label: 'Directory', color: 'text-purple-600' },
  { icon: CreditCard, label: 'Payments', color: 'text-blue-600' },
  { icon: ArrowUp, label: 'Payslips', color: 'text-gray-600' },
  { icon: FileText, label: 'T Support', color: 'text-gray-600' },
  { icon: Zap, label: 'PRA', color: 'text-gray-600' },
  { icon: BarChart3, label: 'Integration', color: 'text-gray-600' },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-2xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Employee Distribution</h3>
                <Button variant="ghost" size="sm" className="text-gray-500">
                  <Star className="w-4 h-4" />
                </Button>
              </div>
              <div className="h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">289</div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-gray-600">{item.name}</span>
                    <span className="text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* News & Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">News & Events</h3>
                <Button variant="ghost" size="sm" className="text-gray-500">
                  <Star className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {newsEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className={`w-8 h-8 ${event.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <span className="text-xs font-medium">{event.date.split(' ')[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{event.title}</p>
                      <p className="text-xs text-gray-500 truncate">{event.subtitle}</p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{event.date.split(' ')[1]}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      <action.icon className={`w-5 h-5 ${action.color}`} />
                    </div>
                    <span className="text-xs text-gray-600 text-center">{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hiring Applications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Hiring Applications</h3>
                <Button 
                  size="sm" 
                  className="bg-[#9AE6B4] hover:bg-[#7dd69e] text-gray-800 rounded-xl"
                >
                  Share
                </Button>
              </div>
              <div className="space-y-3">
                {hiringApplications.map((application, index) => (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={application.avatar} />
                      <AvatarFallback>{application.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{application.name}</p>
                      <p className="text-xs text-gray-500">{application.role}</p>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`${application.statusColor} border-0 rounded-lg`}
                    >
                      {application.status}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Hiring Updates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Hiring Updates</h3>
              <div className="space-y-4">
                {hiringUpdates.map((update, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <span className="text-sm text-gray-700">{update.label}</span>
                    {update.hasIcon && (
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <Star className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}