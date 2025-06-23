import { supabase } from '../lib/supabase';
import { User, Dealership, LoginCredentials, RegisterDealershipData, RegisterUserData } from '../types/auth';

export class SupabaseAuthManager {
  // Initialize demo data in Supabase
  static async initializeDemoData(): Promise<void> {
    try {
      // Check if demo data already exists
      const { data: existingDealerships } = await supabase
        .from('dealerships')
        .select('id')
        .limit(1);

      if (existingDealerships && existingDealerships.length > 0) {
        console.log('✅ Demo data already exists in Supabase');
        return;
      }

      console.log('🔧 Initializing demo data in Supabase...');

      // Create demo dealerships
      const demoDealerships = [
        {
          id: 'demo-dealership-1',
          name: 'Premier Auto Group',
          address: '123 Main Street',
          city: 'Springfield',
          state: 'IL',
          zip_code: '62701',
          phone: '(555) 123-4567',
          email: 'info@premierauto.com',
          website: 'https://premierauto.com',
          is_active: true,
          subscription_plan: 'premium' as const,
          max_users: 50
        },
        {
          id: 'demo-dealership-2',
          name: 'City Motors',
          address: '456 Oak Avenue',
          city: 'Chicago',
          state: 'IL',
          zip_code: '60601',
          phone: '(555) 987-6543',
          email: 'contact@citymotors.com',
          website: null,
          is_active: true,
          subscription_plan: 'basic' as const,
          max_users: 10
        }
      ];

      const { error: dealershipError } = await supabase
        .from('dealerships')
        .insert(demoDealerships);

      if (dealershipError) {
        console.error('Error creating demo dealerships:', dealershipError);
        return;
      }

      // Create demo users
      const demoUsers = [
        {
          id: 'user-1',
          email: 'admin@premierauto.com',
          first_name: 'John',
          last_name: 'Smith',
          initials: 'JS',
          role: 'admin' as const,
          dealership_id: 'demo-dealership-1',
          is_active: true
        },
        {
          id: 'user-2',
          email: 'manager@premierauto.com',
          first_name: 'Sarah',
          last_name: 'Johnson',
          initials: 'SJ',
          role: 'manager' as const,
          dealership_id: 'demo-dealership-1',
          is_active: true
        },
        {
          id: 'user-3',
          email: 'tech@premierauto.com',
          first_name: 'Mike',
          last_name: 'Wilson',
          initials: 'MW',
          role: 'technician' as const,
          dealership_id: 'demo-dealership-1',
          is_active: true
        },
        {
          id: 'user-4',
          email: 'admin@citymotors.com',
          first_name: 'Lisa',
          last_name: 'Davis',
          initials: 'LD',
          role: 'admin' as const,
          dealership_id: 'demo-dealership-2',
          is_active: true
        },
        {
          id: 'user-5',
          email: 'sales@citymotors.com',
          first_name: 'Tom',
          last_name: 'Brown',
          initials: 'TB',
          role: 'sales' as const,
          dealership_id: 'demo-dealership-2',
          is_active: true
        }
      ];

      const { error: userError } = await supabase
        .from('users')
        .insert(demoUsers);

      if (userError) {
        console.error('Error creating demo users:', userError);
        return;
      }

      console.log('✅ Demo data initialized in Supabase');
    } catch (error) {
      console.error('Error initializing demo data:', error);
    }
  }

  static async login(credentials: LoginCredentials): Promise<{ user: User; dealership: Dealership }> {
    console.log('🔐 Supabase login attempt for:', credentials.email);

    try {
      // Find user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', credentials.email.toLowerCase())
        .eq('is_active', true)
        .single();

      if (userError || !userData) {
        console.log('❌ User not found for email:', credentials.email);
        throw new Error('Invalid email or password');
      }

      console.log('✅ User found:', userData);

      // Find dealership
      const { data: dealershipData, error: dealershipError } = await supabase
        .from('dealerships')
        .select('*')
        .eq('id', userData.dealership_id)
        .eq('is_active', true)
        .single();

      if (dealershipError || !dealershipData) {
        console.log('❌ Dealership not found for ID:', userData.dealership_id);
        throw new Error('Dealership not found or inactive');
      }

      console.log('✅ Dealership found:', dealershipData);

      // Convert database format to application format
      const user: User = {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        initials: userData.initials,
        role: userData.role,
        dealershipId: userData.dealership_id,
        isActive: userData.is_active,
        lastLogin: userData.last_login,
        createdAt: userData.created_at
      };

      const dealership: Dealership = {
        id: dealershipData.id,
        name: dealershipData.name,
        address: dealershipData.address,
        city: dealershipData.city,
        state: dealershipData.state,
        zipCode: dealershipData.zip_code,
        phone: dealershipData.phone,
        email: dealershipData.email,
        website: dealershipData.website,
        isActive: dealershipData.is_active,
        subscriptionPlan: dealershipData.subscription_plan,
        createdAt: dealershipData.created_at,
        settings: {
          allowUserRegistration: true,
          requireApproval: false,
          maxUsers: dealershipData.max_users,
          features: {
            analytics: dealershipData.subscription_plan !== 'basic',
            multiLocation: dealershipData.subscription_plan !== 'basic',
            customReports: dealershipData.subscription_plan === 'enterprise',
            apiAccess: dealershipData.subscription_plan === 'enterprise'
          }
        }
      };

      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userData.id);

      // Store session in localStorage for compatibility
      const session = { userId: user.id, dealershipId: dealership.id };
      localStorage.setItem('currentSession', JSON.stringify(session));

      console.log('🎉 Supabase login successful!');
      return { user, dealership };
    } catch (error) {
      console.error('Supabase login error:', error);
      throw error;
    }
  }

  static logout(): void {
    localStorage.removeItem('currentSession');
  }

  static async getCurrentSession(): Promise<{ user: User; dealership: Dealership } | null> {
    const sessionData = localStorage.getItem('currentSession');
    if (!sessionData) return null;

    try {
      const session = JSON.parse(sessionData);
      
      // Get user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.userId)
        .eq('is_active', true)
        .single();

      if (userError || !userData) return null;

      // Get dealership data
      const { data: dealershipData, error: dealershipError } = await supabase
        .from('dealerships')
        .select('*')
        .eq('id', session.dealershipId)
        .eq('is_active', true)
        .single();

      if (dealershipError || !dealershipData) return null;

      // Convert to application format
      const user: User = {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        initials: userData.initials,
        role: userData.role,
        dealershipId: userData.dealership_id,
        isActive: userData.is_active,
        lastLogin: userData.last_login,
        createdAt: userData.created_at
      };

      const dealership: Dealership = {
        id: dealershipData.id,
        name: dealershipData.name,
        address: dealershipData.address,
        city: dealershipData.city,
        state: dealershipData.state,
        zipCode: dealershipData.zip_code,
        phone: dealershipData.phone,
        email: dealershipData.email,
        website: dealershipData.website,
        isActive: dealershipData.is_active,
        subscriptionPlan: dealershipData.subscription_plan,
        createdAt: dealershipData.created_at,
        settings: {
          allowUserRegistration: true,
          requireApproval: false,
          maxUsers: dealershipData.max_users,
          features: {
            analytics: dealershipData.subscription_plan !== 'basic',
            multiLocation: dealershipData.subscription_plan !== 'basic',
            customReports: dealershipData.subscription_plan === 'enterprise',
            apiAccess: dealershipData.subscription_plan === 'enterprise'
          }
        }
      };

      return { user, dealership };
    } catch (error) {
      console.error('Error parsing session:', error);
      return null;
    }
  }

  static async registerDealership(data: RegisterDealershipData): Promise<{ user: User; dealership: Dealership }> {
    try {
      // Check if dealership email already exists
      const { data: existingDealership } = await supabase
        .from('dealerships')
        .select('id')
        .eq('email', data.dealershipEmail.toLowerCase())
        .single();

      if (existingDealership) {
        throw new Error('A dealership with this email already exists');
      }

      // Check if user email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', data.email.toLowerCase())
        .single();

      if (existingUser) {
        throw new Error('A user with this email already exists');
      }

      // Create dealership
      const dealershipId = `dealership-${Date.now()}`;
      const { error: dealershipError } = await supabase
        .from('dealerships')
        .insert({
          id: dealershipId,
          name: data.dealershipName,
          address: data.address,
          city: data.city,
          state: data.state,
          zip_code: data.zipCode,
          phone: data.phone,
          email: data.dealershipEmail.toLowerCase(),
          website: data.website || null,
          is_active: true,
          subscription_plan: 'basic',
          max_users: 10
        });

      if (dealershipError) {
        throw dealershipError;
      }

      // Create admin user
      const userId = `user-${Date.now()}`;
      const initials = `${data.firstName.charAt(0)}${data.lastName.charAt(0)}`.toUpperCase();
      
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: data.email.toLowerCase(),
          first_name: data.firstName,
          last_name: data.lastName,
          initials: initials,
          role: 'admin',
          dealership_id: dealershipId,
          is_active: true
        });

      if (userError) {
        throw userError;
      }

      // Get the created dealership and user
      const { data: newDealership } = await supabase
        .from('dealerships')
        .select('*')
        .eq('id', dealershipId)
        .single();

      const { data: newUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!newDealership || !newUser) {
        throw new Error('Failed to retrieve created dealership or user');
      }

      // Convert to application format
      const dealership: Dealership = {
        id: newDealership.id,
        name: newDealership.name,
        address: newDealership.address,
        city: newDealership.city,
        state: newDealership.state,
        zipCode: newDealership.zip_code,
        phone: newDealership.phone,
        email: newDealership.email,
        website: newDealership.website,
        isActive: newDealership.is_active,
        subscriptionPlan: newDealership.subscription_plan,
        createdAt: newDealership.created_at,
        settings: {
          allowUserRegistration: true,
          requireApproval: false,
          maxUsers: newDealership.max_users,
          features: {
            analytics: false,
            multiLocation: false,
            customReports: false,
            apiAccess: false
          }
        }
      };

      const user: User = {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        initials: newUser.initials,
        role: newUser.role,
        dealershipId: newUser.dealership_id,
        isActive: newUser.is_active,
        lastLogin: newUser.last_login,
        createdAt: newUser.created_at
      };

      return { user, dealership };
    } catch (error) {
      console.error('Error registering dealership:', error);
      throw error;
    }
  }

  static async registerUser(data: RegisterUserData, dealershipId: string): Promise<User> {
    try {
      // Check if dealership exists
      const { data: dealership, error: dealershipError } = await supabase
        .from('dealerships')
        .select('*')
        .eq('id', dealershipId)
        .eq('is_active', true)
        .single();

      if (dealershipError || !dealership) {
        throw new Error('Dealership not found');
      }

      // Check user limits
      const { count, error: countError } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('dealership_id', dealershipId)
        .eq('is_active', true);

      if (countError) {
        throw countError;
      }

      if (count && count >= dealership.max_users) {
        throw new Error('Maximum number of users reached for this dealership');
      }

      // Check if user email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', data.email.toLowerCase())
        .single();

      if (existingUser) {
        throw new Error('A user with this email already exists');
      }

      // Create user
      const userId = `user-${Date.now()}`;
      const initials = `${data.firstName.charAt(0)}${data.lastName.charAt(0)}`.toUpperCase();
      
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: data.email.toLowerCase(),
          first_name: data.firstName,
          last_name: data.lastName,
          initials: initials,
          role: data.role,
          dealership_id: dealershipId,
          is_active: true
        });

      if (userError) {
        throw userError;
      }

      // Get the created user
      const { data: newUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!newUser) {
        throw new Error('Failed to retrieve created user');
      }

      // Convert to application format
      const user: User = {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        initials: newUser.initials,
        role: newUser.role,
        dealershipId: newUser.dealership_id,
        isActive: newUser.is_active,
        lastLogin: newUser.last_login,
        createdAt: newUser.created_at
      };

      return user;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  static async getDealershipUsers(dealershipId: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('dealership_id', dealershipId)
        .eq('is_active', true);

      if (error) {
        throw error;
      }

      // Convert to application format
      return data.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        initials: user.initials,
        role: user.role,
        dealershipId: user.dealership_id,
        isActive: user.is_active,
        lastLogin: user.last_login,
        createdAt: user.created_at
      }));
    } catch (error) {
      console.error('Error getting dealership users:', error);
      return [];
    }
  }

  static async updateUser(user: User): Promise<void> {
    try {
      await supabase
        .from('users')
        .update({
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          initials: user.initials,
          role: user.role,
          dealership_id: user.dealershipId,
          is_active: user.isActive,
          last_login: user.lastLogin,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async deactivateUser(userId: string): Promise<void> {
    try {
      await supabase
        .from('users')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  }
}