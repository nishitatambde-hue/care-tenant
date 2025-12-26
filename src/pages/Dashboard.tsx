import { useAuth } from '@/hooks/useAuth';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { 
  Users, Calendar, Clock, TestTube, Receipt, Activity, 
  Stethoscope, Pill, TrendingUp, ArrowUpRight, ArrowDownRight,
  UserPlus, ClipboardList, Bell, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function Dashboard() {
  const { profile, roles, tenant } = useAuth();
  const navigate = useNavigate();
  const primaryRole = roles[0];

  // Demo data for charts
  const weeklyData = [
    { name: 'Mon', patients: 45, revenue: 12500 },
    { name: 'Tue', patients: 52, revenue: 14200 },
    { name: 'Wed', patients: 48, revenue: 13800 },
    { name: 'Thu', patients: 61, revenue: 16500 },
    { name: 'Fri', patients: 55, revenue: 15200 },
    { name: 'Sat', patients: 38, revenue: 9800 },
    { name: 'Sun', patients: 22, revenue: 5600 },
  ];

  const departmentData = [
    { name: 'General', value: 35, color: 'hsl(199, 89%, 48%)' },
    { name: 'Cardiology', value: 25, color: 'hsl(142, 71%, 45%)' },
    { name: 'Pediatrics', value: 20, color: 'hsl(38, 92%, 50%)' },
    { name: 'Orthopedics', value: 15, color: 'hsl(262, 83%, 58%)' },
    { name: 'Others', value: 5, color: 'hsl(215, 16%, 47%)' },
  ];

  const queueItems = [
    { token: 1, name: 'Rahul Sharma', status: 'in_consultation' as const, time: '09:00 AM', doctor: 'Dr. Patel', age: 45 },
    { token: 2, name: 'Priya Singh', status: 'vitals_done' as const, time: '09:15 AM', doctor: 'Dr. Kumar', age: 32 },
    { token: 3, name: 'Amit Kumar', status: 'checked_in' as const, time: '09:30 AM', doctor: 'Dr. Patel', age: 28 },
    { token: 4, name: 'Sneha Gupta', status: 'scheduled' as const, time: '09:45 AM', doctor: 'Dr. Sharma', age: 55 },
    { token: 5, name: 'Vikram Rao', status: 'scheduled' as const, time: '10:00 AM', doctor: 'Dr. Kumar', age: 62 },
  ];

  const recentActivities = [
    { action: 'Patient registered', user: 'Reception', time: '2 min ago', icon: UserPlus, color: 'text-success' },
    { action: 'Lab result published', user: 'Dr. Kumar', time: '15 min ago', icon: TestTube, color: 'text-info' },
    { action: 'Invoice generated', user: 'Billing', time: '32 min ago', icon: Receipt, color: 'text-warning' },
    { action: 'Prescription created', user: 'Dr. Patel', time: '1 hr ago', icon: Pill, color: 'text-accent' },
    { action: 'Vitals recorded', user: 'Nurse Rekha', time: '1.5 hr ago', icon: Activity, color: 'text-purple-500' },
  ];

  const upcomingAppointments = [
    { patient: 'Meera Joshi', time: '10:30 AM', type: 'Follow-up', doctor: 'Dr. Patel' },
    { patient: 'Rajesh Khanna', time: '11:00 AM', type: 'New', doctor: 'Dr. Kumar' },
    { patient: 'Anita Desai', time: '11:30 AM', type: 'Follow-up', doctor: 'Dr. Sharma' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            Welcome back, {profile?.full_name?.split(' ')[0]} 👋
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening at {tenant?.name || 'your hospital'} today
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            3 Alerts
          </Button>
          <Button size="sm" onClick={() => navigate('/patients')}>
            <UserPlus className="h-4 w-4 mr-2" />
            New Patient
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Appointments"
          value={24}
          icon={Calendar}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
          subtitle="from yesterday"
        />
        <StatCard
          title="Waiting Patients"
          value={8}
          icon={Clock}
          variant="warning"
          subtitle="in queue now"
        />
        <StatCard
          title="Consultations"
          value={16}
          icon={Stethoscope}
          variant="success"
          trend={{ value: 8, isPositive: true }}
          subtitle="completed"
        />
        <StatCard
          title="Today's Revenue"
          value="₹42,850"
          icon={TrendingUp}
          variant="info"
          trend={{ value: 15, isPositive: true }}
          subtitle="from yesterday"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Visits Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-semibold">Patient Visits</CardTitle>
              <CardDescription>Weekly patient flow overview</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              View Report <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="patients" 
                    stroke="hsl(199, 89%, 48%)" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorPatients)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Department Visits</CardTitle>
            <CardDescription>Today's distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {departmentData.map((dept) => (
                <div key={dept.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }} />
                    <span>{dept.name}</span>
                  </div>
                  <span className="font-medium">{dept.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* OPD Queue */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
                Live OPD Queue
              </CardTitle>
              <CardDescription>Current patient status</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/opd-queue')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {queueItems.map((item) => (
                <div 
                  key={item.token} 
                  className="queue-card flex items-center justify-between" 
                  style={{ 
                    borderLeftColor: 
                      item.status === 'in_consultation' ? 'hsl(var(--accent))' : 
                      item.status === 'vitals_done' ? 'hsl(262, 83%, 58%)' : 
                      item.status === 'checked_in' ? 'hsl(var(--warning))' : 
                      'hsl(var(--primary))' 
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="token-display bg-primary/10 text-primary font-bold">
                      {item.token}
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.doctor} • {item.time} • {item.age}y
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity & Quick Actions */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${activity.color}`}>
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {[
                { icon: UserPlus, label: 'New Patient', color: 'bg-primary/10 text-primary', href: '/patients' },
                { icon: Calendar, label: 'Appointment', color: 'bg-success/10 text-success', href: '/appointments' },
                { icon: Activity, label: 'Vitals', color: 'bg-warning/10 text-warning', href: '/vitals' },
                { icon: TestTube, label: 'Lab Order', color: 'bg-info/10 text-info', href: '/lab-orders' },
                { icon: Pill, label: 'Dispense', color: 'bg-accent/10 text-accent', href: '/pharmacy' },
                { icon: Receipt, label: 'Invoice', color: 'bg-destructive/10 text-destructive', href: '/billing' },
              ].map((action) => (
                <Button 
                  key={action.label} 
                  variant="ghost" 
                  className="h-auto py-3 flex flex-col items-center gap-2 hover:bg-muted"
                  onClick={() => navigate(action.href)}
                >
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <action.icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
            <CardDescription>Daily revenue for this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="revenue" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Upcoming</CardTitle>
            <CardDescription>Next appointments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingAppointments.map((apt, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {apt.patient.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{apt.patient}</p>
                  <p className="text-xs text-muted-foreground">{apt.doctor}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{apt.time}</p>
                  <Badge variant={apt.type === 'New' ? 'default' : 'secondary'} className="text-[10px]">
                    {apt.type}
                  </Badge>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full" size="sm">
              View All Appointments
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Bed Occupancy', value: 78, color: 'bg-primary' },
          { label: 'Lab TAT', value: 92, color: 'bg-success' },
          { label: 'Patient Satisfaction', value: 88, color: 'bg-accent' },
          { label: 'Staff Attendance', value: 95, color: 'bg-warning' },
        ].map((metric) => (
          <Card key={metric.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{metric.label}</span>
                <span className="text-lg font-bold">{metric.value}%</span>
              </div>
              <Progress value={metric.value} className={`h-2 ${metric.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
