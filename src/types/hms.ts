// HMS Type Definitions

export type AppRole = 'superadmin' | 'admin' | 'reception' | 'doctor' | 'nurse' | 'lab_staff' | 'pharmacy';

export type AppointmentStatus = 
  | 'scheduled' 
  | 'checked_in' 
  | 'vitals_done' 
  | 'in_consultation' 
  | 'completed' 
  | 'cancelled' 
  | 'no_show';

export type LabOrderStatus = 
  | 'requested' 
  | 'sample_collected' 
  | 'processing' 
  | 'result_pending' 
  | 'published' 
  | 'cancelled';

export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded';

export type PaymentMode = 'cash' | 'card' | 'upi' | 'insurance' | 'credit';

export interface Tenant {
  id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  is_active: boolean;
  settings?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  tenant_id?: string;
  full_name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  tenant_id?: string;
  role: AppRole;
  created_at: string;
}

export interface Department {
  id: string;
  tenant_id: string;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StaffProfile {
  id: string;
  user_id?: string;
  tenant_id: string;
  department_id?: string;
  employee_code: string;
  specialization?: string;
  qualification?: string;
  license_number?: string;
  consultation_fee?: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  profile?: Profile;
  department?: Department;
}

export interface Patient {
  id: string;
  tenant_id: string;
  uhid: string;
  first_name: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  blood_group?: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  allergies?: string[];
  medical_history?: Record<string, unknown>;
  photo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  tenant_id: string;
  patient_id: string;
  doctor_id?: string;
  department_id?: string;
  appointment_date: string;
  appointment_time: string;
  token_number?: number;
  status: AppointmentStatus;
  visit_type: 'new' | 'follow_up';
  chief_complaint?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  patient?: Patient;
  doctor?: StaffProfile;
  department?: Department;
}

export interface OPDVisit {
  id: string;
  tenant_id: string;
  appointment_id?: string;
  patient_id: string;
  doctor_id?: string;
  visit_date: string;
  token_number?: number;
  check_in_time?: string;
  vitals_time?: string;
  consultation_start_time?: string;
  consultation_end_time?: string;
  status: AppointmentStatus;
  created_at: string;
  updated_at: string;
  // Joined data
  patient?: Patient;
  doctor?: StaffProfile;
  appointment?: Appointment;
  vitals?: Vitals;
}

export interface Vitals {
  id: string;
  tenant_id: string;
  opd_visit_id?: string;
  patient_id: string;
  recorded_by?: string;
  temperature?: number;
  pulse?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  blood_sugar?: number;
  notes?: string;
  recorded_at: string;
  created_at: string;
}

export interface Consultation {
  id: string;
  tenant_id: string;
  opd_visit_id?: string;
  patient_id: string;
  doctor_id: string;
  chief_complaint?: string;
  history_of_present_illness?: string;
  examination_findings?: string;
  diagnosis?: string[];
  icd_codes?: string[];
  treatment_plan?: string;
  follow_up_date?: string;
  follow_up_notes?: string;
  is_signed: boolean;
  signed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Prescription {
  id: string;
  tenant_id: string;
  consultation_id?: string;
  patient_id: string;
  doctor_id: string;
  prescription_number: string;
  items: PrescriptionItem[];
  instructions?: string;
  is_dispensed: boolean;
  dispensed_at?: string;
  dispensed_by?: string;
  created_at: string;
}

export interface PrescriptionItem {
  drug_name: string;
  generic_name?: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions?: string;
}

export interface LabTest {
  id: string;
  tenant_id: string;
  name: string;
  code: string;
  category?: string;
  sample_type?: string;
  normal_range?: string;
  unit?: string;
  price?: number;
  turnaround_time?: string;
  is_active: boolean;
  created_at: string;
}

export interface LabOrder {
  id: string;
  tenant_id: string;
  patient_id: string;
  consultation_id?: string;
  ordered_by?: string;
  order_number: string;
  status: LabOrderStatus;
  priority: 'routine' | 'urgent' | 'stat';
  sample_collected_at?: string;
  sample_collected_by?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  patient?: Patient;
  items?: LabOrderItem[];
}

export interface LabOrderItem {
  id: string;
  lab_order_id: string;
  lab_test_id: string;
  result?: string;
  result_value?: number;
  unit?: string;
  normal_range?: string;
  is_critical: boolean;
  remarks?: string;
  result_entered_by?: string;
  result_entered_at?: string;
  created_at: string;
  // Joined data
  lab_test?: LabTest;
}

export interface PharmacyInventory {
  id: string;
  tenant_id: string;
  name: string;
  generic_name?: string;
  code: string;
  category?: string;
  manufacturer?: string;
  unit?: string;
  strength?: string;
  mrp?: number;
  selling_price?: number;
  reorder_level?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Computed
  total_stock?: number;
}

export interface PharmacyBatch {
  id: string;
  inventory_id: string;
  batch_number: string;
  quantity: number;
  purchase_price?: number;
  expiry_date: string;
  received_date: string;
  is_active: boolean;
  created_at: string;
}

export interface BillingInvoice {
  id: string;
  tenant_id: string;
  patient_id: string;
  opd_visit_id?: string;
  invoice_number: string;
  invoice_date: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid_amount: number;
  balance: number;
  payment_status: PaymentStatus;
  items: InvoiceItem[];
  notes?: string;
  is_locked: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  patient?: Patient;
  payments?: Payment[];
}

export interface InvoiceItem {
  description: string;
  category: 'consultation' | 'lab' | 'pharmacy' | 'procedure' | 'other';
  quantity: number;
  unit_price: number;
  amount: number;
  reference_id?: string;
}

export interface Payment {
  id: string;
  tenant_id: string;
  invoice_id: string;
  amount: number;
  payment_mode: PaymentMode;
  transaction_reference?: string;
  payment_date: string;
  received_by?: string;
  notes?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  tenant_id?: string;
  user_id?: string;
  action: string;
  table_name?: string;
  record_id?: string;
  old_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Dashboard Stats
export interface DashboardStats {
  todayAppointments: number;
  waitingPatients: number;
  completedConsultations: number;
  pendingLabTests: number;
  todayRevenue: number;
  activePatients: number;
}

// Queue Item for OPD
export interface QueueItem {
  id: string;
  token_number: number;
  patient: Patient;
  status: AppointmentStatus;
  appointment_time: string;
  doctor?: StaffProfile;
  vitals?: Vitals;
  wait_time_minutes?: number;
}
