import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Calendar,
  User,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock,
  Plus
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  usePayslips, 
  useCreatePayslip,
  useDownloadPayslip,
  usePayrollPeriods
} from '@/hooks/usePayroll';
import { createPayslipSchema } from '@/lib/validations/payroll';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PaySlip, PayslipStatus, PaymentMethod } from '@/types';

interface PayslipFormData {
  employeeId: string;
  payrollPeriodId: string;
  salaryMonth: string;
  salaryYear: number;
  workingDays: number;
  actualWorkingDays: number;
  baseSalary: number;
  overtimeHours?: number;
  overtimeRate?: number;
  bonuses?: number;
  allowances?: number;
  commissions?: number;
  healthInsurance?: number;
  retirementContribution?: number;
  otherDeductions?: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

interface PayslipFormProps {
  onSubmit: (data: PayslipFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const PayslipForm: React.FC<PayslipFormProps> = ({ onSubmit, onCancel, isLoading = false }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<PayslipFormData>({
    resolver: zodResolver(createPayslipSchema),
    defaultValues: {
      salaryYear: new Date().getFullYear(),
      workingDays: 30,
      actualWorkingDays: 30,
      paymentMethod: 'BANK_TRANSFER' as PaymentMethod,
      overtimeHours: 0,
      bonuses: 0,
      allowances: 0,
      commissions: 0,
      healthInsurance: 0,
      retirementContribution: 0,
      otherDeductions: 0
    }
  });

  const { data: payrollPeriods } = usePayrollPeriods({ status: 'ACTIVE' });

  const baseSalary = watch('baseSalary') || 0;
  const overtimeHours = watch('overtimeHours') || 0;
  const overtimeRate = watch('overtimeRate') || 0;
  const bonuses = watch('bonuses') || 0;
  const allowances = watch('allowances') || 0;
  const commissions = watch('commissions') || 0;
  const healthInsurance = watch('healthInsurance') || 0;
  const retirementContribution = watch('retirementContribution') || 0;
  const otherDeductions = watch('otherDeductions') || 0;

  const totalEarnings = baseSalary + (overtimeHours * overtimeRate) + bonuses + allowances + commissions;
  const totalDeductions = healthInsurance + retirementContribution + otherDeductions;
  const netPay = totalEarnings - totalDeductions;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Generate Payslip</h3>
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Employee ID */}
          <div>
            <Label htmlFor="employeeId">Employee ID</Label>
            <Input
              id="employeeId"
              {...register('employeeId')}
              placeholder="Enter employee ID"
            />
            {errors.employeeId && (
              <p className="text-sm text-red-600 mt-1">{errors.employeeId.message}</p>
            )}
          </div>

          {/* Payroll Period */}
          <div>
            <Label htmlFor="payrollPeriodId">Payroll Period</Label>
            <Select onValueChange={(value) => setValue('payrollPeriodId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select payroll period" />
              </SelectTrigger>
              <SelectContent>
                {payrollPeriods?.data?.data?.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    {period.name} ({formatDate(period.startDate)} - {formatDate(period.endDate)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.payrollPeriodId && (
              <p className="text-sm text-red-600 mt-1">{errors.payrollPeriodId.message}</p>
            )}
          </div>

          {/* Salary Month */}
          <div>
            <Label htmlFor="salaryMonth">Salary Month</Label>
            <Input
              id="salaryMonth"
              {...register('salaryMonth')}
              placeholder="e.g., December"
            />
            {errors.salaryMonth && (
              <p className="text-sm text-red-600 mt-1">{errors.salaryMonth.message}</p>
            )}
          </div>

          {/* Salary Year */}
          <div>
            <Label htmlFor="salaryYear">Salary Year</Label>
            <Input
              id="salaryYear"
              type="number"
              {...register('salaryYear', { valueAsNumber: true })}
              placeholder="e.g., 2024"
            />
            {errors.salaryYear && (
              <p className="text-sm text-red-600 mt-1">{errors.salaryYear.message}</p>
            )}
          </div>

          {/* Working Days */}
          <div>
            <Label htmlFor="workingDays">Working Days</Label>
            <Input
              id="workingDays"
              type="number"
              {...register('workingDays', { valueAsNumber: true })}
              placeholder="Total working days"
            />
            {errors.workingDays && (
              <p className="text-sm text-red-600 mt-1">{errors.workingDays.message}</p>
            )}
          </div>

          {/* Actual Working Days */}
          <div>
            <Label htmlFor="actualWorkingDays">Actual Working Days</Label>
            <Input
              id="actualWorkingDays"
              type="number"
              {...register('actualWorkingDays', { valueAsNumber: true })}
              placeholder="Actual working days"
            />
            {errors.actualWorkingDays && (
              <p className="text-sm text-red-600 mt-1">{errors.actualWorkingDays.message}</p>
            )}
          </div>
        </div>

        {/* Earnings Section */}
        <div>
          <Label className="text-base font-medium">Earnings</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
            <div>
              <Label htmlFor="baseSalary">Base Salary</Label>
              <Input
                id="baseSalary"
                type="number"
                step="0.01"
                {...register('baseSalary', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="overtimeHours">Overtime Hours</Label>
              <Input
                id="overtimeHours"
                type="number"
                step="0.5"
                {...register('overtimeHours', { valueAsNumber: true })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="overtimeRate">Overtime Rate</Label>
              <Input
                id="overtimeRate"
                type="number"
                step="0.01"
                {...register('overtimeRate', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="bonuses">Bonuses</Label>
              <Input
                id="bonuses"
                type="number"
                step="0.01"
                {...register('bonuses', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="allowances">Allowances</Label>
              <Input
                id="allowances"
                type="number"
                step="0.01"
                {...register('allowances', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="commissions">Commissions</Label>
              <Input
                id="commissions"
                type="number"
                step="0.01"
                {...register('commissions', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Deductions Section */}
        <div>
          <Label className="text-base font-medium">Deductions</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div>
              <Label htmlFor="healthInsurance">Health Insurance</Label>
              <Input
                id="healthInsurance"
                type="number"
                step="0.01"
                {...register('healthInsurance', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="retirementContribution">Retirement Contribution</Label>
              <Input
                id="retirementContribution"
                type="number"
                step="0.01"
                {...register('retirementContribution', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="otherDeductions">Other Deductions</Label>
              <Input
                id="otherDeductions"
                type="number"
                step="0.01"
                {...register('otherDeductions', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <Label htmlFor="paymentMethod">Payment Method</Label>
          <Select onValueChange={(value) => setValue('paymentMethod', value as PaymentMethod)}>
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
              <SelectItem value="CHEQUE">Cheque</SelectItem>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="DIGITAL_WALLET">Digital Wallet</SelectItem>
            </SelectContent>
          </Select>
          {errors.paymentMethod && (
            <p className="text-sm text-red-600 mt-1">{errors.paymentMethod.message}</p>
          )}
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Input
            id="notes"
            {...register('notes')}
            placeholder="Additional notes"
          />
        </div>

        {/* Calculation Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Calculation Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Earnings:</span>
              <p className="font-medium text-green-600">{formatCurrency(totalEarnings)}</p>
            </div>
            <div>
              <span className="text-gray-600">Total Deductions:</span>
              <p className="font-medium text-red-600">{formatCurrency(totalDeductions)}</p>
            </div>
            <div>
              <span className="text-gray-600">Net Pay:</span>
              <p className="font-bold text-blue-600 text-lg">{formatCurrency(netPay)}</p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            <FileText className="w-4 h-4 mr-2" />
            {isLoading ? 'Generating...' : 'Generate Payslip'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

interface PayslipCardProps {
  payslip: PaySlip;
  onView: (payslip: PaySlip) => void;
  onDownload: (id: string) => void;
  isDownloading?: boolean;
}

const PayslipCard: React.FC<PayslipCardProps> = ({ payslip, onView, onDownload, isDownloading = false }) => {
  const getStatusIcon = (status: PayslipStatus) => {
    switch (status) {
      case 'GENERATED':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'SENT':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'ACKNOWLEDGED':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'DISPUTED':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: PayslipStatus) => {
    switch (status) {
      case 'GENERATED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'SENT':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ACKNOWLEDGED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'DISPUTED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-900">
              {payslip.employee?.firstName} {payslip.employee?.lastName}
            </span>
            <span className="text-sm text-gray-500">({payslip.employeeId})</span>
            <Badge className={`px-2 py-1 text-xs border ${getStatusColor(payslip.status)}`}>
              <div className="flex items-center space-x-1">
                {getStatusIcon(payslip.status)}
                <span>{payslip.status.replace('_', ' ')}</span>
              </div>
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Period</p>
              <p className="font-medium">{payslip.salaryMonth} {payslip.salaryYear}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Gross Pay</p>
              <p className="font-semibold text-green-600">{formatCurrency(payslip.grossPay)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Deductions</p>
              <p className="font-medium text-red-600">{formatCurrency(payslip.totalDeductions)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Net Pay</p>
              <p className="font-bold text-blue-600">{formatCurrency(payslip.netPay)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Generated: {formatDate(payslip.generatedAt)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4" />
              <span>Payment: {payslip.paymentMethod.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(payslip)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload(payslip.id)}
            disabled={isDownloading}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export const PayslipGeneration: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<PayslipStatus | ''>('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showForm, setShowForm] = useState(false);

  // Fetch payslips
  const { 
    data: payslipsData, 
    isLoading: payslipsLoading,
    refetch: refetchPayslips 
  } = usePayslips({
    search: searchTerm || undefined,
    employeeId: selectedEmployee || undefined,
    status: selectedStatus || undefined,
    year: selectedYear,
    page: 1,
    limit: 20
  });

  // Mutations
  const createPayslipMutation = useCreatePayslip();
  const downloadPayslipMutation = useDownloadPayslip();

  const handlePayslipSubmit = async (data: PayslipFormData) => {
    try {
      await createPayslipMutation.mutateAsync(data);
      setShowForm(false);
      refetchPayslips();
    } catch (error) {
      console.error('Error creating payslip:', error);
    }
  };

  const handleViewPayslip = (payslip: PaySlip) => {
    // Open modal or navigate to detail view
    console.log('Viewing payslip:', payslip);
  };

  const handleDownloadPayslip = async (id: string) => {
    try {
      await downloadPayslipMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error downloading payslip:', error);
    }
  };

  const filteredPayslips = payslipsData?.data?.data || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payslip Generation</h1>
          <p className="text-gray-600 mt-1">
            Generate, view, and manage employee payslips
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Bulk Generate
          </Button>
          <Button onClick={() => setShowForm(true)} disabled={showForm}>
            <Plus className="w-4 h-4 mr-2" />
            Generate Payslip
          </Button>
        </div>
      </div>

      {/* Payslip Form */}
      {showForm && (
        <PayslipForm
          onSubmit={handlePayslipSubmit}
          onCancel={() => setShowForm(false)}
          isLoading={createPayslipMutation.isPending}
        />
      )}

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Employees</SelectItem>
              {/* Add employee options here from API */}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as PayslipStatus | '')}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="GENERATED">Generated</SelectItem>
              <SelectItem value="SENT">Sent</SelectItem>
              <SelectItem value="ACKNOWLEDGED">Acknowledged</SelectItem>
              <SelectItem value="DISPUTED">Disputed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={(new Date().getFullYear()).toString()}>{new Date().getFullYear()}</SelectItem>
              <SelectItem value={(new Date().getFullYear() - 1).toString()}>{new Date().getFullYear() - 1}</SelectItem>
              <SelectItem value={(new Date().getFullYear() - 2).toString()}>{new Date().getFullYear() - 2}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Payslips List */}
      <div className="space-y-4">
        {payslipsLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredPayslips.length > 0 ? (
          <div className="space-y-4">
            {filteredPayslips.map((payslip) => (
              <PayslipCard
                key={payslip.id}
                payslip={payslip}
                onView={handleViewPayslip}
                onDownload={handleDownloadPayslip}
                isDownloading={downloadPayslipMutation.isPending}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Payslips Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedEmployee || selectedStatus
                ? 'No payslips match your current filters.'
                : 'Get started by generating your first payslip.'}
            </p>
            {!searchTerm && !selectedEmployee && !selectedStatus && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Generate First Payslip
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Pagination */}
      {payslipsData?.data?.totalPages && payslipsData.data.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button variant="outline" size="sm">
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {payslipsData.data.page} of {payslipsData.data.totalPages}
          </span>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
