import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
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
import { 
  useLeaveBalance,
  useCreateLeaveBalance,
  useUpdateLeaveBalance,
  useLeaveTypes
} from '../../hooks/useLeave';
import { createLeaveBalanceSchema, updateLeaveBalanceSchema, CreateLeaveBalanceInput, UpdateLeaveBalanceInput } from '../../lib/validations/leave';
import { toast } from 'react-hot-toast';

interface LeaveBalanceFormProps {
  balanceId?: string;
  employeeId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const LeaveBalanceForm: React.FC<LeaveBalanceFormProps> = ({
  balanceId,
  employeeId: initialEmployeeId,
  onClose,
  onSuccess
}) => {
  const isEditing = !!balanceId;
  
  // Use a single form with all fields for better type safety
  const form = useForm<CreateLeaveBalanceInput>({
    resolver: zodResolver(isEditing ? updateLeaveBalanceSchema : createLeaveBalanceSchema),
    defaultValues: {
      employeeId: initialEmployeeId || '',
      leaveTypeId: '',
      year: new Date().getFullYear(),
      totalDays: 0,
      carriedForward: 0
    }
  });

  // Destructure form methods from the active form
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = form;

  // Fetch leave balance for editing
  const { 
    data: balanceData, 
    isLoading: balanceLoading 
  } = useLeaveBalance(balanceId || '');

  // Fetch leave types
  const { 
    data: leaveTypesData, 
    isLoading: typesLoading 
  } = useLeaveTypes();

  // Mutations
  const createBalance = useCreateLeaveBalance();
  const updateBalance = useUpdateLeaveBalance();

  const leaveTypes = leaveTypesData?.data || [];

  // Set form values when editing
  useEffect(() => {
    if (balanceData?.data && isEditing) {
      const balance = balanceData.data;
      setValue('employeeId', balance.employeeId);
      setValue('leaveTypeId', balance.leaveTypeId);
      setValue('year', balance.year);
      setValue('totalDays', balance.totalDays);
      setValue('carriedForward', balance.carriedForward);
    }
  }, [balanceData, isEditing, setValue]);

  const onSubmit = async (data: CreateLeaveBalanceInput) => {
    try {
      if (isEditing && balanceId) {
        // For updates, only send the fields that can be updated
        const updateData: UpdateLeaveBalanceInput = {
          totalDays: data.totalDays,
          carriedForward: data.carriedForward
        };
        await updateBalance.mutateAsync({
          id: balanceId,
          data: updateData
        });
        toast.success('Leave balance updated successfully');
      } else {
        await createBalance.mutateAsync(data);
        toast.success('Leave balance created successfully');
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving leave balance:', error);
      toast.error(isEditing ? 'Failed to update leave balance' : 'Failed to create leave balance');
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const isLoading = balanceLoading || typesLoading;
  const isSaving = isSubmitting || createBalance.isPending || updateBalance.isPending;

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{isEditing ? 'Edit Leave Balance' : 'Create Leave Balance'}</span>
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Employee ID */}
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID *</Label>
              <Input
                {...register('employeeId')}
                placeholder="Enter employee ID"
                disabled={isEditing}
                className={errors.employeeId ? 'border-red-500' : ''}
              />
              {errors.employeeId && (
                <p className="text-red-500 text-xs">{errors.employeeId.message}</p>
              )}
            </div>

            {/* Leave Type */}
            <div className="space-y-2">
              <Label htmlFor="leaveTypeId">Leave Type *</Label>
              <Controller
                name="leaveTypeId"
                control={control}
                render={({ field }) => (
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={isEditing}
                  >
                    <SelectTrigger className={errors.leaveTypeId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaveTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.leaveTypeId && (
                <p className="text-red-500 text-xs">{errors.leaveTypeId.message}</p>
              )}
            </div>

            {/* Year */}
            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Input
                {...register('year', { valueAsNumber: true })}
                type="number"
                min="2000"
                max="2050"
                disabled={isEditing}
                className={errors.year ? 'border-red-500' : ''}
              />
              {errors.year && (
                <p className="text-red-500 text-xs">{errors.year.message}</p>
              )}
            </div>

            {/* Total Days */}
            <div className="space-y-2">
              <Label htmlFor="totalDays">Total Days *</Label>
              <Input
                {...register('totalDays', { valueAsNumber: true })}
                type="number"
                min="0"
                step="0.5"
                placeholder="Enter total leave days"
                className={errors.totalDays ? 'border-red-500' : ''}
              />
              {errors.totalDays && (
                <p className="text-red-500 text-xs">{errors.totalDays.message}</p>
              )}
            </div>

            {/* Carried Forward */}
            <div className="space-y-2">
              <Label htmlFor="carriedForward">Carried Forward Days</Label>
              <Input
                {...register('carriedForward', { valueAsNumber: true })}
                type="number"
                min="0"
                step="0.5"
                placeholder="Enter carried forward days"
                className={errors.carriedForward ? 'border-red-500' : ''}
              />
              {errors.carriedForward && (
                <p className="text-red-500 text-xs">{errors.carriedForward.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Days carried forward from previous year
              </p>
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
                {isEditing ? 'Update' : 'Create'} Balance
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
