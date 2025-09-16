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

  // Create form for new balances
  const createForm = useForm<CreateLeaveBalanceInput>({
    resolver: zodResolver(createLeaveBalanceSchema),
    defaultValues: {
      employeeId: initialEmployeeId || '',
      leaveTypeId: '',
      year: new Date().getFullYear(),
      totalDays: 0,
      carriedForward: 0
    }
  });

  // Edit form for existing balances
  const editForm = useForm<UpdateLeaveBalanceInput>({
    resolver: zodResolver(updateLeaveBalanceSchema),
    defaultValues: {
      totalDays: 0,
      carriedForward: 0
    }
  });

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

  // Set edit form values when balance data is available
  useEffect(() => {
    if (balanceData?.data && isEditing) {
      const balance = balanceData.data;
      editForm.setValue('totalDays', balance.totalDays);
      editForm.setValue('carriedForward', balance.carriedForward);
    }
  }, [balanceData, isEditing, editForm]);

  const handleCreateSubmit = async (data: CreateLeaveBalanceInput) => {
    try {
      await createBalance.mutateAsync(data);
      toast.success('Leave balance created successfully');
      onSuccess();
    } catch (error) {
      console.error('Error creating leave balance:', error);
      toast.error('Failed to create leave balance');
    }
  };

  const handleEditSubmit = async (data: UpdateLeaveBalanceInput) => {
    try {
      if (!balanceId) return;
      await updateBalance.mutateAsync({
        id: balanceId,
        data
      });
      toast.success('Leave balance updated successfully');
      onSuccess();
    } catch (error) {
      console.error('Error updating leave balance:', error);
      toast.error('Failed to update leave balance');
    }
  };

  const isLoading = balanceLoading || typesLoading;
  const isSaving = createBalance.isPending || updateBalance.isPending;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{isEditing ? 'Edit Leave Balance' : 'Create Leave Balance'}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
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
          <>
            {isEditing && balanceData?.data && (
              <div className="space-y-2 p-3 bg-gray-50 rounded mb-4">
                <p className="text-sm"><strong>Employee:</strong> {balanceData.data.employeeId}</p>
                <p className="text-sm"><strong>Leave Type:</strong> {balanceData.data.leaveType?.name || 'N/A'}</p>
                <p className="text-sm"><strong>Year:</strong> {balanceData.data.year}</p>
              </div>
            )}

            {isEditing ? (
              <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
                {/* Total Days */}
                <div className="space-y-2">
                  <Label htmlFor="totalDays">Total Days *</Label>
                  <Input
                    {...editForm.register('totalDays', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="Enter total leave days"
                    className={editForm.formState.errors.totalDays ? 'border-red-500' : ''}
                  />
                  {editForm.formState.errors.totalDays && (
                    <p className="text-red-500 text-xs">{editForm.formState.errors.totalDays.message}</p>
                  )}
                </div>

                {/* Carried Forward */}
                <div className="space-y-2">
                  <Label htmlFor="carriedForward">Carried Forward Days</Label>
                  <Input
                    {...editForm.register('carriedForward', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="Enter carried forward days"
                    className={editForm.formState.errors.carriedForward ? 'border-red-500' : ''}
                  />
                  {editForm.formState.errors.carriedForward && (
                    <p className="text-red-500 text-xs">{editForm.formState.errors.carriedForward.message}</p>
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
                    onClick={onClose}
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
                    Update Balance
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
                {/* Employee ID */}
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID *</Label>
                  <Input
                    {...createForm.register('employeeId')}
                    placeholder="Enter employee ID"
                    className={createForm.formState.errors.employeeId ? 'border-red-500' : ''}
                  />
                  {createForm.formState.errors.employeeId && (
                    <p className="text-red-500 text-xs">{createForm.formState.errors.employeeId.message}</p>
                  )}
                </div>

                {/* Leave Type */}
                <div className="space-y-2">
                  <Label htmlFor="leaveTypeId">Leave Type *</Label>
                  <Controller
                    name="leaveTypeId"
                    control={createForm.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className={createForm.formState.errors.leaveTypeId ? 'border-red-500' : ''}>
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
                  {createForm.formState.errors.leaveTypeId && (
                    <p className="text-red-500 text-xs">{createForm.formState.errors.leaveTypeId.message}</p>
                  )}
                </div>

                {/* Year */}
                <div className="space-y-2">
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    {...createForm.register('year', { valueAsNumber: true })}
                    type="number"
                    min="2000"
                    max="2050"
                    className={createForm.formState.errors.year ? 'border-red-500' : ''}
                  />
                  {createForm.formState.errors.year && (
                    <p className="text-red-500 text-xs">{createForm.formState.errors.year.message}</p>
                  )}
                </div>

                {/* Total Days */}
                <div className="space-y-2">
                  <Label htmlFor="totalDays">Total Days *</Label>
                  <Input
                    {...createForm.register('totalDays', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="Enter total leave days"
                    className={createForm.formState.errors.totalDays ? 'border-red-500' : ''}
                  />
                  {createForm.formState.errors.totalDays && (
                    <p className="text-red-500 text-xs">{createForm.formState.errors.totalDays.message}</p>
                  )}
                </div>

                {/* Carried Forward */}
                <div className="space-y-2">
                  <Label htmlFor="carriedForward">Carried Forward Days</Label>
                  <Input
                    {...createForm.register('carriedForward', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="Enter carried forward days"
                    className={createForm.formState.errors.carriedForward ? 'border-red-500' : ''}
                  />
                  {createForm.formState.errors.carriedForward && (
                    <p className="text-red-500 text-xs">{createForm.formState.errors.carriedForward.message}</p>
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
                    onClick={onClose}
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
                    Create Balance
                  </Button>
                </div>
              </form>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
