import { useAuth } from '@/hooks/useAuth';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Users, Calendar, Clock, TestTube, Receipt, Activity, Stethoscope, Pill } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  const { profile, roles, tenant } = useAuth();
  const primaryRole = roles[0];

  // Demo data for stats
  const stats = [
    { title: "Today's Appointments", value: 24, icon: Calendar, variant: 'primary' as const, subtitle: 'vs yesterday' },
    { title: 'Waiting Patients', value: 8, icon: Clock, variant: 'warning' as const, subtitle: 'in queue' },
    { title: 'Consultations', value: 16, icon: Stethoscope, variant: 'success' as const, subtitle: 'completed' },
    { title: 'Pending Lab Tests', value: 12, icon: TestTube, variant: 'info' as const, subtitle: 'awaiting results' },
  ];

  const queueItems = [
    { token: 1, name: 'Rahul Sharma', status: 'in_consultation' as const, time: '09:00 AM', doctor: 'Dr. Patel' },
    { token: 2, name: 'Priya Singh', status: 'vitals_done' as const, time: '09:15 AM', doctor: 'Dr. Kumar' },
    { token: 3, name: 'Amit Kumar', status: 'checked_in' as const, time: '09:30 AM', doctor: 'Dr. Patel' },
    { token: 4, name: 'Sneha Gupta', status: 'scheduled' as const, time: '09:45 AM', doctor: 'Dr. Sharma' },
    { token: 5, name: 'Vikram Rao', status: 'scheduled' as const, time: '10:00 AM', doctor: 'Dr. Kumar' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-semibold">Welcome back, {profile?.full_name?.split(' ')[0]}</h1>
        <p className="text-muted-foreground">Here's what's happening at {tenant?.name || 'your hospital'} today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* OPD Queue */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">OPD Queue</CardTitle>
            <span className="text-sm text-muted-foreground">Live</span>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {queueItems.map((item) => (
                <div key={item.token} className="queue-card flex items-center justify-between" style={{ borderLeftColor: item.status === 'in_consultation' ? 'hsl(var(--accent))' : item.status === 'vitals_done' ? 'hsl(262 83% 58%)' : item.status === 'checked_in' ? 'hsl(var(--warning))' : 'hsl(var(--primary))' }}>
                  <div className="flex items-center gap-4">
                    <div className="token-display bg-primary/10 text-primary">{item.token}</div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.doctor} • {item.time}</p>
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: Users, label: 'Register Patient', color: 'bg-primary/10 text-primary' },
              { icon: Calendar, label: 'Book Appointment', color: 'bg-success/10 text-success' },
              { icon: Activity, label: 'Record Vitals', color: 'bg-warning/10 text-warning' },
              { icon: TestTube, label: 'Order Lab Test', color: 'bg-info/10 text-info' },
              { icon: Pill, label: 'Dispense Medicine', color: 'bg-accent/10 text-accent' },
              { icon: Receipt, label: 'Create Invoice', color: 'bg-destructive/10 text-destructive' },
            ].map((action) => (
              <button key={action.label} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left">
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <span className="font-medium text-sm">{action.label}</span>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
