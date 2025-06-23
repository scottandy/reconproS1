import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      dealerships: {
        Row: {
          id: string;
          name: string;
          address: string;
          city: string;
          state: string;
          zip_code: string;
          phone: string;
          email: string;
          website: string | null;
          is_active: boolean;
          subscription_plan: 'basic' | 'premium' | 'enterprise';
          max_users: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          city: string;
          state: string;
          zip_code: string;
          phone: string;
          email: string;
          website?: string | null;
          is_active?: boolean;
          subscription_plan?: 'basic' | 'premium' | 'enterprise';
          max_users?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          city?: string;
          state?: string;
          zip_code?: string;
          phone?: string;
          email?: string;
          website?: string | null;
          is_active?: boolean;
          subscription_plan?: 'basic' | 'premium' | 'enterprise';
          max_users?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          initials: string;
          role: 'admin' | 'manager' | 'technician' | 'sales';
          dealership_id: string;
          is_active: boolean;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          initials: string;
          role: 'admin' | 'manager' | 'technician' | 'sales';
          dealership_id: string;
          is_active?: boolean;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          initials?: string;
          role?: 'admin' | 'manager' | 'technician' | 'sales';
          dealership_id?: string;
          is_active?: boolean;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      vehicles: {
        Row: {
          id: string;
          dealership_id: string;
          vin: string;
          year: number;
          make: string;
          model: string;
          trim: string | null;
          mileage: number;
          color: string;
          date_acquired: string;
          target_sale_date: string | null;
          price: number;
          location: string;
          status_emissions: 'not-started' | 'pending' | 'completed' | 'needs-attention';
          status_cosmetic: 'not-started' | 'pending' | 'completed' | 'needs-attention';
          status_mechanical: 'not-started' | 'pending' | 'completed' | 'needs-attention';
          status_cleaned: 'not-started' | 'pending' | 'completed' | 'needs-attention';
          status_photos: 'not-started' | 'pending' | 'completed' | 'needs-attention';
          notes: string | null;
          is_sold: boolean;
          sold_by: string | null;
          sold_date: string | null;
          sold_price: number | null;
          sold_notes: string | null;
          is_pending: boolean;
          pending_by: string | null;
          pending_date: string | null;
          pending_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          dealership_id: string;
          vin: string;
          year: number;
          make: string;
          model: string;
          trim?: string | null;
          mileage: number;
          color: string;
          date_acquired: string;
          target_sale_date?: string | null;
          price: number;
          location: string;
          status_emissions?: 'not-started' | 'pending' | 'completed' | 'needs-attention';
          status_cosmetic?: 'not-started' | 'pending' | 'completed' | 'needs-attention';
          status_mechanical?: 'not-started' | 'pending' | 'completed' | 'needs-attention';
          status_cleaned?: 'not-started' | 'pending' | 'completed' | 'needs-attention';
          status_photos?: 'not-started' | 'pending' | 'completed' | 'needs-attention';
          notes?: string | null;
          is_sold?: boolean;
          sold_by?: string | null;
          sold_date?: string | null;
          sold_price?: number | null;
          sold_notes?: string | null;
          is_pending?: boolean;
          pending_by?: string | null;
          pending_date?: string | null;
          pending_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          dealership_id?: string;
          vin?: string;
          year?: number;
          make?: string;
          model?: string;
          trim?: string | null;
          mileage?: number;
          color?: string;
          date_acquired?: string;
          target_sale_date?: string | null;
          price?: number;
          location?: string;
          status_emissions?: 'not-started' | 'pending' | 'completed' | 'needs-attention';
          status_cosmetic?: 'not-started' | 'pending' | 'completed' | 'needs-attention';
          status_mechanical?: 'not-started' | 'pending' | 'completed' | 'needs-attention';
          status_cleaned?: 'not-started' | 'pending' | 'completed' | 'needs-attention';
          status_photos?: 'not-started' | 'pending' | 'completed' | 'needs-attention';
          notes?: string | null;
          is_sold?: boolean;
          sold_by?: string | null;
          sold_date?: string | null;
          sold_price?: number | null;
          sold_notes?: string | null;
          is_pending?: boolean;
          pending_by?: string | null;
          pending_date?: string | null;
          pending_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      team_notes: {
        Row: {
          id: string;
          vehicle_id: string;
          text: string;
          user_initials: string;
          category: string;
          is_certified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          text: string;
          user_initials: string;
          category?: string;
          is_certified?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          vehicle_id?: string;
          text?: string;
          user_initials?: string;
          category?: string;
          is_certified?: boolean;
          created_at?: string;
        };
      };
      contacts: {
        Row: {
          id: string;
          dealership_id: string;
          name: string;
          company: string | null;
          title: string | null;
          phone: string;
          email: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          category: string;
          specialties: string[] | null;
          notes: string | null;
          is_favorite: boolean;
          is_active: boolean;
          last_contacted: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          dealership_id: string;
          name: string;
          company?: string | null;
          title?: string | null;
          phone: string;
          email?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          category: string;
          specialties?: string[] | null;
          notes?: string | null;
          is_favorite?: boolean;
          is_active?: boolean;
          last_contacted?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          dealership_id?: string;
          name?: string;
          company?: string | null;
          title?: string | null;
          phone?: string;
          email?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          category?: string;
          specialties?: string[] | null;
          notes?: string | null;
          is_favorite?: boolean;
          is_active?: boolean;
          last_contacted?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      todos: {
        Row: {
          id: string;
          dealership_id: string;
          title: string;
          description: string | null;
          priority: 'low' | 'medium' | 'high' | 'urgent';
          status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
          category: string;
          assigned_to: string;
          assigned_by: string;
          due_date: string | null;
          due_time: string | null;
          vehicle_id: string | null;
          vehicle_name: string | null;
          tags: string[] | null;
          notes: string | null;
          completed_at: string | null;
          completed_by: string | null;
          is_recurring: boolean;
          recurring_pattern: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          dealership_id: string;
          title: string;
          description?: string | null;
          priority: 'low' | 'medium' | 'high' | 'urgent';
          status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
          category: string;
          assigned_to: string;
          assigned_by: string;
          due_date?: string | null;
          due_time?: string | null;
          vehicle_id?: string | null;
          vehicle_name?: string | null;
          tags?: string[] | null;
          notes?: string | null;
          completed_at?: string | null;
          completed_by?: string | null;
          is_recurring?: boolean;
          recurring_pattern?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          dealership_id?: string;
          title?: string;
          description?: string | null;
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
          category?: string;
          assigned_to?: string;
          assigned_by?: string;
          due_date?: string | null;
          due_time?: string | null;
          vehicle_id?: string | null;
          vehicle_name?: string | null;
          tags?: string[] | null;
          notes?: string | null;
          completed_at?: string | null;
          completed_by?: string | null;
          is_recurring?: boolean;
          recurring_pattern?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      locations: {
        Row: {
          id: string;
          dealership_id: string;
          name: string;
          type: string;
          description: string | null;
          capacity: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          dealership_id: string;
          name: string;
          type: string;
          description?: string | null;
          capacity?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          dealership_id?: string;
          name?: string;
          type?: string;
          description?: string | null;
          capacity?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      analytics_events: {
        Row: {
          id: string;
          dealership_id: string;
          vehicle_id: string;
          vehicle_name: string;
          section: string;
          section_name: string;
          completed_by: string;
          completed_date: string;
          item_name: string | null;
          old_rating: string | null;
          new_rating: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          dealership_id: string;
          vehicle_id: string;
          vehicle_name: string;
          section: string;
          section_name: string;
          completed_by: string;
          completed_date: string;
          item_name?: string | null;
          old_rating?: string | null;
          new_rating?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          dealership_id?: string;
          vehicle_id?: string;
          vehicle_name?: string;
          section?: string;
          section_name?: string;
          completed_by?: string;
          completed_date?: string;
          item_name?: string | null;
          old_rating?: string | null;
          new_rating?: string | null;
          created_at?: string;
        };
      };
      inspection_data: {
        Row: {
          id: string;
          vehicle_id: string;
          section_key: string;
          items: any; // JSON
          section_notes: string | null;
          overall_notes: string | null;
          last_saved: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          section_key: string;
          items: any;
          section_notes?: string | null;
          overall_notes?: string | null;
          last_saved?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          vehicle_id?: string;
          section_key?: string;
          items?: any;
          section_notes?: string | null;
          overall_notes?: string | null;
          last_saved?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}