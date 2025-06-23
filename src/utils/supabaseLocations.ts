import { supabase } from '../lib/supabase';
import { Location, LocationType, LocationSettings } from '../types/location';

export class SupabaseLocationManager {
  static async initializeDefaultLocations(dealershipId: string): Promise<void> {
    try {
      // Check if locations already exist
      const { count, error: countError } = await supabase
        .from('locations')
        .select('id', { count: 'exact', head: true })
        .eq('dealership_id', dealershipId);

      if (countError) {
        throw countError;
      }

      if (count && count > 0) {
        return; // Locations already exist
      }

      const defaultLocations = [
        {
          dealership_id: dealershipId,
          name: 'Lot A',
          type: 'on-site',
          description: 'Main front lot',
          capacity: 50,
          is_active: true
        },
        {
          dealership_id: dealershipId,
          name: 'Lot B',
          type: 'on-site',
          description: 'Side lot',
          capacity: 30,
          is_active: true
        },
        {
          dealership_id: dealershipId,
          name: 'Indoor Showroom',
          type: 'display',
          description: 'Indoor display area',
          capacity: 8,
          is_active: true
        },
        {
          dealership_id: dealershipId,
          name: 'Service Bay',
          type: 'service',
          description: 'Service department',
          capacity: 12,
          is_active: true
        },
        {
          dealership_id: dealershipId,
          name: 'Test Drive',
          type: 'test-drive',
          description: 'Vehicles out for test drives',
          is_active: true
        },
        {
          dealership_id: dealershipId,
          name: 'Demo Fleet',
          type: 'demo',
          description: 'Demo vehicles',
          capacity: 5,
          is_active: true
        },
        {
          dealership_id: dealershipId,
          name: 'In-Transit',
          type: 'in-transit',
          description: 'Vehicles being transported',
          is_active: true
        }
      ];

      const { error } = await supabase
        .from('locations')
        .insert(defaultLocations);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error initializing default locations:', error);
    }
  }

  static async getLocations(dealershipId: string): Promise<Location[]> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('dealership_id', dealershipId)
        .order('name');

      if (error) {
        throw error;
      }

      return data.map(location => ({
        id: location.id,
        name: location.name,
        type: location.type as LocationType,
        description: location.description || undefined,
        capacity: location.capacity || undefined,
        isActive: location.is_active,
        createdAt: location.created_at,
        updatedAt: location.updated_at
      }));
    } catch (error) {
      console.error('Error getting locations:', error);
      return [];
    }
  }

  static async addLocation(dealershipId: string, locationData: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>): Promise<Location | null> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .insert({
          dealership_id: dealershipId,
          name: locationData.name,
          type: locationData.type,
          description: locationData.description || null,
          capacity: locationData.capacity || null,
          is_active: locationData.isActive
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        id: data.id,
        name: data.name,
        type: data.type as LocationType,
        description: data.description || undefined,
        capacity: data.capacity || undefined,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error adding location:', error);
      return null;
    }
  }

  static async updateLocation(dealershipId: string, locationId: string, updates: Partial<Location>): Promise<Location | null> {
    try {
      const dbUpdates: any = {};

      // Map application properties to database columns
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.type !== undefined) dbUpdates.type = updates.type;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.capacity !== undefined) dbUpdates.capacity = updates.capacity;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

      // Add updated timestamp
      dbUpdates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('locations')
        .update(dbUpdates)
        .eq('id', locationId)
        .eq('dealership_id', dealershipId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        id: data.id,
        name: data.name,
        type: data.type as LocationType,
        description: data.description || undefined,
        capacity: data.capacity || undefined,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error updating location:', error);
      return null;
    }
  }

  static async deleteLocation(dealershipId: string, locationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', locationId)
        .eq('dealership_id', dealershipId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting location:', error);
      return false;
    }
  }

  static async getLocationSettings(dealershipId: string): Promise<LocationSettings> {
    try {
      const { data, error } = await supabase
        .from('location_settings')
        .select('settings')
        .eq('dealership_id', dealershipId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          // Return default settings
          const defaultSettings: LocationSettings = {
            defaultLocationType: 'on-site',
            allowCustomLocations: true,
            requireLocationForVehicles: true,
            autoAssignLocation: false,
            locationCapacityTracking: true
          };
          
          // Save default settings
          await this.saveLocationSettings(dealershipId, defaultSettings);
          
          return defaultSettings;
        }
        throw error;
      }

      return data.settings;
    } catch (error) {
      console.error('Error getting location settings:', error);
      
      // Return default settings on error
      return {
        defaultLocationType: 'on-site',
        allowCustomLocations: true,
        requireLocationForVehicles: true,
        autoAssignLocation: false,
        locationCapacityTracking: true
      };
    }
  }

  static async saveLocationSettings(dealershipId: string, settings: LocationSettings): Promise<boolean> {
    try {
      const { data, error: selectError } = await supabase
        .from('location_settings')
        .select('id')
        .eq('dealership_id', dealershipId)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        throw selectError;
      }

      if (data) {
        // Update existing settings
        const { error: updateError } = await supabase
          .from('location_settings')
          .update({
            settings,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        // Insert new settings
        const { error: insertError } = await supabase
          .from('location_settings')
          .insert({
            dealership_id: dealershipId,
            settings
          });

        if (insertError) {
          throw insertError;
        }
      }

      return true;
    } catch (error) {
      console.error('Error saving location settings:', error);
      return false;
    }
  }

  static async getVehicleCountByLocation(dealershipId: string, locationName: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('vehicles')
        .select('id', { count: 'exact', head: true })
        .eq('dealership_id', dealershipId)
        .eq('location', locationName)
        .eq('is_sold', false)
        .eq('is_pending', false);

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Error getting vehicle count by location:', error);
      return 0;
    }
  }

  static async getAllVehicleLocationCounts(dealershipId: string): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('location, count')
        .eq('dealership_id', dealershipId)
        .eq('is_sold', false)
        .eq('is_pending', false)
        .group('location');

      if (error) {
        throw error;
      }

      const locationCounts: Record<string, number> = {};
      data.forEach(item => {
        locationCounts[item.location] = parseInt(item.count);
      });

      return locationCounts;
    } catch (error) {
      console.error('Error getting all vehicle location counts:', error);
      return {};
    }
  }
}