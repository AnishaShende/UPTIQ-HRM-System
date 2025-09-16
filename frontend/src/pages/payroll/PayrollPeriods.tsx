import React, { useState } from 'react';
import { 
  Calendar,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter
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
  usePayrollPeriods,
  useCreatePayrollPeriod,
  useUpdatePayrollPeriod,
  useDeletePayrollPeriod
} from '@/hooks/usePayroll';
import { createPayrollPeriodSchema } from '@/lib/validations/payroll';
import { formatDate } from '@/lib/utils';
import { PayrollPeriod, PayrollPeriodStatus, PayrollFrequency } from '@/types';

interface PeriodFormData {
  name: string;
  startDate: string;
  endDate: string;
  payDate: string;
  frequency: PayrollFrequency;
  currency: 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD';
  description?: string;
}

interface PeriodFormProps {
  period?: PayrollPeriod;
  onSubmit: (data: PeriodFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const PeriodForm: React.FC<PeriodFormProps> = ({ 
  period, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<PeriodFormData>({
    resolver: zodResolver(createPayrollPeriodSchema),
    defaultValues: period ? {
      name: period.name,
      startDate: new Date(period.startDate).toISOString().split('T')[0],
      endDate: new Date(period.endDate).toISOString().split('T')[0],
      payDate: new Date(period.payDate).toISOString().split('T')[0],
      frequency: period.frequency,
      currency: (period.currency as 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD') || 'USD',
      description: period.description || ''
    } : {
      frequency: 'MONTHLY' as PayrollFrequency,
      currency: 'USD' as 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD'
    }
  });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {period ? 'Edit Payroll Period' : 'Create New Payroll Period'}
        </h3>
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Period Name */}
          <div>
            <Label htmlFor="name">Period Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., December 2024"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Frequency */}
          <div>
            <Label htmlFor="frequency">Frequency</Label>
            <Select onValueChange={(value) => setValue('frequency', value as PayrollFrequency)}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="BI_WEEKLY">Bi-Weekly</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                <SelectItem value="ANNUALLY">Annually</SelectItem>
              </SelectContent>
            </Select>
            {errors.frequency && (
              <p className="text-sm text-red-600 mt-1">{errors.frequency.message}</p>
            )}
          </div>

          {/* Currency */}
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select onValueChange={(value) => setValue('currency', value as 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD')}>
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

          {/* Start Date */}
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              {...register('startDate')}
            />
            {errors.startDate && (
              <p className="text-sm text-red-600 mt-1">{errors.startDate.message}</p>
            )}
          </div>

          {/* End Date */}
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              {...register('endDate')}
            />
            {errors.endDate && (
              <p className="text-sm text-red-600 mt-1">{errors.endDate.message}</p>
            )}
          </div>

          {/* Pay Date */}
          <div className="md:col-span-3">
            <Label htmlFor="payDate">Pay Date</Label>
            <Input
              id="payDate"
              type="date"
              {...register('payDate')}
            />
            {errors.payDate && (
              <p className="text-sm text-red-600 mt-1">{errors.payDate.message}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Description (Optional)</Label>
          <Input
            id="description"
            {...register('description')}
            placeholder="Additional notes about this payroll period"
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : (period ? 'Update Period' : 'Create Period')}
          </Button>
        </div>
      </form>
    </Card>
  );
};

interface PeriodCardProps {
  period: PayrollPeriod;
  onEdit: (period: PayrollPeriod) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

const PeriodCard: React.FC<PeriodCardProps> = ({ 
  period, 
  onEdit, 
  onDelete,
  isDeleting = false
}) => {
  const getStatusIcon = (status: PayrollPeriodStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'PROCESSING':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'DRAFT':
        return <Edit2 className="w-4 h-4 text-gray-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: PayrollPeriodStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'COMPLETED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PROCESSING':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'DRAFT':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  const canEdit = period.status !== 'COMPLETED' && period.status !== 'PROCESSING';
  const canDelete = period.status === 'DRAFT';

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">{period.name}</h3>
            <Badge className={`px-2 py-1 text-xs border ${getStatusColor(period.status)}`}>
              <div className="flex items-center space-x-1">
                {getStatusIcon(period.status)}
                <span>{period.status}</span>
              </div>
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Period</p>
              <p className="font-medium">
                {formatDate(period.startDate)} - {formatDate(period.endDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pay Date</p>
              <p className="font-medium">{formatDate(period.payDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Frequency</p>
              <p className="font-medium">{period.frequency.replace('_', ' ')}</p>
            </div>
          </div>

          {period.description && (
            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              {period.description}
            </p>
          )}

          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Created: {formatDate(period.createdAt)}</span>
            </div>
            {period.processedAt && (
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>Processed: {formatDate(period.processedAt)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(period)}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          )}
          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(period.id)}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export const PayrollPeriods: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<PayrollPeriodStatus | ''>('');
  const [selectedFrequency, setSelectedFrequency] = useState<PayrollFrequency | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<PayrollPeriod | null>(null);

  // Fetch payroll periods
  const { 
    data: periodsData, 
    isLoading: periodsLoading,
    refetch: refetchPeriods 
  } = usePayrollPeriods({
    search: searchTerm || undefined,
    status: selectedStatus || undefined,
    frequency: selectedFrequency || undefined,
    page: 1,
    limit: 20
  });

  // Mutations
  const createPeriodMutation = useCreatePayrollPeriod();
  const updatePeriodMutation = useUpdatePayrollPeriod();
  const deletePeriodMutation = useDeletePayrollPeriod();

  const handlePeriodSubmit = async (data: PeriodFormData) => {
    try {
      if (editingPeriod) {
        await updatePeriodMutation.mutateAsync({
          id: editingPeriod.id,
          data: {
            ...data,
            startDate: new Date(data.startDate).toISOString(),
            endDate: new Date(data.endDate).toISOString(),
            payDate: new Date(data.payDate).toISOString()
          }
        });
      } else {
        await createPeriodMutation.mutateAsync({
          ...data,
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString(),
          payDate: new Date(data.payDate).toISOString()
        });
      }
      setShowForm(false);
      setEditingPeriod(null);
      refetchPeriods();
    } catch (error) {
      console.error('Error saving payroll period:', error);
    }
  };

  const handleEditPeriod = (period: PayrollPeriod) => {
    setEditingPeriod(period);
    setShowForm(true);
  };

  const handleDeletePeriod = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this payroll period? This action cannot be undone.')) {
      try {
        await deletePeriodMutation.mutateAsync(id);
        refetchPeriods();
      } catch (error) {
        console.error('Error deleting payroll period:', error);
      }
    }
  };



  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPeriod(null);
  };

  const filteredPeriods = periodsData?.data?.data || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Periods</h1>
          <p className="text-gray-600 mt-1">
            Manage payroll periods and processing schedules
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(true)} 
          disabled={showForm}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Period
        </Button>
      </div>

      {/* Period Form */}
      {showForm && (
        <PeriodForm
          period={editingPeriod || undefined}
          onSubmit={handlePeriodSubmit}
          onCancel={handleCancelForm}
          isLoading={createPeriodMutation.isPending || updatePeriodMutation.isPending}
        />
      )}

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search periods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as PayrollPeriodStatus | '')}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedFrequency} onValueChange={(value) => setSelectedFrequency(value as PayrollFrequency | '')}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Frequencies</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="BI_WEEKLY">Bi-Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="QUARTERLY">Quarterly</SelectItem>
              <SelectItem value="ANNUALLY">Annually</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => refetchPeriods()}>
            <Filter className="w-4 h-4 mr-2" />
            Reset Filters
          </Button>
        </div>
      </Card>

      {/* Periods List */}
      <div className="space-y-4">
        {periodsLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredPeriods.length > 0 ? (
          <div className="space-y-4">
            {filteredPeriods.map((period) => (
              <PeriodCard
                key={period.id}
                period={period}
                onEdit={handleEditPeriod}
                onDelete={handleDeletePeriod}
                isDeleting={deletePeriodMutation.isPending}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Payroll Periods Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedStatus || selectedFrequency
                ? 'No periods match your current filters.'
                : 'Get started by creating your first payroll period.'}
            </p>
            {!searchTerm && !selectedStatus && !selectedFrequency && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Period
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Pagination */}
      {periodsData?.data?.totalPages && periodsData.data.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button variant="outline" size="sm">
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {periodsData.data.page} of {periodsData.data.totalPages}
          </span>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
