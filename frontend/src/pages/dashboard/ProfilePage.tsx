import React, { useState } from "react";
import { Mail, Phone, MapPin, Edit, Save, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import {Button} from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea";

export const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@uptiq.com",
    phone: "+1 (555) 123-4567",
    department: "Human Resources",
    position: "HR Manager",
    location: "New York, NY",
    bio: "Experienced HR professional with 8+ years in talent management and employee relations.",
    hireDate: "2020-03-15",
    employeeId: "EMP-001",
    manager: "Sarah Wilson",
    workLocation: "Office",
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to API
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data if needed
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Profile</h1>
          <p className="text-text-secondary mt-1">
            Manage your personal information
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card className="p-6 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-green-medium to-primary-green-dark rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">
                {profileData.firstName[0]}
                {profileData.lastName[0]}
              </span>
            </div>

            <h2 className="text-xl font-semibold text-text-primary">
              {profileData.firstName} {profileData.lastName}
            </h2>
            <p className="text-text-secondary mt-1">{profileData.position}</p>
            <p className="text-sm text-text-secondary">
              {profileData.department}
            </p>

            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
                <Mail className="w-4 h-4" />
                <span>{profileData.email}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
                <Phone className="w-4 h-4" />
                <span>{profileData.phone}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
                <MapPin className="w-4 h-4" />
                <span>{profileData.location}</span>
              </div>
            </div>

            {/* Employee Info */}
            <div className="mt-6 pt-6 border-t border-neutral-border">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Employee ID:</span>
                  <span className="text-text-primary font-medium">
                    {profileData.employeeId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Hire Date:</span>
                  <span className="text-text-primary font-medium">
                    {profileData.hireDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Manager:</span>
                  <span className="text-text-primary font-medium">
                    {profileData.manager}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Work Location:</span>
                  <span className="text-text-primary font-medium">
                    {profileData.workLocation}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-6">
              Personal Information
            </h3>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
                <Input
                  label="Phone Number"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Department"
                  name="department"
                  value={profileData.department}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
                <Input
                  label="Position"
                  name="position"
                  value={profileData.position}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Location"
                  name="location"
                  value={profileData.location}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
                <Input
                  label="Work Location"
                  name="workLocation"
                  value={profileData.workLocation}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <Textarea
                label="Bio"
                name="bio"
                value={profileData.bio}
                onChange={handleChange}
                rows={4}
                disabled={!isEditing}
                placeholder="Tell us about yourself..."
              />
            </form>
          </Card>

          {/* Skills & Certifications */}
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-semibold text-text-primary mb-6">
              Skills & Certifications
            </h3>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-text-primary mb-2">
                  Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    "HR Management",
                    "Talent Acquisition",
                    "Employee Relations",
                    "Performance Management",
                  ].map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-primary-green-light text-primary-green-dark text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-text-primary mb-2">
                  Certifications
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-neutral-background rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        SHRM-CP
                      </p>
                      <p className="text-xs text-text-secondary">
                        Society for Human Resource Management
                      </p>
                    </div>
                    <span className="text-xs text-text-secondary">2022</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-background rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        PHR
                      </p>
                      <p className="text-xs text-text-secondary">
                        Professional in Human Resources
                      </p>
                    </div>
                    <span className="text-xs text-text-secondary">2021</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
