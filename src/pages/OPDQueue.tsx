import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Clock, Activity, Stethoscope, CheckCircle2, RefreshCw } from 'lucide-react';
import type { Patient, OPDVisit, AppointmentStatus } from '@/types/hms';

interface QueueItem extends OPDVisit {
  patient: Patient;
}

export default function OPDQueuePage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [searchPatient, setSearchPatient] = useState('');
  const { tenant, hasAnyRole, user } = useAuth();
  const { toast } = useToast();

  const canCheckIn = hasAnyRole(['admin', 'reception']);
  const canUpdateVitals = hasAnyRole(['admin', 'nurse', 'doctor']);
  const canConsult = hasAnyRole(['doctor']);

  useEffect(() => {
    if (tenant?.id) {
      fetchQueue();
      fetchPatients();
    }
  }, [tenant?.id]);

  const fetchQueue = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('opd_visits')
        .select(`
          *,
          patient:patients(*)
        `)
        .eq('visit_date', today)
        .order('token_number', { ascending: true });

      if (error) throw error;
      setQueue((data || []) as QueueItem[]);
    } catch (err) {
      console.error('Error fetching queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatients = async () => {
    const { data } = await supabase
      .from('patients')
      .select('id, first_name, last_name, uhid, phone')
      .order('first_name');
    setPatients((data || []) as Patient[]);
  };

  const handleCheckIn = async () => {
    if (!selectedPatientId || !tenant?.id) return;

    setIsSubmitting(true);
    try {
      // Get next token
      const { data: tokenData, error: tokenError } = await supabase.rpc('get_next_token', {
        _tenant_id: tenant.id,
        _department_id: null,
      });

      if (tokenError) throw tokenError;

      const { error } = await supabase.from('opd_visits').insert({
        tenant_id: tenant.id,
        patient_id: selectedPatientId,
        token_number: tokenData,
        status: 'checked_in',
        check_in_time: new Date().toISOString(),
      });

      if (error) throw error;

      toast({ title: 'Patient Checked In', description: `Token #${tokenData} assigned` });
      setIsDialogOpen(false);
      setSelectedPatientId('');
      fetchQueue();
    } catch (err) {
      console.error('Error checking in:', err);
      toast({ title: 'Error', description: 'Failed to check in patient', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (visitId: string, newStatus: AppointmentStatus) => {
    try {
      const updates: Record<string, unknown> = { status: newStatus };
      
      if (newStatus === 'vitals_done') {
        updates.vitals_time = new Date().toISOString();
      } else if (newStatus === 'in_consultation') {
        updates.consultation_start_time = new Date().toISOString();
      } else if (newStatus === 'completed') {
        updates.consultation_end_time = new Date().toISOString();
      }

      const { error } = await supabase
        .from('opd_visits')
        .update(updates)
        .eq('id', visitId);

      if (error) throw error;
      fetchQueue();
    } catch (err) {
      console.error('Error updating status:', err);
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const filteredPatients = patients.filter((p) =>
    `${p.first_name} ${p.last_name} ${p.uhid} ${p.phone}`.toLowerCase().includes(searchPatient.toLowerCase())
  );

  const statusGroups = {
    waiting: queue.filter((q) => q.status === 'checked_in'),
    vitals: queue.filter((q) => q.status === 'vitals_done'),
    inConsultation: queue.filter((q) => q.status === 'in_consultation'),
    completed: queue.filter((q) => q.status === 'completed'),
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
          <h1 className="text-2xl font-semibold">OPD Queue</h1>
          <p className="text-muted-foreground">Today's patient queue • {new Date().toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchQueue}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          {canCheckIn && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Check In Patient
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Check In Patient</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Search Patient</Label>
                    <Input
                      placeholder="Search by name, UHID, or phone..."
                      value={searchPatient}
                      onChange={(e) => setSearchPatient(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Select Patient</Label>
                    <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredPatients.slice(0, 20).map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.first_name} {p.last_name} • {p.uhid}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCheckIn} disabled={!selectedPatientId || isSubmitting}>
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Check In
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Queue Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-warning" />
              <div>
                <p className="text-2xl font-bold">{statusGroups.waiting.length}</p>
                <p className="text-sm text-muted-foreground">Waiting</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{statusGroups.vitals.length}</p>
                <p className="text-sm text-muted-foreground">Vitals Done</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-accent">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Stethoscope className="h-5 w-5 text-accent" />
              <div>
                <p className="text-2xl font-bold">{statusGroups.inConsultation.length}</p>
                <p className="text-sm text-muted-foreground">In Consultation</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold">{statusGroups.completed.length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue List */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...statusGroups.waiting, ...statusGroups.vitals, ...statusGroups.inConsultation].length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No patients in queue</p>
            ) : (
              [...statusGroups.waiting, ...statusGroups.vitals, ...statusGroups.inConsultation].map((item) => (
                <div
                  key={item.id}
                  className="queue-card"
                  style={{
                    borderLeftColor:
                      item.status === 'in_consultation' ? 'hsl(var(--accent))' :
                      item.status === 'vitals_done' ? 'hsl(262 83% 58%)' :
                      'hsl(var(--warning))',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="token-display bg-primary/10 text-primary">
                        {item.token_number}
                      </div>
                      <div>
                        <p className="font-medium">{item.patient?.first_name} {item.patient?.last_name}</p>
                        <p className="text-sm text-muted-foreground font-mono">{item.patient?.uhid}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {item.status === 'checked_in' && canUpdateVitals && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(item.id, 'vitals_done')}>
                        <Activity className="h-3 w-3 mr-1" />
                        Mark Vitals Done
                      </Button>
                    )}
                    {item.status === 'vitals_done' && canConsult && (
                      <Button size="sm" onClick={() => updateStatus(item.id, 'in_consultation')}>
                        <Stethoscope className="h-3 w-3 mr-1" />
                        Start Consultation
                      </Button>
                    )}
                    {item.status === 'in_consultation' && canConsult && (
                      <Button size="sm" variant="secondary" onClick={() => updateStatus(item.id, 'completed')}>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Completed */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Completed Today</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {statusGroups.completed.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No completed visits yet</p>
            ) : (
              statusGroups.completed.map((item) => (
                <div key={item.id} className="queue-card border-l-success">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="token-display bg-success/10 text-success">
                        {item.token_number}
                      </div>
                      <div>
                        <p className="font-medium">{item.patient?.first_name} {item.patient?.last_name}</p>
                        <p className="text-sm text-muted-foreground font-mono">{item.patient?.uhid}</p>
                      </div>
                    </div>
                    <StatusBadge status="completed" />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
