import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  User, 
  Heart, 
  Settings, 
  Bell, 
  Shield,
  Palette,
  Globe,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Camera,
  Star,
  Trophy,
  Clock,
  Key,
  Smartphone,
  AlertCircle,
  CheckCircle,
  LogOut,
  Edit,
  Save,
  X
} from 'lucide-react';

export function Profile() {
  const { user, updateProfile, logout, setupTwoFactor, verifyTwoFactorSetup, disableTwoFactor } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [twoFactorQrCode, setTwoFactorQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profile, setProfile] = useState({
    name: user?.name || 'Alex Johnson',
    email: user?.email || 'alex@example.com',
    phone: user?.phoneNumber || '+1 (555) 123-4567',
    location: 'New York, USA',
    bio: 'In a wonderful long-distance relationship with Sam. Love traveling, cooking, and planning our future together! 💕',
    relationshipStatus: 'In a relationship',
    partnerName: 'Sam Wilson',
    relationshipStart: '2023-01-15',
    timezone: 'America/New_York',
    language: 'English',
    currency: 'USD',
    themeColor: user?.themeColor || 'blue',
    avatar: user?.avatar || ''
  });

  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
        phone: user.phoneNumber || prev.phone,
        themeColor: user.themeColor || prev.themeColor,
        avatar: user.avatar || prev.avatar
      }));
    }
  }, [user]);

  const [settings, setSettings] = useState({
    notifications: user?.preferences?.notifications?.push ?? true,
    emailNotifications: user?.preferences?.notifications?.email ?? true,
    pushNotifications: user?.preferences?.notifications?.push ?? true,
    smsNotifications: user?.preferences?.notifications?.sms ?? false,
    taskReminders: true,
    financeAlerts: true,
    eventReminders: true,
    partnerUpdates: true,
    systemUpdates: true,
    darkMode: true,
    autoSync: true,
    locationSharing: user?.preferences?.privacy?.shareLocation ?? false,
    activitySharing: user?.preferences?.privacy?.shareActivity ?? true,
  });

  const handleSaveProfile = async () => {
    setError('');
    setSuccess('');

    try {
      const result = await updateProfile({
        name: profile.name,
        phoneNumber: profile.phone,
        themeColor: profile.themeColor,
        avatar: profile.avatar,
        preferences: {
          notifications: {
            push: settings.pushNotifications,
            email: settings.emailNotifications,
            sms: settings.smsNotifications
          },
          privacy: {
            shareLocation: settings.locationSharing,
            shareActivity: settings.activitySharing
          }
        }
      });

      if (result.success) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (error) {
      setError('Failed to update profile');
    }
  };

  const handleTwoFactorSetup = async () => {
    setError('');
    try {
      const result = await setupTwoFactor();
      setTwoFactorSecret(result.secret);
      setTwoFactorQrCode(result.qrCode);
      setBackupCodes(result.backupCodes);
      setShowTwoFactorSetup(true);
    } catch (error) {
      setError('Failed to setup two-factor authentication');
    }
  };

  const handleTwoFactorVerify = async () => {
    setError('');
    try {
      const result = await verifyTwoFactorSetup(twoFactorCode);
      if (result.success) {
        setSuccess('Two-factor authentication enabled successfully!');
        setBackupCodes(result.backupCodes || []);
        setShowTwoFactorSetup(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Invalid verification code');
      }
    } catch (error) {
      setError('Failed to verify two-factor authentication');
    }
  };

  const handleDisableTwoFactor = async () => {
    setError('');
    try {
      const result = await disableTwoFactor(''); // Would need password input
      if (result.success) {
        setSuccess('Two-factor authentication disabled successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to disable two-factor authentication');
      }
    } catch (error) {
      setError('Failed to disable two-factor authentication');
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const themeColors = [
    { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
    { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
    { name: 'Pink', value: 'pink', class: 'bg-pink-500' },
    { name: 'Green', value: 'green', class: 'bg-green-500' },
    { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
    { name: 'Teal', value: 'teal', class: 'bg-teal-500' },
    { name: 'Red', value: 'red', class: 'bg-red-500' },
    { name: 'Indigo', value: 'indigo', class: 'bg-indigo-500' }
  ];

  const [stats] = useState({
    tasksCompleted: 127,
    streakDays: 15,
    totalEvents: 23,
    savingsGoals: 3,
    joinDate: '2023-01-01',
  });

  const handleProfileUpdate = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSettingsUpdate = (field: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const getStreakLevel = (days: number) => {
    if (days >= 30) return { level: 'Gold', color: 'bg-gradient-secondary', icon: '🏆' };
    if (days >= 14) return { level: 'Silver', color: 'bg-gradient-primary', icon: '⭐' };
    if (days >= 7) return { level: 'Bronze', color: 'bg-gradient-coral', icon: '🥉' };
    return { level: 'Starter', color: 'bg-muted', icon: '🎯' };
  };

  const streakInfo = getStreakLevel(stats.streakDays);

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="glass-card border-glass-border">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar Section */}
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white shadow-glow">
                <AvatarFallback className="bg-gradient-primary text-white text-2xl">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <Button 
                size="sm" 
                className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 bg-gradient-primary"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <p className="text-muted-foreground mb-2">{profile.email}</p>
              <p className="text-sm mb-4">{profile.bio}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {profile.location}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(stats.joinDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  With {profile.partnerName} since {new Date(profile.relationshipStart).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Streak Badge */}
            <div className="text-center">
              <div className={`w-20 h-20 rounded-full ${streakInfo.color} flex items-center justify-center text-white text-2xl mb-2`}>
                {streakInfo.icon}
              </div>
              <div className="text-sm">
                <div className="font-bold">{stats.streakDays} Days</div>
                <div className="text-muted-foreground">{streakInfo.level} Streak</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card border-glass-border text-center">
          <CardContent className="p-4">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-secondary" />
            <div className="text-2xl font-bold">{stats.tasksCompleted}</div>
            <div className="text-xs text-muted-foreground">Tasks Done</div>
          </CardContent>
        </Card>
        <Card className="glass-card border-glass-border text-center">
          <CardContent className="p-4">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <div className="text-xs text-muted-foreground">Events Planned</div>
          </CardContent>
        </Card>
        <Card className="glass-card border-glass-border text-center">
          <CardContent className="p-4">
            <Star className="w-8 h-8 mx-auto mb-2 text-accent-coral" />
            <div className="text-2xl font-bold">{stats.savingsGoals}</div>
            <div className="text-xs text-muted-foreground">Savings Goals</div>
          </CardContent>
        </Card>
        <Card className="glass-card border-glass-border text-center">
          <CardContent className="p-4">
            <Clock className="w-8 h-8 mx-auto mb-2 text-accent-teal" />
            <div className="text-2xl font-bold">{stats.streakDays}</div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="glass-card border-glass-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <Input
                value={profile.name}
                onChange={(e) => handleProfileUpdate('name', e.target.value)}
                className="glass-card border-glass-border"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => handleProfileUpdate('email', e.target.value)}
                className="glass-card border-glass-border"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={profile.phone}
                onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                className="glass-card border-glass-border"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                value={profile.location}
                onChange={(e) => handleProfileUpdate('location', e.target.value)}
                className="glass-card border-glass-border"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Bio</label>
              <Textarea
                value={profile.bio}
                onChange={(e) => handleProfileUpdate('bio', e.target.value)}
                className="glass-card border-glass-border"
                placeholder="Tell us about yourself..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Relationship Info */}
        <Card className="glass-card border-glass-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Relationship
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Partner Name</label>
              <Input
                value={profile.partnerName}
                onChange={(e) => handleProfileUpdate('partnerName', e.target.value)}
                className="glass-card border-glass-border"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Relationship Start Date</label>
              <Input
                type="date"
                value={profile.relationshipStart}
                onChange={(e) => handleProfileUpdate('relationshipStart', e.target.value)}
                className="glass-card border-glass-border"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={profile.relationshipStatus} onValueChange={(value) => handleProfileUpdate('relationshipStatus', value)}>
                <SelectTrigger className="glass-card border-glass-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-glass-border">
                  <SelectItem value="Single">Single</SelectItem>
                  <SelectItem value="In a relationship">In a relationship</SelectItem>
                  <SelectItem value="Engaged">Engaged</SelectItem>
                  <SelectItem value="Married">Married</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="bg-gradient-primary/10 rounded-lg p-4">
              <h4 className="font-medium mb-2">Relationship Duration</h4>
              <p className="text-2xl font-bold text-primary">
                {Math.floor((new Date().getTime() - new Date(profile.relationshipStart).getTime()) / (1000 * 60 * 60 * 24))} days
              </p>
              <p className="text-sm text-muted-foreground">
                {((new Date().getTime() - new Date(profile.relationshipStart).getTime()) / (1000 * 60 * 60 * 24 * 365)).toFixed(1)} years together
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="glass-card border-glass-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Timezone</label>
              <Select value={profile.timezone} onValueChange={(value) => handleProfileUpdate('timezone', value)}>
                <SelectTrigger className="glass-card border-glass-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-glass-border">
                  <SelectItem value="America/New_York">Eastern Time (UTC-5)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (UTC-6)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (UTC-8)</SelectItem>
                  <SelectItem value="Europe/London">GMT (UTC+0)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Japan Time (UTC+9)</SelectItem>
                  <SelectItem value="Asia/Kolkata">India Time (UTC+5:30)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Language</label>
              <Select value={profile.language} onValueChange={(value) => handleProfileUpdate('language', value)}>
                <SelectTrigger className="glass-card border-glass-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-glass-border">
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Spanish">Español</SelectItem>
                  <SelectItem value="French">Français</SelectItem>
                  <SelectItem value="German">Deutsch</SelectItem>
                  <SelectItem value="Hindi">हिंदी</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Currency</label>
              <Select value={profile.currency} onValueChange={(value) => handleProfileUpdate('currency', value)}>
                <SelectTrigger className="glass-card border-glass-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-glass-border">
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="glass-card border-glass-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
              </div>
              <Switch 
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => handleSettingsUpdate('pushNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Get updates via email</p>
              </div>
              <Switch 
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingsUpdate('emailNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Task Reminders</p>
                <p className="text-sm text-muted-foreground">Reminders for upcoming tasks</p>
              </div>
              <Switch 
                checked={settings.taskReminders}
                onCheckedChange={(checked) => handleSettingsUpdate('taskReminders', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Finance Alerts</p>
                <p className="text-sm text-muted-foreground">Budget and expense notifications</p>
              </div>
              <Switch 
                checked={settings.financeAlerts}
                onCheckedChange={(checked) => handleSettingsUpdate('financeAlerts', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto Sync</p>
                <p className="text-sm text-muted-foreground">Automatically sync data across devices</p>
              </div>
              <Switch 
                checked={settings.autoSync}
                onCheckedChange={(checked) => handleSettingsUpdate('autoSync', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security & Authentication */}
        <Card className="glass-card border-glass-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security & Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <Key className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.twoFactorEnabled ? 'Enabled' : 'Add an extra layer of security'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user?.twoFactorEnabled ? (
                    <Badge className="bg-success text-white">Enabled</Badge>
                  ) : (
                    <Badge variant="outline">Disabled</Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={user?.twoFactorEnabled ? handleDisableTwoFactor : handleTwoFactorSetup}
                  >
                    {user?.twoFactorEnabled ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-teal rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive security alerts via SMS</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => handleSettingsUpdate('smsNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-coral rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Location Sharing</p>
                    <p className="text-sm text-muted-foreground">Share your location with your partner</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.locationSharing}
                  onCheckedChange={(checked) => handleSettingsUpdate('locationSharing', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-secondary rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Activity Sharing</p>
                    <p className="text-sm text-muted-foreground">Share your activity status with your partner</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.activitySharing}
                  onCheckedChange={(checked) => handleSettingsUpdate('activitySharing', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Customization */}
        <Card className="glass-card border-glass-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Theme Customization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Choose Your Theme Color</Label>
              <div className="grid grid-cols-4 gap-3">
                {themeColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setProfile(prev => ({ ...prev, themeColor: color.value }))}
                    className={`w-12 h-12 rounded-lg ${color.class} border-2 transition-all ${
                      profile.themeColor === color.value 
                        ? 'border-foreground scale-110 shadow-lg' 
                        : 'border-transparent hover:scale-105'
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Avatar</Label>
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-4 border-white shadow-glow">
                  <AvatarFallback className="bg-gradient-primary text-white text-xl">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Camera className="w-4 h-4" />
                    Upload Photo
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two-Factor Setup Dialog */}
        <Dialog open={showTwoFactorSetup} onOpenChange={setShowTwoFactorSetup}>
          <DialogContent className="glass-card border-glass-border max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Setup Two-Factor Authentication
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Scan this QR code with your authenticator app:
                </p>
                <div className="bg-white p-4 rounded-lg inline-block">
                  <img src={twoFactorQrCode} alt="2FA QR Code" className="w-48 h-48" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Enter the 6-digit code from your app:</Label>
                <Input
                  type="text"
                  placeholder="000000"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  maxLength={6}
                />
              </div>

              {backupCodes.length > 0 && (
                <div className="space-y-2">
                  <Label>Backup Codes (save these securely):</Label>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                      {backupCodes.map((code, index) => (
                        <div key={index}>{code}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleTwoFactorVerify}
                  disabled={twoFactorCode.length !== 6}
                  className="flex-1 bg-gradient-primary"
                >
                  Verify & Enable
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowTwoFactorSetup(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Save Button */}
      <Card className="glass-card border-glass-border">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2 text-destructive border-destructive hover:bg-destructive hover:text-white"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
            
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                className="glass-card border-glass-border"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveProfile}
                className="bg-gradient-primary hover-lift gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}