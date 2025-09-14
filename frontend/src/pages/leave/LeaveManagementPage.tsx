import React, { useState } from 'react';
import { Plus, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, ListCard, ListItem, StatsCard } from '@/components/ui/Card';
import { Button, Input, Select, Textarea } from '@/components/ui/Form';

export const LeaveManagementPage: React.FC = () => {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    emergencyContact: '',
  });

  // Mock leave balance data
  const leaveBalance = {
    annual: { total: 20, used: 8, remaining: 12 },
    sick: { total: 10, used: 3, remaining: 7 },
    personal: { total: 5, used: 2, remaining: 3 },
    emergency: { total: 3, used: 0, remaining: 3 },
  };

  // Mock leave requests
  const leaveRequests = [
    {
      id: 1,
      type: 'Annual Leave',
      startDate: '2024-12-25',
      endDate: '2024-12-27',
      days: 3,
      reason: 'Family vacation',
      status: 'pending',
      submittedDate: '2024-12-20',
    },
    {
      id: 2,
      type: 'Sick Leave',
      startDate: '2024-12-18',
      endDate: '2024-12-18',
      days: 1,
      reason: 'Doctor appointment',
      status: 'approved',
      submittedDate: '2024-12-17',
    },
    {
      id: 3,
      type: 'Personal Leave',
      startDate: '2024-12-10',
      endDate: '2024-12-10',
      days: 1,
      reason: 'Personal matters',
      status: 'rejected',
      submittedDate: '2024-12-09',
    },
  ];

  const leaveTypes = [
    { value: '', label: 'Select leave type' },
    { value: 'annual', label: 'Annual Leave' },
    { value: 'sick', label: 'Sick Leave' },
    { value: 'personal', label: 'Personal Leave' },
    { value: 'emergency', label: 'Emergency Leave' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-accent-success bg-opacity-10 text-accent-success';
      case 'pending':
        return 'bg-accent-warning bg-opacity-10 text-accent-warning';
      case 'rejected':
        return 'bg-accent-error bg-opacity-10 text-accent-error';
      default:
        return 'bg-neutral-background text-text-secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return CheckCircle;
      case 'pending':
        return Clock;
      case 'rejected':
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Leave request submitted:', requestForm);
    setShowRequestForm(false);
    setRequestForm({
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: '',
      emergencyContact: '',
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setRequestForm({
      ...requestForm,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Leave Management</h1>
          <p className="text-text-secondary mt-1">Manage your leave requests and balance</p>
        </div>
        <Button onClick={() => setShowRequestForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Request Leave
        </Button>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Annual Leave"
          value={`${leaveBalance.annual.remaining}/${leaveBalance.annual.total}`}
          subtitle={`${leaveBalance.annual.used} days used`}
          icon={Calendar}
          variant="green"
        />
        <StatsCard
          title="Sick Leave"
          value={`${leaveBalance.sick.remaining}/${leaveBalance.sick.total}`}
          subtitle={`${leaveBalance.sick.used} days used`}
          icon={Calendar}
          variant="blue"
        />
        <StatsCard
          title="Personal Leave"
          value={`${leaveBalance.personal.remaining}/${leaveBalance.personal.total}`}
          subtitle={`${leaveBalance.personal.used} days used`}
          icon={Calendar}
          variant="orange"
        />
        <StatsCard
          title="Emergency Leave"
          value={`${leaveBalance.emergency.remaining}/${leaveBalance.emergency.total}`}
          subtitle={`${leaveBalance.emergency.used} days used`}
          icon={Calendar}
          variant="purple"
        />
      </div>

      {/* Leave Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-text-primary">Request Leave</h3>
              <button
                onClick={() => setShowRequestForm(false)}
                className="text-text-secondary hover:text-text-primary"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <Select
                label="Leave Type"
                name="leaveType"
                value={requestForm.leaveType}
                onChange={handleFormChange}
                options={leaveTypes}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={requestForm.startDate}
                  onChange={handleFormChange}
                  required
                />
                <Input
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={requestForm.endDate}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <Textarea
                label="Reason"
                name="reason"
                value={requestForm.reason}
                onChange={handleFormChange}
                rows={3}
                placeholder="Please provide a reason for your leave request..."
                required
              />

              <Input
                label="Emergency Contact"
                name="emergencyContact"
                value={requestForm.emergencyContact}
                onChange={handleFormChange}
                placeholder="Emergency contact number"
                required
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowRequestForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Submit Request
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Leave Requests */}
      <ListCard title="My Leave Requests">
        {leaveRequests.map((request) => {
          const StatusIcon = getStatusIcon(request.status);
          return (
            <ListItem key={request.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-blue-light rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-primary-blue-dark" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-text-primary">{request.type}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-text-secondary">
                      <span>{request.startDate} - {request.endDate}</span>
                      <span>{request.days} day{request.days > 1 ? 's' : ''}</span>
                    </div>
                    <p className="text-sm text-text-primary mt-1">{request.reason}</p>
                    <p className="text-xs text-text-secondary mt-1">
                      Submitted on {request.submittedDate}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <StatusIcon className="w-5 h-5 text-text-secondary" />
                </div>
              </div>
            </ListItem>
          );
        })}
      </ListCard>

      {/* Upcoming Holidays */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-6">Upcoming Holidays</h3>
        
        <div className="space-y-4">
          {[
            { name: 'New Year\'s Day', date: 'January 1, 2025', type: 'Public Holiday' },
            { name: 'Martin Luther King Jr. Day', date: 'January 20, 2025', type: 'Public Holiday' },
            { name: 'Presidents\' Day', date: 'February 17, 2025', type: 'Public Holiday' },
          ].map((holiday, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-neutral-background rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-orange-light rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary-orange-dark" />
                </div>
                <div>
                  <p className="font-medium text-text-primary">{holiday.name}</p>
                  <p className="text-sm text-text-secondary">{holiday.type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-text-primary">{holiday.date}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Team Leave Calendar */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-6">Team Leave Calendar</h3>
        
        <div className="h-64 bg-neutral-background rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Calendar className="w-12 h-12 text-text-muted mx-auto mb-2" />
            <p className="text-text-secondary">Team leave calendar will be displayed here</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
