import { supabase } from '../lib/supabase';
import { CompletionEvent, DailyAnalytics, UserDailyAnalytics } from '../types/analytics';

export class SupabaseAnalyticsManager {
  // Record any inspection task update
  static async recordTaskUpdate(
    dealershipId: string,
    vehicleId: string,
    vehicleName: string,
    section: CompletionEvent['section'],
    userInitials: string,
    itemName?: string,
    oldRating?: string,
    newRating?: string
  ): Promise<void> {
    try {
      const now = new Date();
      const completedDate = now.toISOString().split('T')[0];
      
      await supabase
        .from('analytics_events')
        .insert({
          dealership_id: dealershipId,
          vehicle_id: vehicleId,
          vehicle_name: vehicleName,
          section: section,
          section_name: this.getSectionDisplayName(section),
          completed_by: userInitials,
          completed_date: completedDate,
          item_name: itemName || null,
          old_rating: oldRating || null,
          new_rating: newRating || null
        });

      console.log(`✅ Analytics event recorded for ${userInitials} on ${vehicleId}`);
    } catch (error) {
      console.error('Error recording analytics event:', error);
    }
  }

  // Legacy method for backward compatibility
  static async recordCompletion(
    dealershipId: string,
    vehicleId: string,
    vehicleName: string,
    section: CompletionEvent['section'],
    userInitials: string,
    itemName?: string,
    oldRating?: string,
    newRating?: string
  ): Promise<void> {
    await this.recordTaskUpdate(dealershipId, vehicleId, vehicleName, section, userInitials, itemName, oldRating, newRating);
  }

  // Get recent daily analytics
  static async getRecentDailyAnalytics(dealershipId: string, days: number = 7): Promise<DailyAnalytics[]> {
    try {
      const result: DailyAnalytics[] = [];
      const today = new Date();
      
      // Generate date range
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        
        // Get events for this date
        const { data: events, error } = await supabase
          .from('analytics_events')
          .select('*')
          .eq('dealership_id', dealershipId)
          .eq('completed_date', dateKey);
        
        if (error) {
          throw error;
        }
        
        // Process events into daily analytics
        const completionsBySection: Record<string, number> = {
          emissions: 0,
          cosmetic: 0,
          mechanical: 0,
          cleaned: 0,
          photos: 0
        };
        
        const completionsByUser: Record<string, number> = {};
        const vehiclesCompleted: string[] = [];
        
        events.forEach(event => {
          // Count by section
          if (completionsBySection[event.section] !== undefined) {
            completionsBySection[event.section]++;
          }
          
          // Count by user
          completionsByUser[event.completed_by] = (completionsByUser[event.completed_by] || 0) + 1;
          
          // Track unique vehicles
          if (!vehiclesCompleted.includes(event.vehicle_id)) {
            vehiclesCompleted.push(event.vehicle_id);
          }
        });
        
        result.push({
          date: dateKey,
          totalCompletions: events.length,
          completionsBySection: completionsBySection as any,
          completionsByUser,
          vehiclesCompleted,
          events: events.map(event => ({
            id: event.id,
            vehicleId: event.vehicle_id,
            vehicleName: event.vehicle_name,
            section: event.section as any,
            sectionName: event.section_name,
            completedBy: event.completed_by,
            completedDate: event.completed_date,
            timestamp: event.created_at,
            itemName: event.item_name || undefined,
            oldRating: event.old_rating || undefined,
            newRating: event.new_rating || undefined
          }))
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error getting daily analytics:', error);
      return [];
    }
  }

  // Get user's recent daily analytics
  static async getUserRecentDailyAnalytics(dealershipId: string, userInitials: string, days: number = 7): Promise<UserDailyAnalytics[]> {
    try {
      const result: UserDailyAnalytics[] = [];
      const today = new Date();
      
      // Generate date range
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        
        // Get events for this date and user
        const { data: events, error } = await supabase
          .from('analytics_events')
          .select('*')
          .eq('dealership_id', dealershipId)
          .eq('completed_date', dateKey)
          .eq('completed_by', userInitials);
        
        if (error) {
          throw error;
        }
        
        // Process events into user daily analytics
        const completionsBySection: Record<string, number> = {
          emissions: 0,
          cosmetic: 0,
          mechanical: 0,
          cleaned: 0,
          photos: 0
        };
        
        const vehiclesWorkedOn: string[] = [];
        
        events.forEach(event => {
          // Count by section
          if (completionsBySection[event.section] !== undefined) {
            completionsBySection[event.section]++;
          }
          
          // Track unique vehicles
          if (!vehiclesWorkedOn.includes(event.vehicle_id)) {
            vehiclesWorkedOn.push(event.vehicle_id);
          }
        });
        
        result.push({
          date: dateKey,
          userInitials,
          totalCompletions: events.length,
          completionsBySection: completionsBySection as any,
          vehiclesWorkedOn,
          events: events.map(event => ({
            id: event.id,
            vehicleId: event.vehicle_id,
            vehicleName: event.vehicle_name,
            section: event.section as any,
            sectionName: event.section_name,
            completedBy: event.completed_by,
            completedDate: event.completed_date,
            timestamp: event.created_at,
            itemName: event.item_name || undefined,
            oldRating: event.old_rating || undefined,
            newRating: event.new_rating || undefined
          }))
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error getting user daily analytics:', error);
      return [];
    }
  }

  // Get all users who have recorded tasks
  static async getAllUsers(dealershipId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('completed_by')
        .eq('dealership_id', dealershipId)
        .order('completed_by');
      
      if (error) {
        throw error;
      }
      
      // Extract unique user initials
      const users = new Set<string>();
      data.forEach(event => users.add(event.completed_by));
      
      return Array.from(users);
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  // Get top performers
  static async getTopPerformers(dealershipId: string, period: 'week' | 'month' = 'week', limit: number = 5): Promise<Array<{userInitials: string, completions: number}>> {
    try {
      const today = new Date();
      let startDate: Date;
      
      if (period === 'week') {
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
      } else {
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 30);
      }
      
      const startDateStr = startDate.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('analytics_events')
        .select('completed_by, count')
        .eq('dealership_id', dealershipId)
        .gte('completed_date', startDateStr)
        .group('completed_by')
        .order('count', { ascending: false })
        .limit(limit);
      
      if (error) {
        throw error;
      }
      
      return data.map(item => ({
        userInitials: item.completed_by,
        completions: parseInt(item.count)
      }));
    } catch (error) {
      console.error('Error getting top performers:', error);
      return [];
    }
  }

  // Helper method to get section display name
  private static getSectionDisplayName(section: CompletionEvent['section']): string {
    const names = {
      emissions: 'Emissions',
      cosmetic: 'Cosmetic',
      mechanical: 'Mechanical',
      cleaned: 'Cleaning',
      photos: 'Photography'
    };
    return names[section];
  }
}