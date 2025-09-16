import React, { useState } from 'react';
import { Plus, Search, Filter, MapPin, Clock, Users, Eye, Edit, Trash2 } from 'lucide-react';
import { Card, ListCard, ListItem } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const RecruitmentPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock job postings data
  const jobPostings = [
    {
      id: 1,
      title: 'Senior Software Engineer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      type: 'Full-time',
      experience: '5+ years',
      applicants: 24,
      status: 'active',
      postedDate: '2024-12-15',
      salary: '$120,000 - $150,000',
    },
    {
      id: 2,
      title: 'Product Manager',
      department: 'Product',
      location: 'New York, NY',
      type: 'Full-time',
      experience: '3+ years',
      applicants: 18,
      status: 'active',
      postedDate: '2024-12-10',
      salary: '$100,000 - $130,000',
    },
    {
      id: 3,
      title: 'UX Designer',
      department: 'Design',
      location: 'Remote',
      type: 'Full-time',
      experience: '2+ years',
      applicants: 32,
      status: 'closed',
      postedDate: '2024-11-28',
      salary: '$80,000 - $100,000',
    },
    {
      id: 4,
      title: 'Marketing Specialist',
      department: 'Marketing',
      location: 'Chicago, IL',
      type: 'Full-time',
      experience: '1+ years',
      applicants: 15,
      status: 'draft',
      postedDate: '2024-12-20',
      salary: '$60,000 - $80,000',
    },
  ];

  const departments = [
    { value: 'all', label: 'All Departments' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'product', label: 'Product' },
    { value: 'design', label: 'Design' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
  ];

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'closed', label: 'Closed' },
    { value: 'draft', label: 'Draft' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-accent-success bg-opacity-10 text-accent-success';
      case 'closed':
        return 'bg-accent-error bg-opacity-10 text-accent-error';
      case 'draft':
        return 'bg-accent-warning bg-opacity-10 text-accent-warning';
      default:
        return 'bg-neutral-background text-text-secondary';
    }
  };

  const filteredJobs = jobPostings.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || 
                             job.department.toLowerCase() === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || job.status === selectedStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Recruitment</h1>
          <p className="text-text-secondary mt-1">Manage job postings and applications</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Post New Job
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Active Jobs</p>
              <p className="text-2xl font-bold text-text-primary">12</p>
            </div>
            <div className="w-12 h-12 bg-primary-green-light rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-green-dark" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Applications</p>
              <p className="text-2xl font-bold text-text-primary">89</p>
            </div>
            <div className="w-12 h-12 bg-primary-blue-light rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-blue-dark" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Interviews Scheduled</p>
              <p className="text-2xl font-bold text-text-primary">23</p>
            </div>
            <div className="w-12 h-12 bg-primary-orange-light rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary-orange-dark" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Hired This Month</p>
              <p className="text-2xl font-bold text-text-primary">5</p>
            </div>
            <div className="w-12 h-12 bg-primary-purple-light rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-purple-dark" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
              <Input
                placeholder="Search job postings..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={selectedDepartment}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedDepartment(e.target.value)}
              className="min-w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {departments.map(dept => (
                <option key={dept.value} value={dept.value}>{dept.label}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedStatus(e.target.value)}
              className="min-w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Job Postings */}
      <ListCard title="Job Postings">
        {filteredJobs.map((job) => (
          <ListItem key={job.id}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-blue-light rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-primary-blue-dark" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-text-primary">{job.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-text-secondary">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span>{job.type}</span>
                      <span>{job.experience}</span>
                      <span className="font-medium text-primary-green-dark">{job.salary}</span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      Posted on {job.postedDate} • {job.applicants} applicants
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </ListItem>
        ))}
      </ListCard>

      {/* Recent Applications */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-primary">Recent Applications</h3>
          <Button variant="outline" size="sm">View All</Button>
        </div>
        
        <div className="space-y-4">
          {[
            { name: 'Sarah Johnson', position: 'Senior Software Engineer', status: 'Interview Scheduled', date: '2 days ago' },
            { name: 'Michael Chen', position: 'Product Manager', status: 'Under Review', date: '3 days ago' },
            { name: 'Emily Davis', position: 'UX Designer', status: 'Hired', date: '1 week ago' },
          ].map((application, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-neutral-background rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-green-light rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-green-dark">
                    {application.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-text-primary">{application.name}</p>
                  <p className="text-sm text-text-secondary">{application.position}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-text-primary">{application.status}</p>
                <p className="text-xs text-text-secondary">{application.date}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
