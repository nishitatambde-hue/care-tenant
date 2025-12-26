import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, Building2, UserCog, CheckCircle2, Stethoscope } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SetupInfo {
  user_id: string;
  email: string;
  tenants: { id: string; name: string; code: string }[];
  profile: { tenant_id: string | null };
  departments: { id: string; name: string; code: string }[];
}

const roleOptions = [
  { value: 'admin', label: 'Hospital Admin', description: 'Full access to manage staff, departments, and settings', icon: '🔵', color: 'border-primary' },
  { value: 'reception', label: 'Reception', description: 'Register patients, book appointments, create invoices', icon: '🟢', color: 'border-success' },
  { value: 'doctor', label: 'Doctor', description: 'View OPD queue, consultations, prescriptions, lab orders', icon: '🟡', color: 'border-warning' },
  { value: 'nurse', label: 'Nurse', description: 'Record vitals, manage IPD patients', icon: '🩷', color: 'border-pink-500' },
  { value: 'lab_staff', label: 'Lab Staff', description: 'Process lab orders, enter results', icon: '🟠', color: 'border-orange-500' },
  { value: 'pharmacy', label: 'Pharmacy', description: 'Manage inventory, dispense medicines', icon: '🩵', color: 'border-accent' },
];

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [setupInfo, setSetupInfo] = useState<SetupInfo | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchSetupInfo();
  }, [user]);

  const fetchSetupInfo = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('user-setup', {
        body: { action: 'get_setup_info' },
      });

      if (error) throw error;
      setSetupInfo(data);
    } catch (err) {
      console.error('Error fetching setup info:', err);
      toast({ title: 'Error', description: 'Failed to load setup information', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedRole || !setupInfo?.tenants?.[0]) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('user-setup', {
        body: {
          action: 'assign_role',
          role: selectedRole,
          tenant_id: setupInfo.tenants[0].id,
        },
      });

      if (error) throw error;

      toast({ title: 'Success!', description: `You've been assigned as ${roleOptions.find(r => r.value === selectedRole)?.label}` });
      
      // Refresh auth state and redirect
      await supabase.auth.refreshSession();
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Error assigning role:', err);
      toast({ title: 'Error', description: 'Failed to assign role', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const demoTenant = setupInfo?.tenants?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
            <Stethoscope className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to HMS</h1>
          <p className="text-muted-foreground">Let's set up your account to get started</p>
        </div>

        {/* Hospital Info */}
        {demoTenant && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{demoTenant.name}</h3>
                  <p className="text-sm text-muted-foreground">Code: {demoTenant.code} • Demo Hospital</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-success ml-auto" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Role Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Select Your Role
            </CardTitle>
            <CardDescription>
              Choose a role to test the system. Each role has different permissions and dashboards.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedRole} onValueChange={setSelectedRole} className="space-y-3">
              {roleOptions.map((role) => (
                <div key={role.value}>
                  <Label
                    htmlFor={role.value}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-muted/50 ${
                      selectedRole === role.value ? `${role.color} bg-muted/30` : 'border-border'
                    }`}
                  >
                    <RadioGroupItem value={role.value} id={role.value} className="mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{role.icon}</span>
                        <span className="font-medium">{role.label}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <Button
              onClick={handleAssignRole}
              disabled={!selectedRole || isSubmitting}
              className="w-full mt-6 h-12"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Setting up...
                </>
              ) : (
                'Continue to Dashboard'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Info */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          You can change your role later by visiting this page again at <code className="bg-muted px-1 rounded">/setup</code>
        </p>
      </div>
    </div>
  );
}
