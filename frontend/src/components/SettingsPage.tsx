import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { 
  User, 
  Shield, 
  Bell, 
  Eye, 
  EyeOff, 
  Smartphone,
  Mail,
  Lock,
  Save,
  Camera
} from 'lucide-react';
import { useAuth } from './auth/AuthContext';
import { toast } from 'sonner';

export function SettingsPage() {
  const { user } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  type SettingKey = 'emailNotifications' | 'pushNotifications' | 'smsNotifications' | 'twoFactorAuth' | 'loginAlerts' | 'marketingEmails';

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: true,
    twoFactorAuth: false,
    loginAlerts: true,
    marketingEmails: false
  });

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully');
  };

  const handleSavePassword = () => {
    toast.success('Password updated successfully');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved');
  };

  const toggleSetting = (key: SettingKey) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4 justify-between"
      >
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Settings</h2>
          <p className="text-gray-600">Manage your account preferences and security</p>
        </div>
      </motion.div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 rounded-xl">
          <TabsTrigger value="profile" className="rounded-lg">Profile</TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg">Security</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg">Notifications</TabsTrigger>
          <TabsTrigger value="privacy" className="rounded-lg">Privacy</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Update your personal details and profile picture</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-gray-100 text-lg">
                        {user?.name?.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#9AE6B4] hover:bg-[#7dd69e] p-0"
                    >
                      <Camera className="w-4 h-4 text-gray-800" />
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{user?.name}</h3>
                    <p className="text-sm text-gray-600">{user?.role}</p>
                    <Button variant="outline" size="sm" className="mt-2 rounded-lg">
                      Change Photo
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Form Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input defaultValue="Krist" className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input defaultValue="Hansen" className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input defaultValue={user?.email} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input defaultValue="+1 (555) 123-4567" className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input defaultValue="Human Resources" className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Job Title</Label>
                    <Input defaultValue={user?.role} className="rounded-xl" />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} className="bg-[#9AE6B4] hover:bg-[#7dd69e] text-gray-800 rounded-xl">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {/* Change Password */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Change Password
                </CardTitle>
                <CardDescription>Ensure your account is secure with a strong password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="rounded-xl pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      className="rounded-xl pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input type="password" className="rounded-xl" />
                </div>
                <Button onClick={handleSavePassword} className="bg-[#9AE6B4] hover:bg-[#7dd69e] text-gray-800 rounded-xl">
                  Update Password
                </Button>
              </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Two-Factor Authentication
                </CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-800">Authenticator App</p>
                      <p className="text-sm text-gray-600">Use an app like Google Authenticator</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.twoFactorAuth}
                    onCheckedChange={() => toggleSetting('twoFactorAuth')}
                  />
                </div>
                
                {settings.twoFactorAuth && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-blue-50 rounded-xl border border-blue-200"
                  >
                    <p className="text-sm text-blue-800">
                      Two-factor authentication is enabled. You'll need to enter a code from your authenticator app when signing in.
                    </p>
                    <Button variant="outline" size="sm" className="mt-2 rounded-lg">
                      View Recovery Codes
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-800">Email Notifications</p>
                        <p className="text-sm text-gray-600">Receive updates via email</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={() => toggleSetting('emailNotifications')}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-800">Push Notifications</p>
                        <p className="text-sm text-gray-600">Get notifications on your devices</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={() => toggleSetting('pushNotifications')}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-800">SMS Notifications</p>
                        <p className="text-sm text-gray-600">Receive important alerts via SMS</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.smsNotifications}
                      onCheckedChange={() => toggleSetting('smsNotifications')}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-800">Login Alerts</p>
                        <p className="text-sm text-gray-600">Get notified of new sign-ins</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.loginAlerts}
                      onCheckedChange={() => toggleSetting('loginAlerts')}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications} className="bg-[#9AE6B4] hover:bg-[#7dd69e] text-gray-800 rounded-xl">
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Privacy Controls
                </CardTitle>
                <CardDescription>Manage your privacy and data preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-800">Profile Visibility</p>
                      <p className="text-sm text-gray-600">Control who can see your profile information</p>
                    </div>
                    <select className="px-3 py-2 border border-gray-200 rounded-lg bg-white">
                      <option>Everyone</option>
                      <option>Team Only</option>
                      <option>Private</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-800">Marketing Emails</p>
                      <p className="text-sm text-gray-600">Receive promotional and marketing content</p>
                    </div>
                    <Switch
                      checked={settings.marketingEmails}
                      onCheckedChange={() => toggleSetting('marketingEmails')}
                    />
                  </div>

                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <h4 className="font-medium text-red-800 mb-2">Danger Zone</h4>
                    <p className="text-sm text-red-600 mb-3">
                      These actions cannot be undone. Please proceed with caution.
                    </p>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg">
                        Download My Data
                      </Button>
                      <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}