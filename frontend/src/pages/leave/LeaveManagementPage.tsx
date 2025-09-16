import React, { useState } from 'react';
import { Plus, Users, BarChart3, Calendar, Settings } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { LeaveRequestsTable } from '../../components/leave/LeaveRequestsTable';
import { LeaveBalanceTable } from '../../components/leave/LeaveBalanceTable';
import { LeaveStatsCards } from '../../components/leave/LeaveStatsCards';
import { CreateLeaveRequestForm } from '../../components/leave/CreateLeaveRequestForm';

export const LeaveManagementPage: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState('requests');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600 mt-1">
            Manage leave requests, balances, and analyze leave patterns
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={() => setActiveTab('statistics')}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Leave Request
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Leave Requests
          </TabsTrigger>
          <TabsTrigger value="balances" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Leave Balances
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Leave Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Leave Requests</h2>
              <p className="text-sm text-gray-600">
                Review and manage all leave requests across the organization
              </p>
            </div>
          </div>
          
          <LeaveRequestsTable
            showEmployeeFilter={true}
            showActions={true}
          />
        </TabsContent>

        {/* Leave Balances Tab */}
        <TabsContent value="balances" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Leave Balances</h2>
              <p className="text-sm text-gray-600">
                Manage employee leave balances and allocations
              </p>
            </div>
          </div>
          
          <LeaveBalanceTable
            showEmployeeFilter={true}
          />
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Leave Analytics</h2>
              <p className="text-sm text-gray-600">
                Analyze leave patterns and trends across the organization
              </p>
            </div>
          </div>
          
          <LeaveStatsCards />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Leave Settings</h2>
              <p className="text-sm text-gray-600">
                Configure leave types, policies, and system settings
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Leave Types Management */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Leave Types</h3>
                  <p className="text-sm text-gray-600">Manage available leave types</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <Button variant="outline" className="w-full">
                Manage Leave Types
              </Button>
            </Card>

            {/* Leave Policies */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Leave Policies</h3>
                  <p className="text-sm text-gray-600">Configure leave policies</p>
                </div>
                <Settings className="w-8 h-8 text-green-600" />
              </div>
              <Button variant="outline" className="w-full">
                Manage Policies
              </Button>
            </Card>

            {/* Holiday Calendar */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Holiday Calendar</h3>
                  <p className="text-sm text-gray-600">Manage company holidays</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <Button variant="outline" className="w-full">
                Manage Holidays
              </Button>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Bulk Balance Import
              </Button>
              <Button variant="outline" className="justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Year-end Rollover
              </Button>
              <Button variant="outline" className="justify-start">
                <BarChart3 className="w-4 h-4 mr-2" />
                Generate Reports
              </Button>
              <Button variant="outline" className="justify-start">
                <Settings className="w-4 h-4 mr-2" />
                System Settings
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Leave Request Modal */}
      <CreateLeaveRequestForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
      />
    </div>
  );
};
