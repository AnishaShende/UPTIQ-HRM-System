import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  DollarSign, 
  TrendingUp,
  Calendar,
  User,
  Save,
  X
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  useSalaryHistory, 
  useCreateSalaryHistory,
  useUpdateSalaryHistory,
  useDeleteSalaryHistory
} from '@/hooks/usePayroll';
import { createSalaryHistorySchema, updateSalaryHistorySchema } from '@/lib/validations/payroll';
import { formatCurrency, formatDate } from '@/lib/utils';
import { SalaryHistory, Currency, PayrollFrequency } from '@/types';

type ChangeType = "PROMOTION" | "ADJUSTMENT" | "ANNUAL_REVIEW" | "TRANSFER" | "CORRECTION";

interface SalaryFormData {
  employeeId: string;
  baseSalary: number;
  currency: Currency;
  payFrequency: PayrollFrequency;
  allowances?: {
    housing?: number;
    transport?: number;
    medical?: number;
    food?: number;
    other?: number;
  };
  taxExemptions?: number;
  taxFilingStatus?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  changeReason?: string;
  changeType?: ChangeType;
}

interface SalaryFormProps {
  salary?: SalaryHistory;
  onSubmit: (data: SalaryFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const SalaryForm: React.FC<SalaryFormProps> = ({ salary, onSubmit, onCancel, isLoading = false }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<SalaryFormData>({
    resolver: zodResolver(salary ? updateSalaryHistorySchema : createSalaryHistorySchema),
    defaultValues: salary ? {
      employeeId: salary.employeeId,
      baseSalary: salary.baseSalary,
      currency: salary.currency,
      payFrequency: salary.payFrequency,
      allowances: salary.allowances,
      taxExemptions: salary.taxExemptions || 0,
      taxFilingStatus: salary.taxFilingStatus || '',
      effectiveFrom: salary.effectiveFrom,
      effectiveTo: salary.effectiveTo || '',
      changeReason: salary.changeReason || '',
      changeType: (salary.changeType as ChangeType) || undefined
    } : {
      currency: 'USD' as Currency,
      payFrequency: 'MONTHLY' as PayrollFrequency,
      taxExemptions: 0,
      allowances: {
        housing: 0,
        transport: 0,
        medical: 0,
        food: 0,
        other: 0
      }
    }
  });

  const allowances = watch('allowances') || {};

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {salary ? 'Edit Salary' : 'Add New Salary'}
        </h3>
        <Button variant="outline" size="sm" onClick={onCancel}>
          <X className="w-4 h-4" />
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
              disabled={!!salary}
              placeholder="Enter employee ID"
            />
            {errors.employeeId && (
              <p className="text-sm text-red-600 mt-1">{errors.employeeId.message}</p>
            )}
          </div>

          {/* Base Salary */}
          <div>
            <Label htmlFor="baseSalary">Base Salary</Label>
            <Input
              id="baseSalary"
              type="number"
              step="0.01"
              {...register('baseSalary', { valueAsNumber: true })}
              placeholder="Enter base salary"
            />
            {errors.baseSalary && (
              <p className="text-sm text-red-600 mt-1">{errors.baseSalary.message}</p>
            )}
          </div>

          {/* Currency */}
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select onValueChange={(value) => setValue('currency', value as Currency)} defaultValue={watch('currency')}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="INR">INR</SelectItem>
                <SelectItem value="CAD">CAD</SelectItem>
                <SelectItem value="AUD">AUD</SelectItem>
              </SelectContent>
            </Select>
            {errors.currency && (
              <p className="text-sm text-red-600 mt-1">{errors.currency.message}</p>
            )}
          </div>

          {/* Pay Frequency */}
          <div>
            <Label htmlFor="payFrequency">Pay Frequency</Label>
            <Select onValueChange={(value) => setValue('payFrequency', value as PayrollFrequency)} defaultValue={watch('payFrequency')}>
              <SelectTrigger>
                <SelectValue placeholder="Select pay frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="BI_WEEKLY">Bi-Weekly</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                <SelectItem value="ANNUALLY">Annually</SelectItem>
              </SelectContent>
            </Select>
            {errors.payFrequency && (
              <p className="text-sm text-red-600 mt-1">{errors.payFrequency.message}</p>
            )}
          </div>
        </div>

        {/* Allowances Section */}
        <div>
          <Label className="text-base font-medium">Allowances</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
            <div>
              <Label htmlFor="housing">Housing Allowance</Label>
              <Input
                id="housing"
                type="number"
                step="0.01"
                {...register('allowances.housing', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="transport">Transport Allowance</Label>
              <Input
                id="transport"
                type="number"
                step="0.01"
                {...register('allowances.transport', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="medical">Medical Allowance</Label>
              <Input
                id="medical"
                type="number"
                step="0.01"
                {...register('allowances.medical', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="food">Food Allowance</Label>
              <Input
                id="food"
                type="number"
                step="0.01"
                {...register('allowances.food', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="other">Other Allowance</Label>
              <Input
                id="other"
                type="number"
                step="0.01"
                {...register('allowances.other', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Tax Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="taxExemptions">Tax Exemptions</Label>
            <Input
              id="taxExemptions"
              type="number"
              {...register('taxExemptions', { valueAsNumber: true })}
              placeholder="Number of exemptions"
            />
            {errors.taxExemptions && (
              <p className="text-sm text-red-600 mt-1">{errors.taxExemptions.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="taxFilingStatus">Tax Filing Status</Label>
            <Select onValueChange={(value) => setValue('taxFilingStatus', value)} defaultValue={watch('taxFilingStatus')}>
              <SelectTrigger>
                <SelectValue placeholder="Select filing status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SINGLE">Single</SelectItem>
                <SelectItem value="MARRIED_FILING_JOINTLY">Married Filing Jointly</SelectItem>
                <SelectItem value="MARRIED_FILING_SEPARATELY">Married Filing Separately</SelectItem>
                <SelectItem value="HEAD_OF_HOUSEHOLD">Head of Household</SelectItem>
                <SelectItem value="QUALIFYING_WIDOW">Qualifying Widow(er)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Effective Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="effectiveFrom">Effective From</Label>
            <Input
              id="effectiveFrom"
              type="date"
              {...register('effectiveFrom')}
            />
            {errors.effectiveFrom && (
              <p className="text-sm text-red-600 mt-1">{errors.effectiveFrom.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="effectiveTo">Effective To (Optional)</Label>
            <Input
              id="effectiveTo"
              type="date"
              {...register('effectiveTo')}
            />
            {errors.effectiveTo && (
              <p className="text-sm text-red-600 mt-1">{errors.effectiveTo.message}</p>
            )}
          </div>
        </div>

        {/* Change Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="changeType">Change Type</Label>
            <Select onValueChange={(value) => setValue('changeType', value as ChangeType)} defaultValue={watch('changeType')}>
              <SelectTrigger>
                <SelectValue placeholder="Select change type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PROMOTION">Promotion</SelectItem>
                <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                <SelectItem value="ANNUAL_REVIEW">Annual Review</SelectItem>
                <SelectItem value="TRANSFER">Transfer</SelectItem>
                <SelectItem value="CORRECTION">Correction</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="changeReason">Change Reason</Label>
            <Input
              id="changeReason"
              {...register('changeReason')}
              placeholder="Enter reason for change"
            />
          </div>
        </div>

        {/* Total Compensation Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Total Compensation Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Base Salary:</span>
              <p className="font-medium">{formatCurrency(watch('baseSalary') || 0)}</p>
            </div>
            <div>
              <span className="text-gray-600">Total Allowances:</span>
              <p className="font-medium">
                {formatCurrency(
                  (allowances.housing || 0) +
                  (allowances.transport || 0) +
                  (allowances.medical || 0) +
                  (allowances.food || 0) +
                  (allowances.other || 0)
                )}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Total Monthly:</span>
              <p className="font-medium text-green-600">
                {formatCurrency(
                  (watch('baseSalary') || 0) +
                  (allowances.housing || 0) +
                  (allowances.transport || 0) +
                  (allowances.medical || 0) +
                  (allowances.food || 0) +
                  (allowances.other || 0)
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Salary'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

interface SalaryCardProps {
  salary: SalaryHistory;
  onEdit: (salary: SalaryHistory) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

const SalaryCard: React.FC<SalaryCardProps> = ({ salary, onEdit, onDelete, isDeleting = false }) => {
  const totalAllowances = (salary.allowances?.housing || 0) +
                         (salary.allowances?.transport || 0) +
                         (salary.allowances?.medical || 0) +
                         (salary.allowances?.food || 0) +
                         (salary.allowances?.other || 0);

  const totalCompensation = salary.baseSalary + totalAllowances;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-900">
              {salary.employee?.firstName} {salary.employee?.lastName}
            </span>
            <span className="text-sm text-gray-500">({salary.employeeId})</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Base Salary</p>
              <p className="font-semibold text-lg">{formatCurrency(salary.baseSalary, salary.currency)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Allowances</p>
              <p className="font-medium">{formatCurrency(totalAllowances, salary.currency)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Compensation</p>
              <p className="font-semibold text-green-600">{formatCurrency(totalCompensation, salary.currency)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pay Frequency</p>
              <p className="font-medium">{salary.payFrequency.replace('_', ' ')}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>From: {formatDate(salary.effectiveFrom)}</span>
            </div>
            {salary.effectiveTo && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>To: {formatDate(salary.effectiveTo)}</span>
              </div>
            )}
            {salary.changeType && (
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4" />
                <span>{salary.changeType.replace('_', ' ')}</span>
              </div>
            )}
          </div>

          {salary.changeReason && (
            <p className="text-sm text-gray-600 italic">
              Reason: {salary.changeReason}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(salary)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(salary.id)}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export const EmployeePayrollManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSalary, setEditingSalary] = useState<SalaryHistory | null>(null);

  // Fetch salary history
  const { 
    data: salaryHistoryData, 
    isLoading: salaryHistoryLoading,
    refetch: refetchSalaryHistory 
  } = useSalaryHistory({
    employeeId: selectedEmployee || undefined,
    page: 1,
    limit: 50
  });

  // Mutations
  const createSalaryMutation = useCreateSalaryHistory();
  const updateSalaryMutation = useUpdateSalaryHistory();
  const deleteSalaryMutation = useDeleteSalaryHistory();

  const handleSalarySubmit = async (data: SalaryFormData) => {
    try {
      if (editingSalary) {
        await updateSalaryMutation.mutateAsync({
          id: editingSalary.id,
          data
        });
      } else {
        await createSalaryMutation.mutateAsync(data);
      }
      setShowForm(false);
      setEditingSalary(null);
      refetchSalaryHistory();
    } catch (error) {
      console.error('Error saving salary:', error);
    }
  };

  const handleEditSalary = (salary: SalaryHistory) => {
    setEditingSalary(salary);
    setShowForm(true);
  };

  const handleDeleteSalary = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this salary record?')) {
      try {
        await deleteSalaryMutation.mutateAsync(id);
        refetchSalaryHistory();
      } catch (error) {
        console.error('Error deleting salary:', error);
      }
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingSalary(null);
  };

  const filteredSalaries = salaryHistoryData?.data?.data?.filter((salary) =>
    salary.employee?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    salary.employee?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    salary.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Payroll Management</h1>
          <p className="text-gray-600 mt-1">
            Manage employee salary structures, allowances, and compensation history
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="w-4 h-4 mr-2" />
          Add Salary Record
        </Button>
      </div>

      {/* Salary Form */}
      {showForm && (
        <SalaryForm
          salary={editingSalary || undefined}
          onSubmit={handleSalarySubmit}
          onCancel={handleCancelForm}
          isLoading={createSalaryMutation.isPending || updateSalaryMutation.isPending}
        />
      )}

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Employees</SelectItem>
                {/* Add employee options here from API */}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Salary Records */}
      <div className="space-y-4">
        {salaryHistoryLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="h-16 bg-gray-200 rounded"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredSalaries.length > 0 ? (
          <div className="space-y-4">
            {filteredSalaries.map((salary) => (
              <SalaryCard
                key={salary.id}
                salary={salary}
                onEdit={handleEditSalary}
                onDelete={handleDeleteSalary}
                isDeleting={deleteSalaryMutation.isPending}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Salary Records Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedEmployee
                ? 'No salary records match your current filters.'
                : 'Get started by adding your first salary record.'}
            </p>
            {!searchTerm && !selectedEmployee && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Salary Record
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Pagination */}
      {salaryHistoryData?.data?.totalPages && salaryHistoryData.data.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button variant="outline" size="sm">
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {salaryHistoryData.data.page} of {salaryHistoryData.data.totalPages}
          </span>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
