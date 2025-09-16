import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Bell, 
  Heart, 
  Menu, 
  Settings, 
  Sparkles,
  User,
  LogOut,
  Shield,
  Users
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationBell } from './notifications/NotificationBell';

interface HeaderProps {
  userName?: string;
  partnerName?: string;
  onMenuClick?: () => void;
  onNotificationClick?: () => void;
}

export function Header({ userName, partnerName, onMenuClick, onNotificationClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const [notifications] = useState(3);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="glass-card border-b border-glass-border px-4 py-3 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold">Together</h1>
              <p className="text-xs text-muted-foreground">Partner Collaboration</p>
            </div>
          </div>
        </div>

        {/* Center Section - Partner Status */}
        <div className="hidden md:flex items-center gap-2 glass-card px-4 py-2 rounded-full">
          <div className="flex -space-x-2">
            <Avatar className="w-8 h-8 border-2 border-white">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-gradient-primary text-white text-xs">
                {user?.name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            {user?.preferences?.partner?.isPaired && (
              <Avatar className="w-8 h-8 border-2 border-white">
                <AvatarFallback className="bg-gradient-secondary text-white text-xs">
                  {user.preferences.partner.partnerName?.[0] || 'P'}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          <div className="text-sm">
            <span className="font-medium">
              {user?.name}
              {user?.preferences?.partner?.isPaired && ` & ${user.preferences.partner.partnerName}`}
            </span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              {user?.preferences?.partner?.isPaired ? 'Both online' : 'Online'}
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <NotificationBell />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-gradient-primary text-white">
                    {user?.name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-card border-glass-border w-56" align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.preferences?.partner?.isPaired 
                      ? `Connected with ${user.preferences.partner.partnerName}`
                      : 'Not connected to partner'
                    }
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2">
                <User className="w-4 h-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </DropdownMenuItem>
              {user?.hasTwoFactor && (
                <DropdownMenuItem className="gap-2">
                  <Shield className="w-4 h-4" />
                  2FA Enabled
                </DropdownMenuItem>
              )}
              {!user?.preferences?.partner?.isPaired && (
                <DropdownMenuItem className="gap-2">
                  <Users className="w-4 h-4" />
                  Connect Partner
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="gap-2">
                <Sparkles className="w-4 h-4" />
                Premium
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="gap-2 text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}