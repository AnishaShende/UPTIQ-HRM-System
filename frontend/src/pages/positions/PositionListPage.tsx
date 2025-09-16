import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Building2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { positionApi } from "@/lib/api";
import { Position } from "@/types";
import { toast } from "sonner";

export const PositionListPage: React.FC = () => {
  const navigate = useNavigate();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState<Position | null>(null);

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    try {
      setLoading(true);
      const response = await positionApi.getAll();
      setPositions(response.data || []);
    } catch (error) {
      toast.error("Failed to load positions");
      console.error("Failed to load positions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePosition = async () => {
    if (!positionToDelete) return;

    try {
      await positionApi.delete(positionToDelete.id);
      toast.success("Position deleted successfully");
      setDeleteDialogOpen(false);
      setPositionToDelete(null);
      loadPositions();
    } catch (error) {
      toast.error("Failed to delete position");
      console.error("Failed to delete position:", error);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "INACTIVE":
        return "warning";
      case "PENDING":
        return "info";
      case "DELETED":
        return "destructive";
      default:
        return "default";
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-purple-light rounded-lg flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-primary-purple-dark" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Positions</h1>
            <p className="text-text-secondary">
              Manage job positions and roles
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate("/positions/new")}
          className="bg-primary-purple-dark hover:bg-primary-purple text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Position
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-purple-light rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary-purple-dark" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{positions.length}</p>
              <p className="text-sm text-text-secondary">Total Positions</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-green-light rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary-green-dark" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {positions.filter(pos => pos.status === 'ACTIVE').length}
              </p>
              <p className="text-sm text-text-secondary">Active</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-blue-light rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-blue-dark" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {new Set(positions.map(pos => pos.departmentId)).size}
              </p>
              <p className="text-sm text-text-secondary">Departments</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-orange-light rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary-orange-dark" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {positions.filter(pos => pos.minSalary || pos.maxSalary).length}
              </p>
              <p className="text-sm text-text-secondary">With Salary Range</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Positions Grid */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="w-8 h-8" />
          </div>
        ) : positions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {positions.map((position) => (
              <Card key={position.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-purple-light rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-primary-purple-dark" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">{position.title}</h3>
                      <p className="text-text-secondary text-sm">
                        {position.department?.name}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getStatusBadgeVariant(position.status)}>
                    {position.status}
                  </Badge>
                </div>

                {position.description && (
                  <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                    {position.description}
                  </p>
                )}

                {/* Salary Range */}
                {(position.minSalary || position.maxSalary) && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-text-secondary" />
                      <span className="text-sm font-medium text-text-primary">Salary Range</span>
                    </div>
                    <p className="text-text-primary">
                      {position.minSalary ? formatCurrency(position.minSalary) : 'N/A'} -{' '}
                      {position.maxSalary ? formatCurrency(position.maxSalary) : 'N/A'}
                    </p>
                  </div>
                )}

                {/* Requirements */}
                {position.requirements && position.requirements.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-text-primary mb-2">Key Requirements</p>
                    <ul className="text-sm text-text-secondary space-y-1">
                      {position.requirements.slice(0, 3).map((requirement, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-1 h-1 bg-text-secondary rounded-full mt-2 flex-shrink-0"></span>
                          <span className="line-clamp-1">{requirement}</span>
                        </li>
                      ))}
                      {position.requirements.length > 3 && (
                        <li className="text-xs text-text-secondary italic">
                          +{position.requirements.length - 3} more...
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Employees Count */}
                {position.employees && (
                  <div className="mb-4">
                    <p className="text-sm text-text-secondary">
                      {position.employees.length} employee{position.employees.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-neutral-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/positions/${position.id}/edit`)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPositionToDelete(position);
                      setDeleteDialogOpen(true);
                    }}
                    className="text-accent-error hover:text-accent-error"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Briefcase className="w-12 h-12 text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No positions found
            </h3>
            <p className="text-text-secondary mb-6">
              Get started by creating your first position.
            </p>
            <Button
              onClick={() => navigate("/positions/new")}
              className="bg-primary-purple-dark hover:bg-primary-purple text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Position
            </Button>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Delete Position
          </h3>
          <p className="text-text-secondary mb-6">
            Are you sure you want to delete{" "}
            <strong>{positionToDelete?.title}</strong>? This action cannot be undone.
          </p>
          <div className="flex items-center gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePosition}
            >
              Delete
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
