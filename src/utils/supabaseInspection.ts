import { supabase } from '../lib/supabase';
import { InspectionSettings, DEFAULT_INSPECTION_SETTINGS } from '../types/inspectionSettings';

export class SupabaseInspectionManager {
  static async initializeDefaultSettings(dealershipId: string): Promise<void> {
    try {
      // Check if settings already exist
      const { data, error } = await supabase
        .from('inspection_settings')
        .select('id')
        .eq('dealership_id', dealershipId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }

      if (data) {
        return; // Settings already exist
      }

      // Create default settings
      const defaultSettings = {
        dealership_id: dealershipId,
        settings: DEFAULT_INSPECTION_SETTINGS
      };

      const { error: insertError } = await supabase
        .from('inspection_settings')
        .insert(defaultSettings);

      if (insertError) {
        throw insertError;
      }
    } catch (error) {
      console.error('Error initializing default inspection settings:', error);
    }
  }

  static async getSettings(dealershipId: string): Promise<InspectionSettings | null> {
    try {
      const { data, error } = await supabase
        .from('inspection_settings')
        .select('settings')
        .eq('dealership_id', dealershipId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          // Initialize default settings
          await this.initializeDefaultSettings(dealershipId);
          return DEFAULT_INSPECTION_SETTINGS as InspectionSettings;
        }
        throw error;
      }

      // Merge with default settings to ensure all properties exist
      const mergedSettings: InspectionSettings = {
        ...DEFAULT_INSPECTION_SETTINGS,
        ...data.settings,
        // Ensure nested objects are properly merged
        customerPdfSettings: {
          ...DEFAULT_INSPECTION_SETTINGS.customerPdfSettings,
          ...(data.settings.customerPdfSettings || {})
        },
        globalSettings: {
          ...DEFAULT_INSPECTION_SETTINGS.globalSettings,
          ...(data.settings.globalSettings || {})
        },
        id: data.id || `settings-${Date.now()}`,
        dealershipId
      };

      return mergedSettings;
    } catch (error) {
      console.error('Error getting inspection settings:', error);
      return null;
    }
  }

  static async saveSettings(dealershipId: string, settings: InspectionSettings): Promise<boolean> {
    try {
      const { data, error: selectError } = await supabase
        .from('inspection_settings')
        .select('id')
        .eq('dealership_id', dealershipId)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        throw selectError;
      }

      const updatedSettings = {
        ...settings,
        updatedAt: new Date().toISOString()
      };

      if (data) {
        // Update existing settings
        const { error: updateError } = await supabase
          .from('inspection_settings')
          .update({
            settings: updatedSettings
          })
          .eq('id', data.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        // Insert new settings
        const { error: insertError } = await supabase
          .from('inspection_settings')
          .insert({
            dealership_id: dealershipId,
            settings: updatedSettings
          });

        if (insertError) {
          throw insertError;
        }
      }

      return true;
    } catch (error) {
      console.error('Error saving inspection settings:', error);
      return false;
    }
  }

  // Save inspection data for a vehicle
  static async saveInspectionData(vehicleId: string, sectionKey: string, data: any): Promise<boolean> {
    try {
      // Check if inspection data already exists for this vehicle and section
      const { data: existingData, error: selectError } = await supabase
        .from('inspection_data')
        .select('id')
        .eq('vehicle_id', vehicleId)
        .eq('section_key', sectionKey)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        throw selectError;
      }

      const now = new Date().toISOString();

      if (existingData) {
        // Update existing data
        const { error: updateError } = await supabase
          .from('inspection_data')
          .update({
            items: data.items,
            section_notes: data.sectionNotes || null,
            overall_notes: data.overallNotes || null,
            last_saved: now,
            updated_at: now
          })
          .eq('id', existingData.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        // Insert new data
        const { error: insertError } = await supabase
          .from('inspection_data')
          .insert({
            vehicle_id: vehicleId,
            section_key: sectionKey,
            items: data.items,
            section_notes: data.sectionNotes || null,
            overall_notes: data.overallNotes || null,
            last_saved: now
          });

        if (insertError) {
          throw insertError;
        }
      }

      return true;
    } catch (error) {
      console.error('Error saving inspection data:', error);
      return false;
    }
  }

  // Get inspection data for a vehicle
  static async getInspectionData(vehicleId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('inspection_data')
        .select('*')
        .eq('vehicle_id', vehicleId);

      if (error) {
        throw error;
      }

      // Organize data by section
      const result: any = {
        sectionNotes: {},
        overallNotes: ''
      };

      data.forEach(item => {
        result[item.section_key] = item.items;
        if (item.section_notes) {
          result.sectionNotes[item.section_key] = item.section_notes;
        }
        if (item.overall_notes && !result.overallNotes) {
          result.overallNotes = item.overall_notes;
        }
      });

      return result;
    } catch (error) {
      console.error('Error getting inspection data:', error);
      return null;
    }
  }
}