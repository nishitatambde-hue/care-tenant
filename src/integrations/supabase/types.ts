export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          chief_complaint: string | null
          created_at: string | null
          created_by: string | null
          department_id: string | null
          doctor_id: string | null
          id: string
          notes: string | null
          patient_id: string
          status: Database["public"]["Enums"]["appointment_status"] | null
          tenant_id: string
          token_number: number | null
          updated_at: string | null
          visit_type: string | null
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          chief_complaint?: string | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          doctor_id?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          tenant_id: string
          token_number?: number | null
          updated_at?: string | null
          visit_type?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          chief_complaint?: string | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          doctor_id?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          tenant_id?: string
          token_number?: number | null
          updated_at?: string | null
          visit_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string | null
          tenant_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_invoices: {
        Row: {
          balance: number | null
          created_at: string | null
          created_by: string | null
          discount: number | null
          id: string
          invoice_date: string | null
          invoice_number: string
          is_locked: boolean | null
          items: Json | null
          notes: string | null
          opd_visit_id: string | null
          paid_amount: number | null
          patient_id: string
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          subtotal: number | null
          tax: number | null
          tenant_id: string
          total: number | null
          updated_at: string | null
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          created_by?: string | null
          discount?: number | null
          id?: string
          invoice_date?: string | null
          invoice_number: string
          is_locked?: boolean | null
          items?: Json | null
          notes?: string | null
          opd_visit_id?: string | null
          paid_amount?: number | null
          patient_id: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          subtotal?: number | null
          tax?: number | null
          tenant_id: string
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          created_by?: string | null
          discount?: number | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string
          is_locked?: boolean | null
          items?: Json | null
          notes?: string | null
          opd_visit_id?: string | null
          paid_amount?: number | null
          patient_id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          subtotal?: number | null
          tax?: number | null
          tenant_id?: string
          total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_invoices_opd_visit_id_fkey"
            columns: ["opd_visit_id"]
            isOneToOne: false
            referencedRelation: "opd_visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_invoices_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          chief_complaint: string | null
          created_at: string | null
          diagnosis: string[] | null
          doctor_id: string
          examination_findings: string | null
          follow_up_date: string | null
          follow_up_notes: string | null
          history_of_present_illness: string | null
          icd_codes: string[] | null
          id: string
          is_signed: boolean | null
          opd_visit_id: string | null
          patient_id: string
          signed_at: string | null
          tenant_id: string
          treatment_plan: string | null
          updated_at: string | null
        }
        Insert: {
          chief_complaint?: string | null
          created_at?: string | null
          diagnosis?: string[] | null
          doctor_id: string
          examination_findings?: string | null
          follow_up_date?: string | null
          follow_up_notes?: string | null
          history_of_present_illness?: string | null
          icd_codes?: string[] | null
          id?: string
          is_signed?: boolean | null
          opd_visit_id?: string | null
          patient_id: string
          signed_at?: string | null
          tenant_id: string
          treatment_plan?: string | null
          updated_at?: string | null
        }
        Update: {
          chief_complaint?: string | null
          created_at?: string | null
          diagnosis?: string[] | null
          doctor_id?: string
          examination_findings?: string | null
          follow_up_date?: string | null
          follow_up_notes?: string | null
          history_of_present_illness?: string | null
          icd_codes?: string[] | null
          id?: string
          is_signed?: boolean | null
          opd_visit_id?: string | null
          patient_id?: string
          signed_at?: string | null
          tenant_id?: string
          treatment_plan?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_opd_visit_id_fkey"
            columns: ["opd_visit_id"]
            isOneToOne: false
            referencedRelation: "opd_visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_order_items: {
        Row: {
          created_at: string | null
          id: string
          is_critical: boolean | null
          lab_order_id: string
          lab_test_id: string
          normal_range: string | null
          remarks: string | null
          result: string | null
          result_entered_at: string | null
          result_entered_by: string | null
          result_value: number | null
          unit: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_critical?: boolean | null
          lab_order_id: string
          lab_test_id: string
          normal_range?: string | null
          remarks?: string | null
          result?: string | null
          result_entered_at?: string | null
          result_entered_by?: string | null
          result_value?: number | null
          unit?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_critical?: boolean | null
          lab_order_id?: string
          lab_test_id?: string
          normal_range?: string | null
          remarks?: string | null
          result?: string | null
          result_entered_at?: string | null
          result_entered_by?: string | null
          result_value?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_order_items_lab_order_id_fkey"
            columns: ["lab_order_id"]
            isOneToOne: false
            referencedRelation: "lab_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_order_items_lab_test_id_fkey"
            columns: ["lab_test_id"]
            isOneToOne: false
            referencedRelation: "lab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_orders: {
        Row: {
          consultation_id: string | null
          created_at: string | null
          id: string
          order_number: string
          ordered_by: string | null
          patient_id: string
          priority: string | null
          sample_collected_at: string | null
          sample_collected_by: string | null
          status: Database["public"]["Enums"]["lab_order_status"] | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          consultation_id?: string | null
          created_at?: string | null
          id?: string
          order_number: string
          ordered_by?: string | null
          patient_id: string
          priority?: string | null
          sample_collected_at?: string | null
          sample_collected_by?: string | null
          status?: Database["public"]["Enums"]["lab_order_status"] | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          consultation_id?: string | null
          created_at?: string | null
          id?: string
          order_number?: string
          ordered_by?: string | null
          patient_id?: string
          priority?: string | null
          sample_collected_at?: string | null
          sample_collected_by?: string | null
          status?: Database["public"]["Enums"]["lab_order_status"] | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_orders_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_tests: {
        Row: {
          category: string | null
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          normal_range: string | null
          price: number | null
          sample_type: string | null
          tenant_id: string
          turnaround_time: string | null
          unit: string | null
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          normal_range?: string | null
          price?: number | null
          sample_type?: string | null
          tenant_id: string
          turnaround_time?: string | null
          unit?: string | null
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          normal_range?: string | null
          price?: number | null
          sample_type?: string | null
          tenant_id?: string
          turnaround_time?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_tests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      opd_visits: {
        Row: {
          appointment_id: string | null
          check_in_time: string | null
          consultation_end_time: string | null
          consultation_start_time: string | null
          created_at: string | null
          doctor_id: string | null
          id: string
          patient_id: string
          status: Database["public"]["Enums"]["appointment_status"] | null
          tenant_id: string
          token_number: number | null
          updated_at: string | null
          visit_date: string | null
          vitals_time: string | null
        }
        Insert: {
          appointment_id?: string | null
          check_in_time?: string | null
          consultation_end_time?: string | null
          consultation_start_time?: string | null
          created_at?: string | null
          doctor_id?: string | null
          id?: string
          patient_id: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          tenant_id: string
          token_number?: number | null
          updated_at?: string | null
          visit_date?: string | null
          vitals_time?: string | null
        }
        Update: {
          appointment_id?: string | null
          check_in_time?: string | null
          consultation_end_time?: string | null
          consultation_start_time?: string | null
          created_at?: string | null
          doctor_id?: string | null
          id?: string
          patient_id?: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          tenant_id?: string
          token_number?: number | null
          updated_at?: string | null
          visit_date?: string | null
          vitals_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opd_visits_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opd_visits_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opd_visits_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opd_visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          allergies: string[] | null
          blood_group: string | null
          city: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          first_name: string
          gender: string | null
          id: string
          insurance_policy_number: string | null
          insurance_provider: string | null
          is_active: boolean | null
          last_name: string | null
          medical_history: Json | null
          phone: string
          photo_url: string | null
          pincode: string | null
          state: string | null
          tenant_id: string
          uhid: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          allergies?: string[] | null
          blood_group?: string | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name: string
          gender?: string | null
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          is_active?: boolean | null
          last_name?: string | null
          medical_history?: Json | null
          phone: string
          photo_url?: string | null
          pincode?: string | null
          state?: string | null
          tenant_id: string
          uhid: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          allergies?: string[] | null
          blood_group?: string | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          is_active?: boolean | null
          last_name?: string | null
          medical_history?: Json | null
          phone?: string
          photo_url?: string | null
          pincode?: string | null
          state?: string | null
          tenant_id?: string
          uhid?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string | null
          payment_mode: Database["public"]["Enums"]["payment_mode"]
          received_by: string | null
          tenant_id: string
          transaction_reference: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date?: string | null
          payment_mode: Database["public"]["Enums"]["payment_mode"]
          received_by?: string | null
          tenant_id: string
          transaction_reference?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string | null
          payment_mode?: Database["public"]["Enums"]["payment_mode"]
          received_by?: string | null
          tenant_id?: string
          transaction_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "billing_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacy_batches: {
        Row: {
          batch_number: string
          created_at: string | null
          expiry_date: string
          id: string
          inventory_id: string
          is_active: boolean | null
          purchase_price: number | null
          quantity: number | null
          received_date: string | null
        }
        Insert: {
          batch_number: string
          created_at?: string | null
          expiry_date: string
          id?: string
          inventory_id: string
          is_active?: boolean | null
          purchase_price?: number | null
          quantity?: number | null
          received_date?: string | null
        }
        Update: {
          batch_number?: string
          created_at?: string | null
          expiry_date?: string
          id?: string
          inventory_id?: string
          is_active?: boolean | null
          purchase_price?: number | null
          quantity?: number | null
          received_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_batches_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "pharmacy_inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacy_inventory: {
        Row: {
          category: string | null
          code: string
          created_at: string | null
          generic_name: string | null
          id: string
          is_active: boolean | null
          manufacturer: string | null
          mrp: number | null
          name: string
          reorder_level: number | null
          selling_price: number | null
          strength: string | null
          tenant_id: string
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string | null
          generic_name?: string | null
          id?: string
          is_active?: boolean | null
          manufacturer?: string | null
          mrp?: number | null
          name: string
          reorder_level?: number | null
          selling_price?: number | null
          strength?: string | null
          tenant_id: string
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string | null
          generic_name?: string | null
          id?: string
          is_active?: boolean | null
          manufacturer?: string | null
          mrp?: number | null
          name?: string
          reorder_level?: number | null
          selling_price?: number | null
          strength?: string | null
          tenant_id?: string
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_inventory_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          consultation_id: string | null
          created_at: string | null
          dispensed_at: string | null
          dispensed_by: string | null
          doctor_id: string
          id: string
          instructions: string | null
          is_dispensed: boolean | null
          items: Json
          patient_id: string
          prescription_number: string
          tenant_id: string
        }
        Insert: {
          consultation_id?: string | null
          created_at?: string | null
          dispensed_at?: string | null
          dispensed_by?: string | null
          doctor_id: string
          id?: string
          instructions?: string | null
          is_dispensed?: boolean | null
          items?: Json
          patient_id: string
          prescription_number: string
          tenant_id: string
        }
        Update: {
          consultation_id?: string | null
          created_at?: string | null
          dispensed_at?: string | null
          dispensed_by?: string | null
          doctor_id?: string
          id?: string
          instructions?: string | null
          is_dispensed?: boolean | null
          items?: Json
          patient_id?: string
          prescription_number?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          is_active: boolean | null
          phone: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id: string
          is_active?: boolean | null
          phone?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_profiles: {
        Row: {
          consultation_fee: number | null
          created_at: string | null
          department_id: string | null
          employee_code: string
          id: string
          is_available: boolean | null
          license_number: string | null
          qualification: string | null
          specialization: string | null
          tenant_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          consultation_fee?: number | null
          created_at?: string | null
          department_id?: string | null
          employee_code: string
          id?: string
          is_available?: boolean | null
          license_number?: string | null
          qualification?: string | null
          specialization?: string | null
          tenant_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          consultation_fee?: number | null
          created_at?: string | null
          department_id?: string | null
          employee_code?: string
          id?: string
          is_available?: boolean | null
          license_number?: string | null
          qualification?: string | null
          specialization?: string | null
          tenant_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          address: string | null
          city: string | null
          code: string
          country: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          phone: string | null
          settings: Json | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          code: string
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          phone?: string | null
          settings?: Json | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          code?: string
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          settings?: Json | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      token_counters: {
        Row: {
          counter_date: string | null
          department_id: string | null
          id: string
          last_token: number | null
          tenant_id: string
        }
        Insert: {
          counter_date?: string | null
          department_id?: string | null
          id?: string
          last_token?: number | null
          tenant_id: string
        }
        Update: {
          counter_date?: string | null
          department_id?: string | null
          id?: string
          last_token?: number | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_counters_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_counters_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      uhid_registry: {
        Row: {
          id: string
          last_sequence: number | null
          tenant_id: string
          year: number
        }
        Insert: {
          id?: string
          last_sequence?: number | null
          tenant_id: string
          year: number
        }
        Update: {
          id?: string
          last_sequence?: number | null
          tenant_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "uhid_registry_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      vitals: {
        Row: {
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          blood_sugar: number | null
          bmi: number | null
          created_at: string | null
          height: number | null
          id: string
          notes: string | null
          opd_visit_id: string | null
          oxygen_saturation: number | null
          patient_id: string
          pulse: number | null
          recorded_at: string | null
          recorded_by: string | null
          respiratory_rate: number | null
          temperature: number | null
          tenant_id: string
          weight: number | null
        }
        Insert: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          blood_sugar?: number | null
          bmi?: number | null
          created_at?: string | null
          height?: number | null
          id?: string
          notes?: string | null
          opd_visit_id?: string | null
          oxygen_saturation?: number | null
          patient_id: string
          pulse?: number | null
          recorded_at?: string | null
          recorded_by?: string | null
          respiratory_rate?: number | null
          temperature?: number | null
          tenant_id: string
          weight?: number | null
        }
        Update: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          blood_sugar?: number | null
          bmi?: number | null
          created_at?: string | null
          height?: number | null
          id?: string
          notes?: string | null
          opd_visit_id?: string | null
          oxygen_saturation?: number | null
          patient_id?: string
          pulse?: number | null
          recorded_at?: string | null
          recorded_by?: string | null
          respiratory_rate?: number | null
          temperature?: number | null
          tenant_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vitals_opd_visit_id_fkey"
            columns: ["opd_visit_id"]
            isOneToOne: false
            referencedRelation: "opd_visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vitals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vitals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_uhid: { Args: { _tenant_id: string }; Returns: string }
      get_next_token: {
        Args: { _department_id?: string; _tenant_id: string }
        Returns: number
      }
      get_user_tenant_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_superadmin: { Args: { _user_id: string }; Returns: boolean }
      user_belongs_to_tenant: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "superadmin"
        | "admin"
        | "reception"
        | "doctor"
        | "nurse"
        | "lab_staff"
        | "pharmacy"
      appointment_status:
        | "scheduled"
        | "checked_in"
        | "vitals_done"
        | "in_consultation"
        | "completed"
        | "cancelled"
        | "no_show"
      lab_order_status:
        | "requested"
        | "sample_collected"
        | "processing"
        | "result_pending"
        | "published"
        | "cancelled"
      payment_mode: "cash" | "card" | "upi" | "insurance" | "credit"
      payment_status: "pending" | "partial" | "paid" | "refunded"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "superadmin",
        "admin",
        "reception",
        "doctor",
        "nurse",
        "lab_staff",
        "pharmacy",
      ],
      appointment_status: [
        "scheduled",
        "checked_in",
        "vitals_done",
        "in_consultation",
        "completed",
        "cancelled",
        "no_show",
      ],
      lab_order_status: [
        "requested",
        "sample_collected",
        "processing",
        "result_pending",
        "published",
        "cancelled",
      ],
      payment_mode: ["cash", "card", "upi", "insurance", "credit"],
      payment_status: ["pending", "partial", "paid", "refunded"],
    },
  },
} as const
