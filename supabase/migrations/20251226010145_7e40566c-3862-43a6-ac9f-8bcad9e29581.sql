-- =============================================
-- HMS Multi-Tenant Database Schema
-- =============================================

-- 1. ENUMS
CREATE TYPE public.app_role AS ENUM ('superadmin', 'admin', 'reception', 'doctor', 'nurse', 'lab_staff', 'pharmacy');
CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'checked_in', 'vitals_done', 'in_consultation', 'completed', 'cancelled', 'no_show');
CREATE TYPE public.lab_order_status AS ENUM ('requested', 'sample_collected', 'processing', 'result_pending', 'published', 'cancelled');
CREATE TYPE public.payment_status AS ENUM ('pending', 'partial', 'paid', 'refunded');
CREATE TYPE public.payment_mode AS ENUM ('cash', 'card', 'upi', 'insurance', 'credit');

-- 2. TENANTS TABLE (Hospitals/Clinics)
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PROFILES TABLE (User Profiles)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. USER ROLES TABLE
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, tenant_id, role)
);

-- 5. DEPARTMENTS TABLE
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, code)
);

-- 6. STAFF PROFILES (Doctors, Nurses, etc.)
CREATE TABLE public.staff_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id),
  employee_code TEXT NOT NULL,
  specialization TEXT,
  qualification TEXT,
  license_number TEXT,
  consultation_fee DECIMAL(10,2) DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, employee_code)
);

-- 7. PATIENTS TABLE
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  uhid TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  blood_group TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  allergies TEXT[],
  medical_history JSONB DEFAULT '{}',
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. UHID REGISTRY (For generating unique UHIDs)
CREATE TABLE public.uhid_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  last_sequence INTEGER DEFAULT 0,
  UNIQUE(tenant_id, year)
);

-- 9. APPOINTMENTS TABLE
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.staff_profiles(id),
  department_id UUID REFERENCES public.departments(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  token_number INTEGER,
  status appointment_status DEFAULT 'scheduled',
  visit_type TEXT DEFAULT 'new' CHECK (visit_type IN ('new', 'follow_up')),
  chief_complaint TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. OPD VISITS TABLE
CREATE TABLE public.opd_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.staff_profiles(id),
  visit_date DATE DEFAULT CURRENT_DATE,
  token_number INTEGER,
  check_in_time TIMESTAMPTZ,
  vitals_time TIMESTAMPTZ,
  consultation_start_time TIMESTAMPTZ,
  consultation_end_time TIMESTAMPTZ,
  status appointment_status DEFAULT 'checked_in',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. VITALS TABLE
CREATE TABLE public.vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  opd_visit_id UUID REFERENCES public.opd_visits(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  recorded_by UUID REFERENCES auth.users(id),
  temperature DECIMAL(4,1),
  pulse INTEGER,
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  respiratory_rate INTEGER,
  oxygen_saturation INTEGER,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  bmi DECIMAL(4,1),
  blood_sugar DECIMAL(5,1),
  notes TEXT,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. CONSULTATIONS TABLE
CREATE TABLE public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  opd_visit_id UUID REFERENCES public.opd_visits(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.staff_profiles(id),
  chief_complaint TEXT,
  history_of_present_illness TEXT,
  examination_findings TEXT,
  diagnosis TEXT[],
  icd_codes TEXT[],
  treatment_plan TEXT,
  follow_up_date DATE,
  follow_up_notes TEXT,
  is_signed BOOLEAN DEFAULT false,
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 13. PRESCRIPTIONS TABLE
CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.staff_profiles(id),
  prescription_number TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  instructions TEXT,
  is_dispensed BOOLEAN DEFAULT false,
  dispensed_at TIMESTAMPTZ,
  dispensed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, prescription_number)
);

-- 14. LAB TESTS MASTER
CREATE TABLE public.lab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  category TEXT,
  sample_type TEXT,
  normal_range TEXT,
  unit TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  turnaround_time TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, code)
);

-- 15. LAB ORDERS TABLE
CREATE TABLE public.lab_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  consultation_id UUID REFERENCES public.consultations(id),
  ordered_by UUID REFERENCES auth.users(id),
  order_number TEXT NOT NULL,
  status lab_order_status DEFAULT 'requested',
  priority TEXT DEFAULT 'routine' CHECK (priority IN ('routine', 'urgent', 'stat')),
  sample_collected_at TIMESTAMPTZ,
  sample_collected_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, order_number)
);

-- 16. LAB ORDER ITEMS
CREATE TABLE public.lab_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_order_id UUID NOT NULL REFERENCES public.lab_orders(id) ON DELETE CASCADE,
  lab_test_id UUID NOT NULL REFERENCES public.lab_tests(id),
  result TEXT,
  result_value DECIMAL(10,2),
  unit TEXT,
  normal_range TEXT,
  is_critical BOOLEAN DEFAULT false,
  remarks TEXT,
  result_entered_by UUID REFERENCES auth.users(id),
  result_entered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 17. PHARMACY INVENTORY
CREATE TABLE public.pharmacy_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  generic_name TEXT,
  code TEXT NOT NULL,
  category TEXT,
  manufacturer TEXT,
  unit TEXT DEFAULT 'TAB',
  strength TEXT,
  mrp DECIMAL(10,2) DEFAULT 0,
  selling_price DECIMAL(10,2) DEFAULT 0,
  reorder_level INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, code)
);

-- 18. PHARMACY BATCHES
CREATE TABLE public.pharmacy_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID NOT NULL REFERENCES public.pharmacy_inventory(id) ON DELETE CASCADE,
  batch_number TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  purchase_price DECIMAL(10,2) DEFAULT 0,
  expiry_date DATE NOT NULL,
  received_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 19. BILLING INVOICES
CREATE TABLE public.billing_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  opd_visit_id UUID REFERENCES public.opd_visits(id),
  invoice_number TEXT NOT NULL,
  invoice_date DATE DEFAULT CURRENT_DATE,
  subtotal DECIMAL(12,2) DEFAULT 0,
  discount DECIMAL(12,2) DEFAULT 0,
  tax DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  paid_amount DECIMAL(12,2) DEFAULT 0,
  balance DECIMAL(12,2) DEFAULT 0,
  payment_status payment_status DEFAULT 'pending',
  items JSONB DEFAULT '[]',
  notes TEXT,
  is_locked BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, invoice_number)
);

-- 20. PAYMENTS TABLE
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES public.billing_invoices(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  payment_mode payment_mode NOT NULL,
  transaction_reference TEXT,
  payment_date TIMESTAMPTZ DEFAULT now(),
  received_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 21. AUDIT LOGS
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 22. TOKEN COUNTER (For daily token generation)
CREATE TABLE public.token_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id),
  counter_date DATE DEFAULT CURRENT_DATE,
  last_token INTEGER DEFAULT 0,
  UNIQUE(tenant_id, department_id, counter_date)
);

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uhid_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opd_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_counters ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SECURITY DEFINER FUNCTIONS
-- =============================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'superadmin')
$$;

-- Function to get user's tenant_id
CREATE OR REPLACE FUNCTION public.get_user_tenant_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = _user_id LIMIT 1
$$;

-- Function to check if user belongs to tenant
CREATE OR REPLACE FUNCTION public.user_belongs_to_tenant(_user_id uuid, _tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND tenant_id = _tenant_id
  )
$$;

-- Function to generate UHID
CREATE OR REPLACE FUNCTION public.generate_uhid(_tenant_id uuid)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tenant_code TEXT;
  current_year INTEGER;
  next_seq INTEGER;
  new_uhid TEXT;
BEGIN
  SELECT code INTO tenant_code FROM public.tenants WHERE id = _tenant_id;
  current_year := EXTRACT(YEAR FROM CURRENT_DATE);
  
  INSERT INTO public.uhid_registry (tenant_id, year, last_sequence)
  VALUES (_tenant_id, current_year, 1)
  ON CONFLICT (tenant_id, year)
  DO UPDATE SET last_sequence = public.uhid_registry.last_sequence + 1
  RETURNING last_sequence INTO next_seq;
  
  new_uhid := tenant_code || '-' || current_year || '-' || LPAD(next_seq::TEXT, 6, '0');
  RETURN new_uhid;
END;
$$;

-- Function to get next token number
CREATE OR REPLACE FUNCTION public.get_next_token(_tenant_id uuid, _department_id uuid DEFAULT NULL)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_token INTEGER;
BEGIN
  INSERT INTO public.token_counters (tenant_id, department_id, counter_date, last_token)
  VALUES (_tenant_id, _department_id, CURRENT_DATE, 1)
  ON CONFLICT (tenant_id, department_id, counter_date)
  DO UPDATE SET last_token = public.token_counters.last_token + 1
  RETURNING last_token INTO next_token;
  
  RETURN next_token;
END;
$$;

-- =============================================
-- RLS POLICIES
-- =============================================

-- TENANTS POLICIES
CREATE POLICY "Superadmins can view all tenants" ON public.tenants
  FOR SELECT USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Users can view their own tenant" ON public.tenants
  FOR SELECT USING (id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Superadmins can manage tenants" ON public.tenants
  FOR ALL USING (public.is_superadmin(auth.uid()));

-- PROFILES POLICIES
CREATE POLICY "Users can view profiles in their tenant" ON public.profiles
  FOR SELECT USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.is_superadmin(auth.uid())
    OR id = auth.uid()
  );

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Allow profile creation during signup" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- USER ROLES POLICIES
CREATE POLICY "Superadmins can manage all roles" ON public.user_roles
  FOR ALL USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Admins can manage roles in their tenant" ON public.user_roles
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin')
    AND tenant_id = public.get_user_tenant_id(auth.uid())
  );

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

-- DEPARTMENTS POLICIES
CREATE POLICY "Users can view departments in their tenant" ON public.departments
  FOR SELECT USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.is_superadmin(auth.uid())
  );

CREATE POLICY "Admins can manage departments" ON public.departments
  FOR ALL USING (
    (public.has_role(auth.uid(), 'admin') AND tenant_id = public.get_user_tenant_id(auth.uid()))
    OR public.is_superadmin(auth.uid())
  );

-- STAFF PROFILES POLICIES
CREATE POLICY "Users can view staff in their tenant" ON public.staff_profiles
  FOR SELECT USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.is_superadmin(auth.uid())
  );

CREATE POLICY "Admins can manage staff" ON public.staff_profiles
  FOR ALL USING (
    (public.has_role(auth.uid(), 'admin') AND tenant_id = public.get_user_tenant_id(auth.uid()))
    OR public.is_superadmin(auth.uid())
  );

-- PATIENTS POLICIES
CREATE POLICY "Tenant users can view patients" ON public.patients
  FOR SELECT USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.is_superadmin(auth.uid())
  );

CREATE POLICY "Reception can create patients" ON public.patients
  FOR INSERT WITH CHECK (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'reception') OR public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Admins can update patients" ON public.patients
  FOR UPDATE USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
  );

-- APPOINTMENTS POLICIES
CREATE POLICY "Tenant users can view appointments" ON public.appointments
  FOR SELECT USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.is_superadmin(auth.uid())
  );

CREATE POLICY "Reception and Admin can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'reception') OR public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Reception and Admin can update appointments" ON public.appointments
  FOR UPDATE USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'reception') OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'nurse'))
  );

-- OPD VISITS POLICIES
CREATE POLICY "Tenant users can view OPD visits" ON public.opd_visits
  FOR SELECT USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.is_superadmin(auth.uid())
  );

CREATE POLICY "Staff can manage OPD visits" ON public.opd_visits
  FOR ALL USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
  );

-- VITALS POLICIES
CREATE POLICY "Tenant users can view vitals" ON public.vitals
  FOR SELECT USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.is_superadmin(auth.uid())
  );

CREATE POLICY "Nurses and Doctors can create vitals" ON public.vitals
  FOR INSERT WITH CHECK (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'nurse') OR public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'))
  );

-- CONSULTATIONS POLICIES
CREATE POLICY "Tenant users can view consultations" ON public.consultations
  FOR SELECT USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.is_superadmin(auth.uid())
  );

CREATE POLICY "Doctors can create consultations" ON public.consultations
  FOR INSERT WITH CHECK (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.has_role(auth.uid(), 'doctor')
  );

CREATE POLICY "Doctors can update unsigned consultations" ON public.consultations
  FOR UPDATE USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.has_role(auth.uid(), 'doctor')
    AND is_signed = false
  );

-- PRESCRIPTIONS POLICIES
CREATE POLICY "Tenant users can view prescriptions" ON public.prescriptions
  FOR SELECT USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.is_superadmin(auth.uid())
  );

CREATE POLICY "Doctors can create prescriptions" ON public.prescriptions
  FOR INSERT WITH CHECK (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.has_role(auth.uid(), 'doctor')
  );

CREATE POLICY "Pharmacy can update dispense status" ON public.prescriptions
  FOR UPDATE USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.has_role(auth.uid(), 'pharmacy')
  );

-- LAB TESTS POLICIES
CREATE POLICY "Tenant users can view lab tests" ON public.lab_tests
  FOR SELECT USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.is_superadmin(auth.uid())
  );

CREATE POLICY "Admins can manage lab tests" ON public.lab_tests
  FOR ALL USING (
    (public.has_role(auth.uid(), 'admin') AND tenant_id = public.get_user_tenant_id(auth.uid()))
    OR public.is_superadmin(auth.uid())
  );

-- LAB ORDERS POLICIES
CREATE POLICY "Tenant users can view lab orders" ON public.lab_orders
  FOR SELECT USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.is_superadmin(auth.uid())
  );

CREATE POLICY "Doctors can create lab orders" ON public.lab_orders
  FOR INSERT WITH CHECK (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.has_role(auth.uid(), 'doctor')
  );

CREATE POLICY "Lab staff can update lab orders" ON public.lab_orders
  FOR UPDATE USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'lab_staff') OR public.has_role(auth.uid(), 'doctor'))
  );

-- LAB ORDER ITEMS POLICIES
CREATE POLICY "Tenant users can view lab order items" ON public.lab_order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lab_orders lo
      WHERE lo.id = lab_order_items.lab_order_id
      AND (lo.tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_superadmin(auth.uid()))
    )
  );

CREATE POLICY "Lab staff can manage lab order items" ON public.lab_order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.lab_orders lo
      WHERE lo.id = lab_order_items.lab_order_id
      AND lo.tenant_id = public.get_user_tenant_id(auth.uid())
      AND (public.has_role(auth.uid(), 'lab_staff') OR public.has_role(auth.uid(), 'doctor'))
    )
  );

-- PHARMACY INVENTORY POLICIES
CREATE POLICY "Tenant users can view pharmacy inventory" ON public.pharmacy_inventory
  FOR SELECT USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.is_superadmin(auth.uid())
  );

CREATE POLICY "Pharmacy and Admin can manage inventory" ON public.pharmacy_inventory
  FOR ALL USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'pharmacy') OR public.has_role(auth.uid(), 'admin'))
  );

-- PHARMACY BATCHES POLICIES
CREATE POLICY "Tenant users can view pharmacy batches" ON public.pharmacy_batches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pharmacy_inventory pi
      WHERE pi.id = pharmacy_batches.inventory_id
      AND (pi.tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_superadmin(auth.uid()))
    )
  );

CREATE POLICY "Pharmacy can manage batches" ON public.pharmacy_batches
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.pharmacy_inventory pi
      WHERE pi.id = pharmacy_batches.inventory_id
      AND pi.tenant_id = public.get_user_tenant_id(auth.uid())
      AND public.has_role(auth.uid(), 'pharmacy')
    )
  );

-- BILLING INVOICES POLICIES
CREATE POLICY "Tenant users can view invoices" ON public.billing_invoices
  FOR SELECT USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.is_superadmin(auth.uid())
  );

CREATE POLICY "Reception and Admin can create invoices" ON public.billing_invoices
  FOR INSERT WITH CHECK (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'reception') OR public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Admin can update unlocked invoices" ON public.billing_invoices
  FOR UPDATE USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
    AND is_locked = false
  );

-- PAYMENTS POLICIES
CREATE POLICY "Tenant users can view payments" ON public.payments
  FOR SELECT USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.is_superadmin(auth.uid())
  );

CREATE POLICY "Reception and Admin can create payments" ON public.payments
  FOR INSERT WITH CHECK (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'reception') OR public.has_role(auth.uid(), 'admin'))
  );

-- AUDIT LOGS POLICIES
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    (public.has_role(auth.uid(), 'admin') AND tenant_id = public.get_user_tenant_id(auth.uid()))
    OR public.is_superadmin(auth.uid())
  );

CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- TOKEN COUNTERS POLICIES
CREATE POLICY "Tenant users can view token counters" ON public.token_counters
  FOR SELECT USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.is_superadmin(auth.uid())
  );

CREATE POLICY "Tenant users can manage token counters" ON public.token_counters
  FOR ALL USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
  );

-- UHID REGISTRY POLICIES
CREATE POLICY "Tenant users can manage UHID registry" ON public.uhid_registry
  FOR ALL USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.is_superadmin(auth.uid())
  );

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_staff_profiles_updated_at BEFORE UPDATE ON public.staff_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_opd_visits_updated_at BEFORE UPDATE ON public.opd_visits
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON public.consultations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_pharmacy_inventory_updated_at BEFORE UPDATE ON public.pharmacy_inventory
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_billing_invoices_updated_at BEFORE UPDATE ON public.billing_invoices
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_lab_orders_updated_at BEFORE UPDATE ON public.lab_orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- PROFILE CREATION TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();