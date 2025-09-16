import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  CheckCircle, 
  XCircle,
  MessageSquare,
  Download,
  Phone
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import { 
  useLeaveRequest, 
  useApproveLeaveRequest,
  useLeaveComments,
  useAddLeaveComment
} from '../../hooks/useLeave';
import { LeaveStatus } from '../../types';

interface LeaveRequestDetailProps {
  leaveId: string;
  onClose: () => void;
  showActions?: boolean;
}

export const LeaveRequestDetail: React.FC<LeaveRequestDetailProps> = ({
  leaveId,
  onClose,
  showActions = true
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);

  // Fetch leave request details
  const { 
    data: leaveData, 
    isLoading: leaveLoading, 
    error: leaveError 
  } = useLeaveRequest(leaveId);

  // Fetch comments
  const { 
    data: commentsData, 
    isLoading: commentsLoading 
  } = useLeaveComments(leaveId);

  // Mutations
  const approveLeaveRequest = useApproveLeaveRequest();
  const addComment = useAddLeaveComment();

  const leaveRequest = leaveData?.data;
  const comments = commentsData?.data || [];

  const getStatusBadge = (status: LeaveStatus) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      APPROVED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle },
      CANCELLED: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
      IN_PROGRESS: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      COMPLETED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      EXTENDED: { color: 'bg-purple-100 text-purple-800', icon: Calendar }
    };

    const config = statusConfig[status];
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <IconComponent size={12} />
        {status}
      </Badge>
    );
  };

  const handleApprove = async () => {
    try {
      await approveLeaveRequest.mutateAsync({
        id: leaveId,
        data: { action: 'APPROVE' }
      });
      onClose();
    } catch (error) {
      console.error('Error approving leave:', error);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      await approveLeaveRequest.mutateAsync({
        id: leaveId,
        data: { 
          action: 'REJECT', 
          rejectionReason: rejectionReason.trim()
        }
      });
      onClose();
    } catch (error) {
      console.error('Error rejecting leave:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await addComment.mutateAsync({
        leaveId,
        data: {
          content: newComment.trim(),
          isInternal: isInternalComment
        }
      });
      setNewComment('');
      setIsInternalComment(false);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (leaveLoading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (leaveError || !leaveRequest) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="text-center text-red-600 py-8">
            <p>Error loading leave request details</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Leave Request Details</span>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              <X size={16} />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {leaveRequest.employee?.firstName} {leaveRequest.employee?.lastName}
                </h3>
                <p className="text-sm text-gray-600">{leaveRequest.employee?.email}</p>
              </div>
            </div>
            <div className="text-right">
              {getStatusBadge(leaveRequest.status)}
              <p className="text-sm text-gray-500 mt-1">
                Applied on {format(new Date(leaveRequest.appliedDate), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>

          {/* Leave Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Leave Type
                </label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">{leaveRequest.leaveType?.name}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">
                    {leaveRequest.totalDays} {leaveRequest.totalDays === 1 ? 'day' : 'days'}
                    {leaveRequest.isHalfDay && ` (${leaveRequest.halfDayPeriod})`}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <p className="text-gray-900">
                  {format(new Date(leaveRequest.startDate), 'EEEE, MMMM dd, yyyy')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <p className="text-gray-900">
                  {format(new Date(leaveRequest.endDate), 'EEEE, MMMM dd, yyyy')}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-gray-500 mt-1" />
                  <p className="text-gray-900">{leaveRequest.reason}</p>
                </div>
              </div>

              {leaveRequest.emergencyContact && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact
                  </label>
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-gray-500 mt-1" />
                    <div>
                      <p className="text-gray-900">{leaveRequest.emergencyContact.name}</p>
                      <p className="text-sm text-gray-600">{leaveRequest.emergencyContact.phone}</p>
                      <p className="text-sm text-gray-600">{leaveRequest.emergencyContact.relationship}</p>
                    </div>
                  </div>
                </div>
              )}

              {leaveRequest.attachments && leaveRequest.attachments.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attachments
                  </label>
                  <div className="space-y-2">
                    {leaveRequest.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-gray-500" />
                        <a 
                          href={attachment} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Document {index + 1}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Approval Section */}
          {leaveRequest.status === 'APPROVED' && leaveRequest.approver && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Approved</span>
              </div>
              <p className="text-sm text-green-700">
                Approved by {leaveRequest.approver.firstName} {leaveRequest.approver.lastName} on{' '}
                {leaveRequest.approvedDate && format(new Date(leaveRequest.approvedDate), 'MMM dd, yyyy')}
              </p>
            </div>
          )}

          {leaveRequest.status === 'REJECTED' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-800">Rejected</span>
              </div>
              {leaveRequest.rejectionReason && (
                <p className="text-sm text-red-700">
                  Reason: {leaveRequest.rejectionReason}
                </p>
              )}
              {leaveRequest.rejectedDate && (
                <p className="text-sm text-red-700">
                  Rejected on {format(new Date(leaveRequest.rejectedDate), 'MMM dd, yyyy')}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {showActions && leaveRequest.status === 'PENDING' && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Button
                onClick={handleApprove}
                disabled={approveLeaveRequest.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle size={16} className="mr-2" />
                Approve Request
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRejectForm(!showRejectForm)}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <XCircle size={16} className="mr-2" />
                Reject Request
              </Button>
            </div>
          )}

          {/* Rejection Form */}
          {showRejectForm && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <label className="block text-sm font-medium text-red-800 mb-2">
                Reason for Rejection
              </label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a detailed reason for rejecting this leave request..."
                rows={3}
                className="mb-3"
              />
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleReject}
                  disabled={approveLeaveRequest.isPending || !rejectionReason.trim()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Confirm Rejection
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectionReason('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Comments
            </h4>

            {/* Add Comment */}
            <div className="mb-6">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
                className="mb-3"
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isInternalComment}
                    onChange={(e) => setIsInternalComment(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-600">Internal comment (not visible to employee)</span>
                </label>
                <Button
                  onClick={handleAddComment}
                  disabled={addComment.isPending || !newComment.trim()}
                  size="sm"
                >
                  Add Comment
                </Button>
              </div>
            </div>

            {/* Comments List */}
            {commentsLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : comments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No comments yet</p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div 
                    key={comment.id} 
                    className={`p-3 rounded-lg ${
                      comment.isInternal ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {comment.user?.firstName} {comment.user?.lastName}
                        </span>
                        {comment.isInternal && (
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                            Internal
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {format(new Date(comment.createdAt), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
