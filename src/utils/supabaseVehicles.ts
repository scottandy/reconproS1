import { supabase } from '../lib/supabase';
import { Vehicle, TeamNote, InspectionStatus } from '../types/vehicle';

export class SupabaseVehicleManager {
  // Get all vehicles for a dealership
  static async getVehicles(dealershipId: string): Promise<Vehicle[]> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          team_notes:team_notes(*)
        `)
        .eq('dealership_id', dealershipId)
        .eq('is_sold', false)
        .eq('is_pending', false);

      if (error) {
        throw error;
      }

      // Convert to application format
      return data.map(vehicle => this.mapDatabaseToVehicle(vehicle));
    } catch (error) {
      console.error('Error getting vehicles:', error);
      return [];
    }
  }

  // Get sold vehicles
  static async getSoldVehicles(dealershipId: string): Promise<Vehicle[]> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          team_notes:team_notes(*)
        `)
        .eq('dealership_id', dealershipId)
        .eq('is_sold', true);

      if (error) {
        throw error;
      }

      return data.map(vehicle => this.mapDatabaseToVehicle(vehicle));
    } catch (error) {
      console.error('Error getting sold vehicles:', error);
      return [];
    }
  }

  // Get pending vehicles
  static async getPendingVehicles(dealershipId: string): Promise<Vehicle[]> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          team_notes:team_notes(*)
        `)
        .eq('dealership_id', dealershipId)
        .eq('is_pending', true);

      if (error) {
        throw error;
      }

      return data.map(vehicle => this.mapDatabaseToVehicle(vehicle));
    } catch (error) {
      console.error('Error getting pending vehicles:', error);
      return [];
    }
  }

  // Get a single vehicle by ID
  static async getVehicle(vehicleId: string): Promise<Vehicle | null> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          team_notes:team_notes(*)
        `)
        .eq('id', vehicleId)
        .single();

      if (error) {
        throw error;
      }

      return this.mapDatabaseToVehicle(data);
    } catch (error) {
      console.error('Error getting vehicle:', error);
      return null;
    }
  }

  // Add a new vehicle
  static async addVehicle(dealershipId: string, vehicleData: Omit<Vehicle, 'id'>): Promise<Vehicle | null> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert({
          dealership_id: dealershipId,
          vin: vehicleData.vin,
          year: vehicleData.year,
          make: vehicleData.make,
          model: vehicleData.model,
          trim: vehicleData.trim || null,
          mileage: vehicleData.mileage,
          color: vehicleData.color,
          date_acquired: vehicleData.dateAcquired,
          target_sale_date: vehicleData.targetSaleDate || null,
          price: vehicleData.price,
          location: vehicleData.location,
          status_emissions: vehicleData.status.emissions,
          status_cosmetic: vehicleData.status.cosmetic,
          status_mechanical: vehicleData.status.mechanical,
          status_cleaned: vehicleData.status.cleaned,
          status_photos: vehicleData.status.photos,
          notes: vehicleData.notes || null,
          is_sold: vehicleData.isSold || false,
          sold_by: vehicleData.soldBy || null,
          sold_date: vehicleData.soldDate || null,
          sold_price: vehicleData.soldPrice || null,
          sold_notes: vehicleData.soldNotes || null,
          is_pending: vehicleData.isPending || false,
          pending_by: vehicleData.pendingBy || null,
          pending_date: vehicleData.pendingDate || null,
          pending_notes: vehicleData.pendingNotes || null
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Add team notes if any
      if (vehicleData.teamNotes && vehicleData.teamNotes.length > 0) {
        const teamNotes = vehicleData.teamNotes.map(note => ({
          vehicle_id: data.id,
          text: note.text,
          user_initials: note.userInitials,
          category: note.category || 'general',
          is_certified: note.isCertified || false,
          created_at: note.timestamp
        }));

        await supabase.from('team_notes').insert(teamNotes);
      }

      return this.getVehicle(data.id);
    } catch (error) {
      console.error('Error adding vehicle:', error);
      return null;
    }
  }

  // Update a vehicle
  static async updateVehicle(vehicleId: string, updates: Partial<Vehicle>): Promise<Vehicle | null> {
    try {
      const dbUpdates: any = {};

      // Map application properties to database columns
      if (updates.vin !== undefined) dbUpdates.vin = updates.vin;
      if (updates.year !== undefined) dbUpdates.year = updates.year;
      if (updates.make !== undefined) dbUpdates.make = updates.make;
      if (updates.model !== undefined) dbUpdates.model = updates.model;
      if (updates.trim !== undefined) dbUpdates.trim = updates.trim;
      if (updates.mileage !== undefined) dbUpdates.mileage = updates.mileage;
      if (updates.color !== undefined) dbUpdates.color = updates.color;
      if (updates.dateAcquired !== undefined) dbUpdates.date_acquired = updates.dateAcquired;
      if (updates.targetSaleDate !== undefined) dbUpdates.target_sale_date = updates.targetSaleDate;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.location !== undefined) dbUpdates.location = updates.location;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.isSold !== undefined) dbUpdates.is_sold = updates.isSold;
      if (updates.soldBy !== undefined) dbUpdates.sold_by = updates.soldBy;
      if (updates.soldDate !== undefined) dbUpdates.sold_date = updates.soldDate;
      if (updates.soldPrice !== undefined) dbUpdates.sold_price = updates.soldPrice;
      if (updates.soldNotes !== undefined) dbUpdates.sold_notes = updates.soldNotes;
      if (updates.isPending !== undefined) dbUpdates.is_pending = updates.isPending;
      if (updates.pendingBy !== undefined) dbUpdates.pending_by = updates.pendingBy;
      if (updates.pendingDate !== undefined) dbUpdates.pending_date = updates.pendingDate;
      if (updates.pendingNotes !== undefined) dbUpdates.pending_notes = updates.pendingNotes;

      // Handle status updates
      if (updates.status) {
        if (updates.status.emissions !== undefined) dbUpdates.status_emissions = updates.status.emissions;
        if (updates.status.cosmetic !== undefined) dbUpdates.status_cosmetic = updates.status.cosmetic;
        if (updates.status.mechanical !== undefined) dbUpdates.status_mechanical = updates.status.mechanical;
        if (updates.status.cleaned !== undefined) dbUpdates.status_cleaned = updates.status.cleaned;
        if (updates.status.photos !== undefined) dbUpdates.status_photos = updates.status.photos;
      }

      // Add updated timestamp
      dbUpdates.updated_at = new Date().toISOString();

      // Update the vehicle
      const { error } = await supabase
        .from('vehicles')
        .update(dbUpdates)
        .eq('id', vehicleId);

      if (error) {
        throw error;
      }

      // Add team notes if any
      if (updates.teamNotes && updates.teamNotes.length > 0) {
        const newNotes = updates.teamNotes.filter(note => !note.id.includes('note-'));
        
        if (newNotes.length > 0) {
          const teamNotes = newNotes.map(note => ({
            vehicle_id: vehicleId,
            text: note.text,
            user_initials: note.userInitials,
            category: note.category || 'general',
            is_certified: note.isCertified || false,
            created_at: note.timestamp
          }));

          await supabase.from('team_notes').insert(teamNotes);
        }
      }

      return this.getVehicle(vehicleId);
    } catch (error) {
      console.error('Error updating vehicle:', error);
      return null;
    }
  }

  // Add a team note to a vehicle
  static async addTeamNote(vehicleId: string, note: Omit<TeamNote, 'id' | 'timestamp'>): Promise<TeamNote | null> {
    try {
      const timestamp = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('team_notes')
        .insert({
          vehicle_id: vehicleId,
          text: note.text,
          user_initials: note.userInitials,
          category: note.category || 'general',
          is_certified: note.isCertified || false,
          created_at: timestamp
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        id: data.id,
        text: data.text,
        userInitials: data.user_initials,
        timestamp: data.created_at,
        category: data.category,
        isCertified: data.is_certified
      };
    } catch (error) {
      console.error('Error adding team note:', error);
      return null;
    }
  }

  // Mark a vehicle as sold
  static async markVehicleAsSold(vehicleId: string, soldBy: string, soldPrice?: number, soldNotes?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({
          is_sold: true,
          sold_by: soldBy,
          sold_date: new Date().toISOString(),
          sold_price: soldPrice,
          sold_notes: soldNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', vehicleId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error marking vehicle as sold:', error);
      return false;
    }
  }

  // Mark a vehicle as pending
  static async markVehicleAsPending(vehicleId: string, pendingBy: string, pendingNotes?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({
          is_pending: true,
          pending_by: pendingBy,
          pending_date: new Date().toISOString(),
          pending_notes: pendingNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', vehicleId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error marking vehicle as pending:', error);
      return false;
    }
  }

  // Reactivate a vehicle from sold or pending status
  static async reactivateVehicle(vehicleId: string, userInitials: string, fromStatus: 'sold' | 'pending'): Promise<Vehicle | null> {
    try {
      const updates: any = {
        is_sold: false,
        is_pending: false,
        updated_at: new Date().toISOString()
      };

      // Add reactivation info
      if (fromStatus === 'sold') {
        updates.reactivated_from = 'sold';
      } else {
        updates.reactivated_from = 'pending';
      }

      const { error } = await supabase
        .from('vehicles')
        .update(updates)
        .eq('id', vehicleId);

      if (error) {
        throw error;
      }

      // Add team note about reactivation
      await this.addTeamNote(vehicleId, {
        text: `Vehicle reactivated from ${fromStatus} status and returned to active inventory.`,
        userInitials: userInitials,
        category: 'general'
      });

      return this.getVehicle(vehicleId);
    } catch (error) {
      console.error('Error reactivating vehicle:', error);
      return null;
    }
  }

  // Helper method to convert database format to application format
  private static mapDatabaseToVehicle(data: any): Vehicle {
    // Map team notes
    const teamNotes: TeamNote[] = data.team_notes ? data.team_notes.map((note: any) => ({
      id: note.id,
      text: note.text,
      userInitials: note.user_initials,
      timestamp: note.created_at,
      category: note.category,
      isCertified: note.is_certified
    })) : [];

    // Create vehicle object
    const vehicle: Vehicle = {
      id: data.id,
      vin: data.vin,
      year: data.year,
      make: data.make,
      model: data.model,
      trim: data.trim || undefined,
      mileage: data.mileage,
      color: data.color,
      dateAcquired: data.date_acquired,
      targetSaleDate: data.target_sale_date || undefined,
      price: data.price,
      location: data.location,
      status: {
        emissions: data.status_emissions as InspectionStatus,
        cosmetic: data.status_cosmetic as InspectionStatus,
        mechanical: data.status_mechanical as InspectionStatus,
        cleaned: data.status_cleaned as InspectionStatus,
        photos: data.status_photos as InspectionStatus
      },
      notes: data.notes || undefined,
      teamNotes: teamNotes,
      isSold: data.is_sold,
      soldBy: data.sold_by || undefined,
      soldDate: data.sold_date || undefined,
      soldPrice: data.sold_price || undefined,
      soldNotes: data.sold_notes || undefined,
      isPending: data.is_pending,
      pendingBy: data.pending_by || undefined,
      pendingDate: data.pending_date || undefined,
      pendingNotes: data.pending_notes || undefined,
      locationChangedBy: data.location_changed_by || undefined,
      locationChangedDate: data.location_changed_date || undefined,
      reactivatedBy: data.reactivated_by || undefined,
      reactivatedDate: data.reactivated_date || undefined,
      reactivatedFrom: data.reactivated_from as 'sold' | 'pending' | undefined
    };

    return vehicle;
  }
}