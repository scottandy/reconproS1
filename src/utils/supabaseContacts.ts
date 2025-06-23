import { supabase } from '../lib/supabase';
import { Contact, ContactCategory, ContactSettings } from '../types/contact';

export class SupabaseContactManager {
  static async initializeDefaultContacts(dealershipId: string): Promise<void> {
    try {
      // Check if contacts already exist
      const { count, error: countError } = await supabase
        .from('contacts')
        .select('id', { count: 'exact', head: true })
        .eq('dealership_id', dealershipId);

      if (countError) {
        throw countError;
      }

      if (count && count > 0) {
        return; // Contacts already exist
      }

      const defaultContacts = [
        {
          dealership_id: dealershipId,
          name: 'Mike\'s Auto Body',
          company: 'Mike\'s Auto Body Shop',
          title: 'Owner',
          phone: '(555) 123-4567',
          email: 'mike@mikesautobody.com',
          address: '123 Main Street',
          city: 'Springfield',
          state: 'IL',
          zip_code: '62701',
          category: 'body-shop',
          specialties: ['Paint Work', 'Collision Repair', 'Dent Removal'],
          notes: 'Excellent paint matching. Quick turnaround on minor repairs.',
          is_favorite: true,
          is_active: true
        },
        {
          dealership_id: dealershipId,
          name: 'Sarah Johnson',
          company: 'Elite Detailing Services',
          title: 'Manager',
          phone: '(555) 987-6543',
          email: 'sarah@elitedetailing.com',
          category: 'detailing',
          specialties: ['Interior Cleaning', 'Paint Correction', 'Ceramic Coating'],
          notes: 'Premium detailing services. Great for high-end vehicles.',
          is_favorite: true,
          is_active: true
        },
        {
          dealership_id: dealershipId,
          name: 'Tom\'s Transmission',
          company: 'Tom\'s Transmission & Auto Repair',
          title: 'Lead Mechanic',
          phone: '(555) 456-7890',
          email: 'info@tomstransmission.com',
          category: 'mechanic',
          specialties: ['Transmission Repair', 'Engine Diagnostics', 'Brake Service'],
          notes: 'Reliable for complex mechanical issues. Fair pricing.',
          is_active: true
        },
        {
          dealership_id: dealershipId,
          name: 'AutoParts Plus',
          company: 'AutoParts Plus Distribution',
          title: 'Sales Representative',
          phone: '(555) 321-0987',
          email: 'orders@autopartsplus.com',
          category: 'parts-supplier',
          specialties: ['OEM Parts', 'Aftermarket Parts', 'Fast Delivery'],
          notes: 'Good inventory and competitive prices. Next-day delivery available.',
          is_active: true
        },
        {
          dealership_id: dealershipId,
          name: 'Quick Tow Services',
          company: 'Quick Tow & Recovery',
          title: 'Dispatcher',
          phone: '(555) 911-TOWS',
          email: 'dispatch@quicktow.com',
          category: 'towing',
          specialties: ['24/7 Service', 'Flatbed Towing', 'Vehicle Recovery'],
          notes: '24/7 availability. Reliable for emergency situations.',
          is_active: true
        }
      ];

      const { error } = await supabase
        .from('contacts')
        .insert(defaultContacts);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error initializing default contacts:', error);
    }
  }

  static async getContacts(dealershipId: string): Promise<Contact[]> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('dealership_id', dealershipId)
        .order('is_favorite', { ascending: false })
        .order('name');

      if (error) {
        throw error;
      }

      return data.map(contact => ({
        id: contact.id,
        name: contact.name,
        company: contact.company || undefined,
        title: contact.title || undefined,
        phone: contact.phone,
        email: contact.email || undefined,
        address: contact.address || undefined,
        city: contact.city || undefined,
        state: contact.state || undefined,
        zipCode: contact.zip_code || undefined,
        category: contact.category as ContactCategory,
        specialties: contact.specialties || undefined,
        notes: contact.notes || undefined,
        isFavorite: contact.is_favorite,
        isActive: contact.is_active,
        createdAt: contact.created_at,
        updatedAt: contact.updated_at,
        lastContacted: contact.last_contacted || undefined
      }));
    } catch (error) {
      console.error('Error getting contacts:', error);
      return [];
    }
  }

  static async addContact(dealershipId: string, contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact | null> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert({
          dealership_id: dealershipId,
          name: contactData.name,
          company: contactData.company || null,
          title: contactData.title || null,
          phone: contactData.phone,
          email: contactData.email || null,
          address: contactData.address || null,
          city: contactData.city || null,
          state: contactData.state || null,
          zip_code: contactData.zipCode || null,
          category: contactData.category,
          specialties: contactData.specialties || null,
          notes: contactData.notes || null,
          is_favorite: contactData.isFavorite || false,
          is_active: contactData.isActive
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        id: data.id,
        name: data.name,
        company: data.company || undefined,
        title: data.title || undefined,
        phone: data.phone,
        email: data.email || undefined,
        address: data.address || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        zipCode: data.zip_code || undefined,
        category: data.category as ContactCategory,
        specialties: data.specialties || undefined,
        notes: data.notes || undefined,
        isFavorite: data.is_favorite,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        lastContacted: data.last_contacted || undefined
      };
    } catch (error) {
      console.error('Error adding contact:', error);
      return null;
    }
  }

  static async updateContact(dealershipId: string, contactId: string, updates: Partial<Contact>): Promise<Contact | null> {
    try {
      const dbUpdates: any = {};

      // Map application properties to database columns
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.company !== undefined) dbUpdates.company = updates.company;
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.address !== undefined) dbUpdates.address = updates.address;
      if (updates.city !== undefined) dbUpdates.city = updates.city;
      if (updates.state !== undefined) dbUpdates.state = updates.state;
      if (updates.zipCode !== undefined) dbUpdates.zip_code = updates.zipCode;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.specialties !== undefined) dbUpdates.specialties = updates.specialties;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.isFavorite !== undefined) dbUpdates.is_favorite = updates.isFavorite;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
      if (updates.lastContacted !== undefined) dbUpdates.last_contacted = updates.lastContacted;

      // Add updated timestamp
      dbUpdates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('contacts')
        .update(dbUpdates)
        .eq('id', contactId)
        .eq('dealership_id', dealershipId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        id: data.id,
        name: data.name,
        company: data.company || undefined,
        title: data.title || undefined,
        phone: data.phone,
        email: data.email || undefined,
        address: data.address || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        zipCode: data.zip_code || undefined,
        category: data.category as ContactCategory,
        specialties: data.specialties || undefined,
        notes: data.notes || undefined,
        isFavorite: data.is_favorite,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        lastContacted: data.last_contacted || undefined
      };
    } catch (error) {
      console.error('Error updating contact:', error);
      return null;
    }
  }

  static async deleteContact(dealershipId: string, contactId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId)
        .eq('dealership_id', dealershipId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting contact:', error);
      return false;
    }
  }

  static async toggleFavorite(dealershipId: string, contactId: string): Promise<boolean> {
    try {
      // First get the current favorite status
      const { data: contact, error: getError } = await supabase
        .from('contacts')
        .select('is_favorite')
        .eq('id', contactId)
        .eq('dealership_id', dealershipId)
        .single();

      if (getError) {
        throw getError;
      }

      // Toggle the favorite status
      const { error: updateError } = await supabase
        .from('contacts')
        .update({
          is_favorite: !contact.is_favorite,
          updated_at: new Date().toISOString()
        })
        .eq('id', contactId)
        .eq('dealership_id', dealershipId);

      if (updateError) {
        throw updateError;
      }

      return !contact.is_favorite;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  }

  static async logCall(dealershipId: string, contactId: string): Promise<void> {
    try {
      await supabase
        .from('contacts')
        .update({
          last_contacted: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', contactId)
        .eq('dealership_id', dealershipId);
    } catch (error) {
      console.error('Error logging call:', error);
    }
  }

  static async searchContacts(dealershipId: string, query: string): Promise<Contact[]> {
    try {
      const searchTerm = `%${query.toLowerCase()}%`;

      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('dealership_id', dealershipId)
        .or(`name.ilike.${searchTerm},company.ilike.${searchTerm},phone.ilike.${searchTerm},email.ilike.${searchTerm}`);

      if (error) {
        throw error;
      }

      return data.map(contact => ({
        id: contact.id,
        name: contact.name,
        company: contact.company || undefined,
        title: contact.title || undefined,
        phone: contact.phone,
        email: contact.email || undefined,
        address: contact.address || undefined,
        city: contact.city || undefined,
        state: contact.state || undefined,
        zipCode: contact.zip_code || undefined,
        category: contact.category as ContactCategory,
        specialties: contact.specialties || undefined,
        notes: contact.notes || undefined,
        isFavorite: contact.is_favorite,
        isActive: contact.is_active,
        createdAt: contact.created_at,
        updatedAt: contact.updated_at,
        lastContacted: contact.last_contacted || undefined
      }));
    } catch (error) {
      console.error('Error searching contacts:', error);
      return [];
    }
  }

  static async getContactStats(dealershipId: string): Promise<{
    total: number;
    active: number;
    favorites: number;
    byCategory: Record<ContactCategory, number>;
  }> {
    try {
      // Get total count
      const { count: total, error: totalError } = await supabase
        .from('contacts')
        .select('id', { count: 'exact', head: true })
        .eq('dealership_id', dealershipId);

      if (totalError) {
        throw totalError;
      }

      // Get active count
      const { count: active, error: activeError } = await supabase
        .from('contacts')
        .select('id', { count: 'exact', head: true })
        .eq('dealership_id', dealershipId)
        .eq('is_active', true);

      if (activeError) {
        throw activeError;
      }

      // Get favorites count
      const { count: favorites, error: favoritesError } = await supabase
        .from('contacts')
        .select('id', { count: 'exact', head: true })
        .eq('dealership_id', dealershipId)
        .eq('is_active', true)
        .eq('is_favorite', true);

      if (favoritesError) {
        throw favoritesError;
      }

      // Get counts by category
      const { data: categoryCounts, error: categoryError } = await supabase
        .from('contacts')
        .select('category, count')
        .eq('dealership_id', dealershipId)
        .eq('is_active', true)
        .group('category');

      if (categoryError) {
        throw categoryError;
      }

      const byCategory: Record<ContactCategory, number> = {
        'body-shop': 0,
        'mechanic': 0,
        'detailing': 0,
        'parts-supplier': 0,
        'towing': 0,
        'inspection': 0,
        'transport': 0,
        'vendor': 0,
        'other': 0
      };

      categoryCounts.forEach(item => {
        byCategory[item.category as ContactCategory] = parseInt(item.count);
      });

      return {
        total: total || 0,
        active: active || 0,
        favorites: favorites || 0,
        byCategory
      };
    } catch (error) {
      console.error('Error getting contact stats:', error);
      return {
        total: 0,
        active: 0,
        favorites: 0,
        byCategory: {
          'body-shop': 0,
          'mechanic': 0,
          'detailing': 0,
          'parts-supplier': 0,
          'towing': 0,
          'inspection': 0,
          'transport': 0,
          'vendor': 0,
          'other': 0
        }
      };
    }
  }

  static formatPhoneNumber(phone: string): string {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    
    return phone; // Return original if not 10 digits
  }

  static makePhoneCall(phone: string): void {
    // Create tel: link for mobile devices
    const cleanPhone = phone.replace(/\D/g, '');
    window.location.href = `tel:${cleanPhone}`;
  }
}