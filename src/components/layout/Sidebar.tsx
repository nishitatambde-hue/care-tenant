import { useAuth } from '@/hooks/useAuth';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  Stethoscope,
  TestTube,
  Pill,
  Receipt,
  Settings,
  Building2,
  UserCog,
  Activity,
  ChevronLeft,
  ChevronRight,
  FileText,
  Bed,
  Package,
  BarChart3,
} from 'lucide-react';
import type { AppRole } from '@/types/hms';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: AppRole[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['superadmin', 'admin', 'reception', 'doctor', 'nurse', 'lab_staff', 'pharmacy'],
  },
  {
    label: 'Patients',
    href: '/patients',
    icon: Users,
    roles: ['admin', 'reception', 'doctor', 'nurse'],
  },
  {
    label: 'Appointments',
    href: '/appointments',
    icon: Calendar,
    roles: ['admin', 'reception', 'doctor', 'nurse'],
  },
  {
    label: 'OPD Queue',
    href: '/opd-queue',
    icon: ClipboardList,
    roles: ['admin', 'reception', 'doctor', 'nurse'],
  },
  {
    label: 'Consultations',
    href: '/consultations',
    icon: Stethoscope,
    roles: ['doctor'],
  },
  {
    label: 'Vitals',
    href: '/vitals',
    icon: Activity,
    roles: ['nurse', 'doctor'],
  },
  {
    label: 'Lab Orders',
    href: '/lab-orders',
    icon: TestTube,
    roles: ['doctor', 'lab_staff'],
  },
  {
    label: 'Pharmacy',
    href: '/pharmacy',
    icon: Pill,
    roles: ['pharmacy', 'admin'],
  },
  {
    label: 'Inventory',
    href: '/inventory',
    icon: Package,
    roles: ['pharmacy', 'admin'],
  },
  {
    label: 'Billing',
    href: '/billing',
    icon: Receipt,
    roles: ['admin', 'reception'],
  },
  {
    label: 'EHR',
    href: '/ehr',
    icon: FileText,
    roles: ['doctor', 'nurse', 'admin'],
  },
  {
    label: 'IPD',
    href: '/ipd',
    icon: Bed,
    roles: ['admin', 'nurse', 'doctor'],
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: BarChart3,
    roles: ['admin', 'superadmin'],
  },
  {
    label: 'Staff',
    href: '/staff',
    icon: UserCog,
    roles: ['admin', 'superadmin'],
  },
  {
    label: 'Tenants',
    href: '/tenants',
    icon: Building2,
    roles: ['superadmin'],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['admin', 'superadmin'],
  },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { roles, tenant, hasAnyRole } = useAuth();
  const location = useLocation();

  const filteredNavItems = navItems.filter((item) =>
    hasAnyRole(item.roles)
  );

  return (
    <aside
      className={cn(
        'h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 border-r border-sidebar-border',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">HMS</span>
              {tenant && (
                <span className="text-xs text-sidebar-foreground/60 truncate max-w-[140px]">
                  {tenant.name}
                </span>
              )}
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center mx-auto">
            <Stethoscope className="h-5 w-5 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className={cn(
                    'nav-item',
                    isActive && 'active',
                    collapsed && 'justify-center px-0'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className={cn('h-5 w-5 shrink-0', collapsed && 'mx-auto')} />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={onToggle}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors',
            collapsed && 'justify-center px-0'
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
