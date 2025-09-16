import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Save, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { 
  useCreateLeaveRequest,
  useLeaveTypes,
  useMyLeaveBalance
} from '../../hooks/useLeave';
import { createLeaveRequestSchema, CreateLeaveRequestInput } from '../../lib/validations/leave';
import { toast } from 'react-hot-toast';

interface CreateLeaveRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId?: string;
}

export const CreateLeaveRequestForm: React.FC<CreateLeaveRequestFormProps> = ({
  open,
  onOpenChange,
  employeeId
}) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors, isSubmitting }
  } = useForm<CreateLeaveRequestInput>({
    resolver: zodResolver(createLeaveRequestSchema),
    defaultValues: {
      employeeId: employeeId || 'current-user-id', // Replace with actual current user ID
      leaveTypeId: '',
      startDate: '',
      endDate: '',
      reason: '',
      isHalfDay: false,
      halfDayPeriod: undefined,
      emergencyContact: undefined,
      delegatedTo: undefined
    }
  });

  // Watch form values for calculations and balance checks
  const selectedLeaveTypeId = watch('leaveTypeId');
  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const isHalfDay = watch('isHalfDay');

  // Fetch leave types
  const { 
    data: leaveTypesData, 
    isLoading: typesLoading 
  } = useLeaveTypes();

  // Fetch user's leave balance
  const { 
    data: balanceData, 
    isLoading: balanceLoading 
  } = useMyLeaveBalance();

  // Mutations
  const createLeaveRequest = useCreateLeaveRequest();

  const leaveTypes = leaveTypesData?.data || [];
  const balances = balanceData?.data || [];

  // Calculate number of days
  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return isHalfDay ? 0.5 : diffDays;
  };

  const totalDays = calculateDays();
  const selectedBalance = balances.find(b => b.leaveTypeId === selectedLeaveTypeId);

  const onSubmit = async (data: CreateLeaveRequestInput) => {
    try {
      // Clean the data according to the schema requirements
      const requestData: CreateLeaveRequestInput = {
        employeeId: data.employeeId,
        leaveTypeId: data.leaveTypeId,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason.trim(),
        isHalfDay: data.isHalfDay,
        halfDayPeriod: data.isHalfDay ? data.halfDayPeriod : undefined,
        emergencyContact: data.emergencyContact && data.emergencyContact.name && data.emergencyContact.phone && data.emergencyContact.relationship 
          ? data.emergencyContact 
          : undefined,
        delegatedTo: data.delegatedTo
      };

      await createLeaveRequest.mutateAsync(requestData);
      toast.success('Leave request created successfully');
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating leave request:', error);
      toast.error('Failed to create leave request');
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const isLoading = typesLoading || balanceLoading;
  const isSaving = isSubmitting || createLeaveRequest.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Create Leave Request</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isSaving}
            >
              <X size={16} />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Leave Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Leave Type *</label>
              <Controller
                name="leaveTypeId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={errors.leaveTypeId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaveTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name} ({type.defaultDaysAllowed} days allowed)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.leaveTypeId && (
                <p className="text-red-500 text-xs">{errors.leaveTypeId.message}</p>
              )}
              
              {/* Show balance info */}
              {selectedBalance && (
                <div className="p-2 bg-blue-50 rounded text-sm">
                  <p className="text-blue-700">
                    Available: {selectedBalance.availableDays} days 
                    (Total: {selectedBalance.totalDays}, Used: {selectedBalance.usedDays})
                  </p>
                </div>
              )}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Start Date *</label>
                <Input
                  {...register('startDate')}
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className={errors.startDate ? 'border-red-500' : ''}
                />
                {errors.startDate && (
                  <p className="text-red-500 text-xs">{errors.startDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">End Date *</label>
                <Input
                  {...register('endDate')}
                  type="date"
                  min={startDate || new Date().toISOString().split('T')[0]}
                  className={errors.endDate ? 'border-red-500' : ''}
                />
                {errors.endDate && (
                  <p className="text-red-500 text-xs">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            {/* Half Day Option */}
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Controller
                  name="isHalfDay"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="isHalfDay"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <label htmlFor="isHalfDay" className="text-sm">
                  Half day leave
                </label>
              </div>

              {isHalfDay && (
                <div className="space-y-1">
                  <Controller
                    name="halfDayPeriod"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MORNING">Morning</SelectItem>
                          <SelectItem value="AFTERNOON">Afternoon</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              )}
            </div>

            {/* Days Summary */}
            {totalDays > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Total leave days: {totalDays}</span>
                </div>
                {selectedBalance && totalDays > selectedBalance.availableDays && (
                  <p className="text-red-600 text-xs mt-1">
                    ⚠️ This request exceeds your available balance
                  </p>
                )}
              </div>
            )}

            {/* Reason */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Reason *</label>
              <Textarea
                {...register('reason')}
                rows={3}
                placeholder="Please provide a detailed reason for your leave request..."
                className={errors.reason ? 'border-red-500' : ''}
              />
              {errors.reason && (
                <p className="text-red-500 text-xs">{errors.reason.message}</p>
              )}
            </div>

            {/* Emergency Contact */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Emergency Contact (Optional)
              </label>
              <p className="text-xs text-gray-500">
                If you provide emergency contact information, all fields are required.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Input
                    {...register('emergencyContact.name')}
                    placeholder="Contact name"
                  />
                </div>
                <div className="space-y-1">
                  <Input
                    {...register('emergencyContact.phone')}
                    placeholder="Phone number"
                  />
                </div>
                <div className="space-y-1">
                  <Input
                    {...register('emergencyContact.relationship')}
                    placeholder="Relationship"
                  />
                </div>
              </div>
              {errors.emergencyContact && (
                <p className="text-red-500 text-xs">{errors.emergencyContact.message}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isSaving}
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save size={16} className="mr-2" />
                )}
                Submit Request
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
