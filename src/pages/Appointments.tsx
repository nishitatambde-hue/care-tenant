import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { StatusBadge } from '@/components/ui/status-badge';
import { useToast } from '@/hooks/use-toast';
import { format, startOfToday, addDays, isSameDay, parseISO } from 'date-fns';
import { 
  Loader2, Plus, Search, CalendarDays, Clock, User, 
  Stethoscope, RefreshCw, Filter, ChevronLeft, ChevronRight,
  MoreHorizontal, XCircle, CheckCircle2, UserCheck
} from 'lucide-react';
import type { Patient, Appointment, AppointmentStatus } from '@/types/hms';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AppointmentWithDetails {
  id: string;
  tenant_id: string;
  patient_id: string;
  doctor_id: string | null;
  department_id: string | null;
  appointment_date: string;
  appointment_time: string;
  token_number: number | null;
  status: AppointmentStatus;
  visit_type: string | null;
  chief_complaint: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
  patient: Patient;
  doctor?: {
    id: string;
    employee_code: string;
    user_id: string | null;
    profile?: {
      full_name: string;
    } | null;
  } | null;
  department?: {
    id: string;
    name: string;
    code: string;
  } | null;
}

interface Doctor {
  id: string;
  employee_code: string;
  specialization: string | null;
  consultation_fee: number | null;
  user_id: string | null;
  profile?: {
    full_name: string;
  };
}

interface Department {
  id: string;
  name: string;
  code: string;
}

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00'
];

const VISIT_TYPES = [
  { value: 'new', label: 'New Visit' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'emergency', label: 'Emergency' },
];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchPatient, setSearchPatient] = useState('');
  const { tenant, hasAnyRole, user } = useAuth();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    department_id: '',
    appointment_date: format(startOfToday(), 'yyyy-MM-dd'),
    appointment_time: '09:00',
    visit_type: 'new',
    chief_complaint: '',
    notes: '',
  });

  const canCreate = hasAnyRole(['admin', 'reception']);
  const canUpdate = hasAnyRole(['admin', 'reception', 'nurse']);

  useEffect(() => {
    if (tenant?.id) {
      fetchData();
    }
  }, [tenant?.id, selectedDate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchAppointments(),
        fetchPatients(),
        fetchDoctors(),
        fetchDepartments(),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAppointments = async () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:patients(*),
        doctor:staff_profiles(id, employee_code, user_id),
        department:departments(id, name, code)
      `)
      .eq('appointment_date', dateStr)
      .order('appointment_time', { ascending: true });

    if (error) {
      console.error('Error fetching appointments:', error);
      return;
    }

    // Fetch doctor profile names separately
    const appointmentsWithProfiles = await Promise.all(
      (data || []).map(async (apt) => {
        if (apt.doctor?.user_id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', apt.doctor.user_id)
            .single();
          return {
            ...apt,
            doctor: { ...apt.doctor, profile: profileData },
          };
        }
        return apt;
      })
    );

    setAppointments(appointmentsWithProfiles as AppointmentWithDetails[]);
  };

  const fetchPatients = async () => {
    const { data } = await supabase
      .from('patients')
      .select('id, first_name, last_name, uhid, phone')
      .order('first_name');
    setPatients((data || []) as Patient[]);
  };

  const fetchDoctors = async () => {
    const { data } = await supabase
      .from('staff_profiles')
      .select('id, employee_code, specialization, consultation_fee, user_id')
      .eq('is_available', true);

    if (data) {
      const doctorsWithProfiles = await Promise.all(
        data.map(async (doc) => {
          if (doc.user_id) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', doc.user_id)
              .single();
            return { ...doc, profile: profileData };
          }
          return doc;
        })
      );
      setDoctors(doctorsWithProfiles as Doctor[]);
    }
  };

  const fetchDepartments = async () => {
    const { data } = await supabase
      .from('departments')
      .select('id, name, code')
      .eq('is_active', true)
      .order('name');
    setDepartments((data || []) as Department[]);
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant?.id) return;

    setIsSubmitting(true);
    try {
      // Get next token
      const { data: tokenData, error: tokenError } = await supabase.rpc('get_next_token', {
        _tenant_id: tenant.id,
        _department_id: formData.department_id || null,
      });

      if (tokenError) throw tokenError;

      const { error } = await supabase.from('appointments').insert({
        tenant_id: tenant.id,
        patient_id: formData.patient_id,
        doctor_id: formData.doctor_id || null,
        department_id: formData.department_id || null,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        visit_type: formData.visit_type,
        chief_complaint: formData.chief_complaint || null,
        notes: formData.notes || null,
        token_number: tokenData,
        status: 'scheduled',
        created_by: user?.id,
      });

      if (error) throw error;

      toast({ 
        title: 'Appointment Scheduled', 
        description: `Token #${tokenData} for ${format(parseISO(formData.appointment_date), 'MMM dd, yyyy')} at ${formData.appointment_time}` 
      });
      
      setIsDialogOpen(false);
      resetForm();
      fetchAppointments();
    } catch (err) {
      console.error('Error creating appointment:', err);
      toast({ title: 'Error', description: 'Failed to schedule appointment', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: '',
      doctor_id: '',
      department_id: '',
      appointment_date: format(selectedDate, 'yyyy-MM-dd'),
      appointment_time: '09:00',
      visit_type: 'new',
      chief_complaint: '',
      notes: '',
    });
    setSearchPatient('');
  };

  const updateAppointmentStatus = async (id: string, status: AppointmentStatus) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      toast({ 
        title: 'Status Updated', 
        description: `Appointment marked as ${status.replace('_', ' ')}` 
      });
      fetchAppointments();
    } catch (err) {
      console.error('Error updating status:', err);
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const checkInPatient = async (appointment: AppointmentWithDetails) => {
    if (!tenant?.id) return;

    try {
      // Create OPD visit
      const { error: visitError } = await supabase.from('opd_visits').insert({
        tenant_id: tenant.id,
        appointment_id: appointment.id,
        patient_id: appointment.patient_id,
        doctor_id: appointment.doctor_id,
        token_number: appointment.token_number,
        status: 'checked_in',
        check_in_time: new Date().toISOString(),
      });

      if (visitError) throw visitError;

      // Update appointment status
      await updateAppointmentStatus(appointment.id, 'checked_in');

      toast({ 
        title: 'Patient Checked In', 
        description: `${appointment.patient.first_name} ${appointment.patient.last_name} is now in queue` 
      });
    } catch (err) {
      console.error('Error checking in:', err);
      toast({ title: 'Error', description: 'Failed to check in patient', variant: 'destructive' });
    }
  };

  const filteredPatients = patients.filter((p) =>
    `${p.first_name} ${p.last_name} ${p.uhid} ${p.phone}`.toLowerCase().includes(searchPatient.toLowerCase())
  );

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch = `${apt.patient?.first_name} ${apt.patient?.last_name} ${apt.patient?.uhid} ${apt.doctor?.profile?.full_name || ''}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const appointmentsByStatus = {
    scheduled: filteredAppointments.filter((a) => a.status === 'scheduled'),
    checked_in: filteredAppointments.filter((a) => a.status === 'checked_in'),
    completed: filteredAppointments.filter((a) => a.status === 'completed'),
    cancelled: filteredAppointments.filter((a) => a.status === 'cancelled'),
  };

  const navigateDate = (days: number) => {
    setSelectedDate(addDays(selectedDate, days));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Appointments</h1>
          <p className="text-muted-foreground">Schedule and manage patient appointments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => fetchData()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          {canCreate && (
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Schedule New Appointment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateAppointment} className="space-y-4">
                  {/* Patient Selection */}
                  <div className="space-y-2">
                    <Label>Search Patient</Label>
                    <Input
                      placeholder="Search by name, UHID, or phone..."
                      value={searchPatient}
                      onChange={(e) => setSearchPatient(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Select Patient *</Label>
                    <Select value={formData.patient_id} onValueChange={(v) => setFormData({ ...formData, patient_id: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredPatients.slice(0, 20).map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            <div className="flex flex-col">
                              <span>{p.first_name} {p.last_name}</span>
                              <span className="text-xs text-muted-foreground">{p.uhid} • {p.phone}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Department */}
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Select value={formData.department_id} onValueChange={(v) => setFormData({ ...formData, department_id: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Doctor */}
                    <div className="space-y-2">
                      <Label>Doctor</Label>
                      <Select value={formData.doctor_id} onValueChange={(v) => setFormData({ ...formData, doctor_id: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              <div className="flex flex-col">
                                <span>{d.profile?.full_name || d.employee_code}</span>
                                {d.specialization && (
                                  <span className="text-xs text-muted-foreground">{d.specialization}</span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {/* Date */}
                    <div className="space-y-2">
                      <Label>Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left">
                            <CalendarDays className="h-4 w-4 mr-2" />
                            {format(parseISO(formData.appointment_date), 'MMM dd, yyyy')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={parseISO(formData.appointment_date)}
                            onSelect={(date) => date && setFormData({ ...formData, appointment_date: format(date, 'yyyy-MM-dd') })}
                            disabled={(date) => date < startOfToday()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Time */}
                    <div className="space-y-2">
                      <Label>Time *</Label>
                      <Select value={formData.appointment_time} onValueChange={(v) => setFormData({ ...formData, appointment_time: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Visit Type */}
                    <div className="space-y-2">
                      <Label>Visit Type</Label>
                      <Select value={formData.visit_type} onValueChange={(v) => setFormData({ ...formData, visit_type: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {VISIT_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Chief Complaint */}
                  <div className="space-y-2">
                    <Label>Chief Complaint</Label>
                    <Textarea
                      placeholder="Brief description of the patient's main concern..."
                      value={formData.chief_complaint}
                      onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
                      rows={2}
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      placeholder="Any additional notes..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={!formData.patient_id || isSubmitting}>
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CalendarDays className="h-4 w-4 mr-2" />}
                      Schedule Appointment
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Date Navigation & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateDate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[180px]">
                <CalendarDays className="h-4 w-4 mr-2" />
                {isSameDay(selectedDate, startOfToday()) 
                  ? `Today, ${format(selectedDate, 'MMM dd')}` 
                  : format(selectedDate, 'EEE, MMM dd, yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="icon" onClick={() => navigateDate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          {!isSameDay(selectedDate, startOfToday()) && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedDate(startOfToday())}>
              Today
            </Button>
          )}
        </div>

        <div className="flex-1 flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient or doctor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="checked_in">Checked In</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{appointmentsByStatus.scheduled.length}</p>
                <p className="text-sm text-muted-foreground">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-warning" />
              <div>
                <p className="text-2xl font-bold">{appointmentsByStatus.checked_in.length}</p>
                <p className="text-sm text-muted-foreground">Checked In</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold">{appointmentsByStatus.completed.length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{appointmentsByStatus.cancelled.length}</p>
                <p className="text-sm text-muted-foreground">Cancelled</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments List */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No appointments for this day</p>
                {canCreate && (
                  <Button variant="link" onClick={() => setIsDialogOpen(true)} className="mt-2">
                    Schedule an appointment
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredAppointments.map((apt) => (
                <Card key={apt.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {/* Token */}
                        <div className="token-display bg-primary/10 text-primary shrink-0">
                          {apt.token_number || '-'}
                        </div>
                        {/* Patient Info */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">
                              {apt.patient?.first_name} {apt.patient?.last_name}
                            </h3>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted capitalize">
                              {apt.visit_type || 'new'}
                            </span>
                          </div>
                          <p className="text-sm font-mono text-muted-foreground">{apt.patient?.uhid}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {apt.appointment_time.slice(0, 5)}
                            </span>
                            {apt.doctor?.profile?.full_name && (
                              <span className="flex items-center gap-1">
                                <Stethoscope className="h-3 w-3" />
                                Dr. {apt.doctor.profile.full_name}
                              </span>
                            )}
                            {apt.department?.name && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {apt.department.name}
                              </span>
                            )}
                          </div>
                          {apt.chief_complaint && (
                            <p className="text-sm text-muted-foreground mt-1">
                              <span className="font-medium">Complaint:</span> {apt.chief_complaint}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <StatusBadge status={apt.status} />
                        {canUpdate && apt.status === 'scheduled' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => checkInPatient(apt)}>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Check In Patient
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}
                                className="text-destructive"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel Appointment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Day Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {TIME_SLOTS.map((slot) => {
                  const slotAppointments = filteredAppointments.filter(
                    (apt) => apt.appointment_time.slice(0, 5) === slot
                  );
                  return (
                    <div key={slot} className="flex gap-4 py-2 border-b border-border/50 last:border-0">
                      <div className="w-16 shrink-0 text-sm font-medium text-muted-foreground">
                        {slot}
                      </div>
                      <div className="flex-1">
                        {slotAppointments.length === 0 ? (
                          <span className="text-sm text-muted-foreground/50">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {slotAppointments.map((apt) => (
                              <div
                                key={apt.id}
                                className={`
                                  px-3 py-1.5 rounded-md text-sm
                                  ${apt.status === 'scheduled' ? 'bg-primary/10 text-primary' : ''}
                                  ${apt.status === 'checked_in' ? 'bg-warning/10 text-warning' : ''}
                                  ${apt.status === 'completed' ? 'bg-success/10 text-success' : ''}
                                  ${apt.status === 'cancelled' ? 'bg-destructive/10 text-destructive line-through' : ''}
                                `}
                              >
                                <span className="font-medium">#{apt.token_number}</span>
                                {' '}
                                {apt.patient?.first_name} {apt.patient?.last_name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
