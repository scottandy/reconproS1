import { supabase } from '../lib/supabase';
import { Todo, TodoCategory, TodoSettings } from '../types/todo';

export class SupabaseTodoManager {
  static async initializeDefaultTodos(dealershipId: string): Promise<void> {
    try {
      // Check if todos already exist
      const { count, error: countError } = await supabase
        .from('todos')
        .select('id', { count: 'exact', head: true })
        .eq('dealership_id', dealershipId);

      if (countError) {
        throw countError;
      }

      if (count && count > 0) {
        return; // Todos already exist
      }

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const defaultTodos = [
        {
          dealership_id: dealershipId,
          title: 'Complete emissions inspection',
          description: 'Perform emissions testing on newly acquired vehicles',
          priority: 'high',
          status: 'pending',
          category: 'inspection',
          assigned_to: 'MW', // Mike Wilson
          assigned_by: 'JS', // John Smith
          due_date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
          due_time: '14:00',
          vehicle_id: null, // Will be updated with real vehicle IDs
          vehicle_name: '2023 Honda Accord',
          tags: ['emissions', 'inspection', 'priority'],
          notes: 'Check OBD2 codes before testing'
        },
        {
          dealership_id: dealershipId,
          title: 'Order brake pads for Toyota Corolla',
          description: 'Front brake pads need replacement',
          priority: 'medium',
          status: 'pending',
          category: 'parts-order',
          assigned_to: 'SJ', // Sarah Johnson
          assigned_by: 'JS',
          due_date: tomorrow.toISOString().split('T')[0],
          due_time: null,
          vehicle_id: null,
          vehicle_name: '2019 Toyota Corolla',
          tags: ['parts', 'brakes', 'urgent']
        },
        {
          dealership_id: dealershipId,
          title: 'Schedule professional photography',
          description: 'Book photographer for completed vehicles',
          priority: 'medium',
          status: 'in-progress',
          category: 'photography',
          assigned_to: 'JS',
          assigned_by: 'JS',
          due_date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
          due_time: null,
          vehicle_id: null,
          vehicle_name: null,
          tags: ['photography', 'marketing'],
          notes: 'Contact Elite Photography Services'
        },
        {
          dealership_id: dealershipId,
          title: 'Follow up with customer on trade-in',
          description: 'Call customer about pending trade-in paperwork',
          priority: 'high',
          status: 'pending',
          category: 'customer-contact',
          assigned_to: 'SJ',
          assigned_by: 'JS',
          due_date: today.toISOString().split('T')[0],
          due_time: '10:00',
          vehicle_id: null,
          vehicle_name: null,
          tags: ['customer', 'paperwork', 'trade-in']
        },
        {
          dealership_id: dealershipId,
          title: 'Weekly team meeting',
          description: 'Review progress and assign new tasks',
          priority: 'medium',
          status: 'pending',
          category: 'general',
          assigned_to: 'ALL',
          assigned_by: 'JS',
          due_date: nextWeek.toISOString().split('T')[0],
          due_time: '09:00',
          vehicle_id: null,
          vehicle_name: null,
          is_recurring: true,
          recurring_pattern: 'weekly',
          tags: ['meeting', 'team', 'planning']
        }
      ];

      const { error } = await supabase
        .from('todos')
        .insert(defaultTodos);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error initializing default todos:', error);
    }
  }

  static async getTodos(dealershipId: string): Promise<Todo[]> {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('dealership_id', dealershipId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data.map(todo => ({
        id: todo.id,
        title: todo.title,
        description: todo.description || undefined,
        priority: todo.priority,
        status: todo.status,
        category: todo.category as TodoCategory,
        assignedTo: todo.assigned_to,
        assignedBy: todo.assigned_by,
        dueDate: todo.due_date || undefined,
        dueTime: todo.due_time || undefined,
        vehicleId: todo.vehicle_id || undefined,
        vehicleName: todo.vehicle_name || undefined,
        tags: todo.tags || undefined,
        notes: todo.notes || undefined,
        completedAt: todo.completed_at || undefined,
        completedBy: todo.completed_by || undefined,
        isRecurring: todo.is_recurring,
        recurringPattern: todo.recurring_pattern || undefined,
        createdAt: todo.created_at,
        updatedAt: todo.updated_at
      }));
    } catch (error) {
      console.error('Error getting todos:', error);
      return [];
    }
  }

  static async addTodo(dealershipId: string, todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Todo | null> {
    try {
      const { data, error } = await supabase
        .from('todos')
        .insert({
          dealership_id: dealershipId,
          title: todoData.title,
          description: todoData.description || null,
          priority: todoData.priority,
          status: todoData.status || 'pending',
          category: todoData.category,
          assigned_to: todoData.assignedTo,
          assigned_by: todoData.assignedBy,
          due_date: todoData.dueDate || null,
          due_time: todoData.dueTime || null,
          vehicle_id: todoData.vehicleId || null,
          vehicle_name: todoData.vehicleName || null,
          tags: todoData.tags || null,
          notes: todoData.notes || null,
          completed_at: todoData.completedAt || null,
          completed_by: todoData.completedBy || null,
          is_recurring: todoData.isRecurring || false,
          recurring_pattern: todoData.recurringPattern || null
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        id: data.id,
        title: data.title,
        description: data.description || undefined,
        priority: data.priority,
        status: data.status,
        category: data.category as TodoCategory,
        assignedTo: data.assigned_to,
        assignedBy: data.assigned_by,
        dueDate: data.due_date || undefined,
        dueTime: data.due_time || undefined,
        vehicleId: data.vehicle_id || undefined,
        vehicleName: data.vehicle_name || undefined,
        tags: data.tags || undefined,
        notes: data.notes || undefined,
        completedAt: data.completed_at || undefined,
        completedBy: data.completed_by || undefined,
        isRecurring: data.is_recurring,
        recurringPattern: data.recurring_pattern || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error adding todo:', error);
      return null;
    }
  }

  static async updateTodo(dealershipId: string, todoId: string, updates: Partial<Todo>): Promise<Todo | null> {
    try {
      const dbUpdates: any = {};

      // Map application properties to database columns
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo;
      if (updates.assignedBy !== undefined) dbUpdates.assigned_by = updates.assignedBy;
      if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
      if (updates.dueTime !== undefined) dbUpdates.due_time = updates.dueTime;
      if (updates.vehicleId !== undefined) dbUpdates.vehicle_id = updates.vehicleId;
      if (updates.vehicleName !== undefined) dbUpdates.vehicle_name = updates.vehicleName;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;
      if (updates.completedBy !== undefined) dbUpdates.completed_by = updates.completedBy;
      if (updates.isRecurring !== undefined) dbUpdates.is_recurring = updates.isRecurring;
      if (updates.recurringPattern !== undefined) dbUpdates.recurring_pattern = updates.recurringPattern;

      // Mark completion time if status changed to completed
      if (updates.status === 'completed' && !dbUpdates.completed_at) {
        dbUpdates.completed_at = new Date().toISOString();
        if (!dbUpdates.completed_by && updates.assignedTo) {
          dbUpdates.completed_by = updates.assignedTo;
        }
      }

      // Add updated timestamp
      dbUpdates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('todos')
        .update(dbUpdates)
        .eq('id', todoId)
        .eq('dealership_id', dealershipId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        id: data.id,
        title: data.title,
        description: data.description || undefined,
        priority: data.priority,
        status: data.status,
        category: data.category as TodoCategory,
        assignedTo: data.assigned_to,
        assignedBy: data.assigned_by,
        dueDate: data.due_date || undefined,
        dueTime: data.due_time || undefined,
        vehicleId: data.vehicle_id || undefined,
        vehicleName: data.vehicle_name || undefined,
        tags: data.tags || undefined,
        notes: data.notes || undefined,
        completedAt: data.completed_at || undefined,
        completedBy: data.completed_by || undefined,
        isRecurring: data.is_recurring,
        recurringPattern: data.recurring_pattern || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error updating todo:', error);
      return null;
    }
  }

  static async deleteTodo(dealershipId: string, todoId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', todoId)
        .eq('dealership_id', dealershipId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting todo:', error);
      return false;
    }
  }

  static async searchTodos(dealershipId: string, query: string): Promise<Todo[]> {
    try {
      const searchTerm = `%${query.toLowerCase()}%`;

      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('dealership_id', dealershipId)
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},vehicle_name.ilike.${searchTerm},notes.ilike.${searchTerm}`);

      if (error) {
        throw error;
      }

      return data.map(todo => ({
        id: todo.id,
        title: todo.title,
        description: todo.description || undefined,
        priority: todo.priority,
        status: todo.status,
        category: todo.category as TodoCategory,
        assignedTo: todo.assigned_to,
        assignedBy: todo.assigned_by,
        dueDate: todo.due_date || undefined,
        dueTime: todo.due_time || undefined,
        vehicleId: todo.vehicle_id || undefined,
        vehicleName: todo.vehicle_name || undefined,
        tags: todo.tags || undefined,
        notes: todo.notes || undefined,
        completedAt: todo.completed_at || undefined,
        completedBy: todo.completed_by || undefined,
        isRecurring: todo.is_recurring,
        recurringPattern: todo.recurring_pattern || undefined,
        createdAt: todo.created_at,
        updatedAt: todo.updated_at
      }));
    } catch (error) {
      console.error('Error searching todos:', error);
      return [];
    }
  }

  static async getTodoStats(dealershipId: string): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
  }> {
    try {
      // Get total count
      const { count: total, error: totalError } = await supabase
        .from('todos')
        .select('id', { count: 'exact', head: true })
        .eq('dealership_id', dealershipId);

      if (totalError) {
        throw totalError;
      }

      // Get pending count
      const { count: pending, error: pendingError } = await supabase
        .from('todos')
        .select('id', { count: 'exact', head: true })
        .eq('dealership_id', dealershipId)
        .eq('status', 'pending');

      if (pendingError) {
        throw pendingError;
      }

      // Get in-progress count
      const { count: inProgress, error: inProgressError } = await supabase
        .from('todos')
        .select('id', { count: 'exact', head: true })
        .eq('dealership_id', dealershipId)
        .eq('status', 'in-progress');

      if (inProgressError) {
        throw inProgressError;
      }

      // Get completed count
      const { count: completed, error: completedError } = await supabase
        .from('todos')
        .select('id', { count: 'exact', head: true })
        .eq('dealership_id', dealershipId)
        .eq('status', 'completed');

      if (completedError) {
        throw completedError;
      }

      // Get overdue count
      const today = new Date().toISOString().split('T')[0];
      const { count: overdue, error: overdueError } = await supabase
        .from('todos')
        .select('id', { count: 'exact', head: true })
        .eq('dealership_id', dealershipId)
        .lt('due_date', today)
        .not('status', 'eq', 'completed');

      if (overdueError) {
        throw overdueError;
      }

      return {
        total: total || 0,
        pending: pending || 0,
        inProgress: inProgress || 0,
        completed: completed || 0,
        overdue: overdue || 0
      };
    } catch (error) {
      console.error('Error getting todo stats:', error);
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0
      };
    }
  }

  static formatDueDate(dueDate: string, dueTime?: string): string {
    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    let dateStr = '';
    if (isToday) {
      dateStr = 'Today';
    } else if (isTomorrow) {
      dateStr = 'Tomorrow';
    } else {
      dateStr = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
    
    if (dueTime) {
      const [hours, minutes] = dueTime.split(':').map(Number);
      const timeStr = new Date(0, 0, 0, hours, minutes).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      return `${dateStr} at ${timeStr}`;
    }
    
    return dateStr;
  }
}