export interface Location {
  id: string;
  name: string;
  type: LocationType;
  description?: string;
  capacity?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type LocationType = 
  | 'on-site'
  | 'off-site'
  | 'display'
  | 'service'
  | 'test-drive'
  | 'demo'
  | 'in-transit'
  | 'storage'
  | 'custom';

export interface LocationSettings {
  defaultLocationType: LocationType;
  allowCustomLocations: boolean;
  requireLocationForVehicles: boolean;
  autoAssignLocation: boolean;
  locationCapacityTracking: boolean;
}

export const LOCATION_TYPE_CONFIGS = {
  'on-site': {
    label: 'On-Site',
    description: 'Main dealership lot',
    color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
    icon: '🅿️'
  },
  'off-site': {
    label: 'Off-Site',
    description: 'Secondary or remote location',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
    icon: '🏢'
  },
  'display': {
    label: 'Display',
    description: 'Showroom or display area',
    color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
    icon: '🏪'
  },
  'service': {
    label: 'Service',
    description: 'Service department',
    color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
    icon: '🔧'
  },
  'test-drive': {
    label: 'Test Drive',
    description: 'Out for test drive',
    color: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
    icon: '🚗'
  },
  'demo': {
    label: 'Demo',
    description: 'Demo vehicles',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700',
    icon: '🎯'
  },
  'in-transit': {
    label: 'In Transit',
    description: 'Being transported',
    color: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
    icon: '🚚'
  },
  'storage': {
    label: 'Storage',
    description: 'Long-term storage',
    color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700/30 dark:text-gray-300 dark:border-gray-600',
    icon: '🏭'
  },
  'custom': {
    label: 'Custom',
    description: 'Custom location type',
    color: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-700/30 dark:text-slate-300 dark:border-slate-600',
    icon: '📍'
  }
} as const;