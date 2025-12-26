import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Menu, LogOut, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuToggle: () => void;
}

const roleColors: Record<string, string> = {
  superadmin: 'bg-role-superadmin text-white',
  admin: 'bg-role-admin text-white',
  reception: 'bg-role-reception text-white',
  doctor: 'bg-role-doctor text-white',
  nurse: 'bg-role-nurse text-white',
  lab_staff: 'bg-role-lab text-white',
  pharmacy: 'bg-role-pharmacy text-white',
};

const roleLabels: Record<string, string> = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  reception: 'Reception',
  doctor: 'Doctor',
  nurse: 'Nurse',
  lab_staff: 'Lab Staff',
  pharmacy: 'Pharmacy',
};

export function Header({ onMenuToggle }: HeaderProps) {
  const { profile, roles, signOut, tenant } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const primaryRole = roles[0];

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden md:block">
          <h1 className="text-lg font-semibold text-foreground">
            Hospital Management System
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 h-auto py-2 px-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium">{profile?.full_name}</span>
                {primaryRole && (
                  <Badge 
                    className={cn(
                      'text-[10px] px-1.5 py-0 h-4',
                      roleColors[primaryRole]
                    )}
                  >
                    {roleLabels[primaryRole]}
                  </Badge>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{profile?.full_name}</span>
                <span className="text-xs text-muted-foreground font-normal">
                  {profile?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            {tenant && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                  {tenant.name}
                </DropdownMenuLabel>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
