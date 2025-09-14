import React, { useState } from 'react';
import { Download, Eye, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { Card, ListCard, ListItem } from '@/components/ui/Card';
import { Button } from '@/components/ui/Form';

export const PayrollPage: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedMonth, setSelectedMonth] = useState('12');

  // Mock salary slip data
  const salarySlips = [
    {
      id: 1,
      month: 'December 2024',
      grossSalary: 7500,
      deductions: 1200,
      netSalary: 6300,
      status: 'paid',
      payDate: '2024-12-31',
    },
    {
      id: 2,
      month: 'November 2024',
      grossSalary: 7500,
      deductions: 1150,
      netSalary: 6350,
      status: 'paid',
      payDate: '2024-11-30',
    },
    {
      id: 3,
      month: 'October 2024',
      grossSalary: 7500,
      deductions: 1100,
      netSalary: 6400,
      status: 'paid',
      payDate: '2024-10-31',
    },
  ];

  const payrollSummary = {
    currentMonth: {
      grossSalary: 7500,
      deductions: 1200,
      netSalary: 6300,
    },
    ytd: {
      grossSalary: 90000,
      deductions: 14400,
      netSalary: 75600,
    },
    averageMonthly: {
      grossSalary: 7500,
      deductions: 1200,
      netSalary: 6300,
    },
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-accent-success bg-opacity-10 text-accent-success';
      case 'pending':
        return 'bg-accent-warning bg-opacity-10 text-accent-warning';
      case 'failed':
        return 'bg-accent-error bg-opacity-10 text-accent-error';
      default:
        return 'bg-neutral-background text-text-secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Payroll</h1>
          <p className="text-text-secondary mt-1">View your salary slips and payment history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Payroll Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Current Month</h3>
            <DollarSign className="w-5 h-5 text-primary-green-dark" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-text-secondary">Gross Salary:</span>
              <span className="font-medium">${payrollSummary.currentMonth.grossSalary.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Deductions:</span>
              <span className="font-medium text-accent-error">-${payrollSummary.currentMonth.deductions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-neutral-border">
              <span className="font-semibold text-text-primary">Net Salary:</span>
              <span className="font-bold text-primary-green-dark">${payrollSummary.currentMonth.netSalary.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Year to Date</h3>
            <TrendingUp className="w-5 h-5 text-primary-blue-dark" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-text-secondary">Gross Salary:</span>
              <span className="font-medium">${payrollSummary.ytd.grossSalary.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Deductions:</span>
              <span className="font-medium text-accent-error">-${payrollSummary.ytd.deductions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-neutral-border">
              <span className="font-semibold text-text-primary">Net Salary:</span>
              <span className="font-bold text-primary-green-dark">${payrollSummary.ytd.netSalary.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Average Monthly</h3>
            <Calendar className="w-5 h-5 text-primary-purple-dark" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-text-secondary">Gross Salary:</span>
              <span className="font-medium">${payrollSummary.averageMonthly.grossSalary.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Deductions:</span>
              <span className="font-medium text-accent-error">-${payrollSummary.averageMonthly.deductions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-neutral-border">
              <span className="font-semibold text-text-primary">Net Salary:</span>
              <span className="font-bold text-primary-green-dark">${payrollSummary.averageMonthly.netSalary.toLocaleString()}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-text-primary">Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-green-dark"
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-text-primary">Month:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-green-dark"
            >
              <option value="12">December</option>
              <option value="11">November</option>
              <option value="10">October</option>
              <option value="9">September</option>
              <option value="8">August</option>
              <option value="7">July</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Salary Slips */}
      <ListCard title="Salary Slips">
        {salarySlips.map((slip) => (
          <ListItem key={slip.id}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-green-light rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary-green-dark" />
                  </div>
                  <div>
                    <h3 className="font-medium text-text-primary">{slip.month}</h3>
                    <p className="text-sm text-text-secondary">Paid on {slip.payDate}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold text-text-primary">${slip.netSalary.toLocaleString()}</p>
                  <p className="text-sm text-text-secondary">
                    ${slip.grossSalary.toLocaleString()} - ${slip.deductions.toLocaleString()}
                  </p>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(slip.status)}`}>
                  {slip.status}
                </span>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </ListItem>
        ))}
      </ListCard>

      {/* Detailed Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-6">December 2024 Breakdown</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Earnings */}
          <div>
            <h4 className="font-medium text-text-primary mb-4">Earnings</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">Basic Salary</span>
                <span className="font-medium">$6,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Housing Allowance</span>
                <span className="font-medium">$1,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Transport Allowance</span>
                <span className="font-medium">$300</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Performance Bonus</span>
                <span className="font-medium">$200</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-border">
                <span className="font-semibold text-text-primary">Total Earnings</span>
                <span className="font-bold text-primary-green-dark">$7,500</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <h4 className="font-medium text-text-primary mb-4">Deductions</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">Income Tax</span>
                <span className="font-medium text-accent-error">-$800</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Social Security</span>
                <span className="font-medium text-accent-error">-$200</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Health Insurance</span>
                <span className="font-medium text-accent-error">-$150</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Retirement Fund</span>
                <span className="font-medium text-accent-error">-$50</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-border">
                <span className="font-semibold text-text-primary">Total Deductions</span>
                <span className="font-bold text-accent-error">-$1,200</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
