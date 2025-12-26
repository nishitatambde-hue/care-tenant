import { ReactNode, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading, profile, tenant, roles } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user needs to complete setup (no tenant or no roles)
  const needsSetup = !tenant && !roles.includes('superadmin');

  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 overflow-auto p-6">
          {needsSetup ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-center max-w-md">
                <h2 className="text-2xl font-semibold mb-2">Welcome to HMS</h2>
                <p className="text-muted-foreground mb-6">
                  Your account has been created. Please contact your administrator to assign you to a hospital and role.
                </p>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Account Email</p>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
