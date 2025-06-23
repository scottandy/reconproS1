import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SupabaseInspectionManager } from '../utils/supabaseInspection';
import { InspectionSettings as InspectionSettingsType, InspectionSection, InspectionItem, RatingLabel } from '../types/inspectionSettings';
import { 
  ClipboardList, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  MoveUp, 
  MoveDown, 
  Eye, 
  EyeOff, 
  Check, 
  RotateCcw,
  FileText,
  Download,
  Upload,
  Star,
  CheckCircle,
  AlertTriangle,
  Circle,
  Palette,
  Sliders
} from 'lucide-react';

const InspectionSettings: React.FC = () => {
  const { dealership, user } = useAuth();
  const [settings, setSettings] = useState<InspectionSettingsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sections' | 'ratings' | 'pdf' | 'global'>('sections');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingRatingKey, setEditingRatingKey] = useState<'great' | 'fair' | 'needs-attention' | 'not-checked' | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  
  // Section editing state
  const [sectionForm, setSectionForm] = useState({
    key: '',
    label: '',
    description: '',
    icon: '',
    color: '',
    isActive: true,
    isCustomerVisible: true,
    order: 0
  });
  
  // Item editing state
  const [itemForm, setItemForm] = useState({
    label: '',
    description: '',
    isRequired: true,
    order: 0,
    isActive: true
  });
  
  // Rating editing state
  const [ratingForm, setRatingForm] = useState({
    label: '',
    description: '',
    color: '',
    icon: ''
  });

  useEffect(() => {
    if (dealership) {
      loadSettings();
    }
  }, [dealership]);

  const loadSettings = async () => {
    if (!dealership) return;
    
    setIsLoading(true);
    try {
      // Initialize default settings if needed
      await SupabaseInspectionManager.initializeDefaultSettings(dealership.id);
      
      // Load settings
      const inspectionSettings = await SupabaseInspectionManager.getSettings(dealership.id);
      setSettings(inspectionSettings);
    } catch (error) {
      console.error('Error loading inspection settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!dealership || !settings) return;
    
    try {
      await SupabaseInspectionManager.saveSettings(dealership.id, settings);
      setHasChanges(false);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    }
  };

  const handleResetToDefaults = async () => {
    if (!dealership) return;
    
    try {
      await SupabaseInspectionManager.initializeDefaultSettings(dealership.id);
      await loadSettings();
      setShowConfirmReset(false);
      setHasChanges(false);
    } catch (error) {
      console.error('Error resetting settings:', error);
      alert('Error resetting settings. Please try again.');
    }
  };

  // Section management
  const handleAddSection = () => {
    if (!settings) return;
    
    const newSection: InspectionSection = {
      id: `section-${Date.now()}`,
      key: sectionForm.key,
      label: sectionForm.label,
      description: sectionForm.description || undefined,
      icon: sectionForm.icon,
      color: sectionForm.color,
      isActive: sectionForm.isActive,
      isCustomerVisible: sectionForm.isCustomerVisible,
      order: settings.sections.length + 1,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setSettings({
      ...settings,
      sections: [...settings.sections, newSection]
    });
    
    setSectionForm({
      key: '',
      label: '',
      description: '',
      icon: '',
      color: '',
      isActive: true,
      isCustomerVisible: true,
      order: 0
    });
    
    setHasChanges(true);
  };

  const handleUpdateSection = () => {
    if (!settings || !editingSectionId) return;
    
    const updatedSections = settings.sections.map(section => {
      if (section.id === editingSectionId) {
        return {
          ...section,
          key: sectionForm.key,
          label: sectionForm.label,
          description: sectionForm.description || undefined,
          icon: sectionForm.icon,
          color: sectionForm.color,
          isActive: sectionForm.isActive,
          isCustomerVisible: sectionForm.isCustomerVisible,
          updatedAt: new Date().toISOString()
        };
      }
      return section;
    });
    
    setSettings({
      ...settings,
      sections: updatedSections
    });
    
    setEditingSectionId(null);
    setSectionForm({
      key: '',
      label: '',
      description: '',
      icon: '',
      color: '',
      isActive: true,
      isCustomerVisible: true,
      order: 0
    });
    
    setHasChanges(true);
  };

  const handleDeleteSection = (sectionId: string) => {
    if (!settings) return;
    
    if (window.confirm('Are you sure you want to delete this section? This will also delete all items in this section.')) {
      setSettings({
        ...settings,
        sections: settings.sections.filter(section => section.id !== sectionId)
      });
      
      setHasChanges(true);
    }
  };

  const handleEditSection = (section: InspectionSection) => {
    setSectionForm({
      key: section.key,
      label: section.label,
      description: section.description || '',
      icon: section.icon,
      color: section.color,
      isActive: section.isActive,
      isCustomerVisible: section.isCustomerVisible,
      order: section.order
    });
    
    setEditingSectionId(section.id);
  };

  const handleToggleSectionActive = (sectionId: string) => {
    if (!settings) return;
    
    const updatedSections = settings.sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          isActive: !section.isActive,
          updatedAt: new Date().toISOString()
        };
      }
      return section;
    });
    
    setSettings({
      ...settings,
      sections: updatedSections
    });
    
    setHasChanges(true);
  };

  const handleToggleSectionCustomerVisible = (sectionId: string) => {
    if (!settings) return;
    
    const updatedSections = settings.sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          isCustomerVisible: !section.isCustomerVisible,
          updatedAt: new Date().toISOString()
        };
      }
      return section;
    });
    
    setSettings({
      ...settings,
      sections: updatedSections
    });
    
    setHasChanges(true);
  };

  // Item management
  const handleAddItem = (sectionId: string) => {
    if (!settings) return;
    
    const section = settings.sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const newItem: InspectionItem = {
      id: `item-${Date.now()}`,
      label: itemForm.label,
      description: itemForm.description || undefined,
      isRequired: itemForm.isRequired,
      order: section.items.length + 1,
      isActive: itemForm.isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedSections = settings.sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          items: [...s.items, newItem],
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    });
    
    setSettings({
      ...settings,
      sections: updatedSections
    });
    
    setItemForm({
      label: '',
      description: '',
      isRequired: true,
      order: 0,
      isActive: true
    });
    
    setHasChanges(true);
  };

  const handleUpdateItem = (sectionId: string) => {
    if (!settings || !editingItemId) return;
    
    const updatedSections = settings.sections.map(section => {
      if (section.id === sectionId) {
        const updatedItems = section.items.map(item => {
          if (item.id === editingItemId) {
            return {
              ...item,
              label: itemForm.label,
              description: itemForm.description || undefined,
              isRequired: itemForm.isRequired,
              isActive: itemForm.isActive,
              updatedAt: new Date().toISOString()
            };
          }
          return item;
        });
        
        return {
          ...section,
          items: updatedItems,
          updatedAt: new Date().toISOString()
        };
      }
      return section;
    });
    
    setSettings({
      ...settings,
      sections: updatedSections
    });
    
    setEditingItemId(null);
    setItemForm({
      label: '',
      description: '',
      isRequired: true,
      order: 0,
      isActive: true
    });
    
    setHasChanges(true);
  };

  const handleDeleteItem = (sectionId: string, itemId: string) => {
    if (!settings) return;
    
    if (window.confirm('Are you sure you want to delete this item?')) {
      const updatedSections = settings.sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: section.items.filter(item => item.id !== itemId),
            updatedAt: new Date().toISOString()
          };
        }
        return section;
      });
      
      setSettings({
        ...settings,
        sections: updatedSections
      });
      
      setHasChanges(true);
    }
  };

  const handleEditItem = (sectionId: string, item: InspectionItem) => {
    setItemForm({
      label: item.label,
      description: item.description || '',
      isRequired: item.isRequired,
      order: item.order,
      isActive: item.isActive
    });
    
    setEditingItemId(item.id);
  };

  const handleToggleItemActive = (sectionId: string, itemId: string) => {
    if (!settings) return;
    
    const updatedSections = settings.sections.map(section => {
      if (section.id === sectionId) {
        const updatedItems = section.items.map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              isActive: !item.isActive,
              updatedAt: new Date().toISOString()
            };
          }
          return item;
        });
        
        return {
          ...section,
          items: updatedItems,
          updatedAt: new Date().toISOString()
        };
      }
      return section;
    });
    
    setSettings({
      ...settings,
      sections: updatedSections
    });
    
    setHasChanges(true);
  };

  // Rating management
  const handleEditRating = (rating: RatingLabel) => {
    setRatingForm({
      label: rating.label,
      description: rating.description || '',
      color: rating.color,
      icon: rating.icon || ''
    });
    
    setEditingRatingKey(rating.key);
  };

  const handleUpdateRating = () => {
    if (!settings || !editingRatingKey) return;
    
    const updatedRatingLabels = settings.ratingLabels.map(rating => {
      if (rating.key === editingRatingKey) {
        return {
          ...rating,
          label: ratingForm.label,
          description: ratingForm.description || undefined,
          color: ratingForm.color,
          icon: ratingForm.icon || undefined
        };
      }
      return rating;
    });
    
    setSettings({
      ...settings,
      ratingLabels: updatedRatingLabels
    });
    
    setEditingRatingKey(null);
    setRatingForm({
      label: '',
      description: '',
      color: '',
      icon: ''
    });
    
    setHasChanges(true);
  };

  // PDF settings management
  const handleUpdatePdfSettings = (field: keyof InspectionSettingsType['customerPdfSettings'], value: any) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      customerPdfSettings: {
        ...settings.customerPdfSettings,
        [field]: value
      }
    });
    
    setHasChanges(true);
  };

  // Global settings management
  const handleUpdateGlobalSettings = (field: keyof InspectionSettingsType['globalSettings'], value: any) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      globalSettings: {
        ...settings.globalSettings,
        [field]: value
      }
    });
    
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 text-center">
        <div className="animate-pulse">
          <div className="w-12 h-12 bg-gray-300 rounded-xl mx-auto mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/3 mx-auto mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4 mx-auto"></div>
        </div>
        <p className="text-gray-600 mt-4">Loading inspection settings...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 text-center">
        <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-gray-600">Only administrators can manage inspection settings.</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 text-center">
        <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings Not Found</h3>
        <p className="text-gray-600 mb-4">Unable to load inspection settings.</p>
        <button
          onClick={loadSettings}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Inspection Settings</h2>
              <p className="text-gray-600">Customize inspection checklists and settings</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowConfirmReset(true)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <RotateCcw className="w-4 h-4 inline mr-1" />
              Reset
            </button>
            <button
              onClick={handleSaveSettings}
              disabled={!hasChanges}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 inline mr-1" />
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('sections')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'sections'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Sections & Items
          </button>
          <button
            onClick={() => setActiveTab('ratings')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'ratings'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Star className="w-4 h-4" />
            Rating Labels
          </button>
          <button
            onClick={() => setActiveTab('pdf')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'pdf'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            PDF Settings
          </button>
          <button
            onClick={() => setActiveTab('global')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'global'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            Global Settings
          </button>
        </div>
      </div>

      {/* Sections & Items Tab */}
      {activeTab === 'sections' && (
        <div className="space-y-6">
          {/* Add/Edit Section Form */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingSectionId ? 'Edit Section' : 'Add New Section'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Key *
                </label>
                <input
                  type="text"
                  value={sectionForm.key}
                  onChange={(e) => setSectionForm({ ...sectionForm, key: e.target.value })}
                  placeholder="e.g., emissions, cosmetic, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!!editingSectionId} // Can't change key for existing sections
                />
                {editingSectionId && (
                  <p className="text-xs text-gray-500 mt-1">Section key cannot be changed after creation.</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Label *
                </label>
                <input
                  type="text"
                  value={sectionForm.label}
                  onChange={(e) => setSectionForm({ ...sectionForm, label: e.target.value })}
                  placeholder="e.g., Emissions & Environmental"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={sectionForm.description}
                  onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                  placeholder="Brief description of this section"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon (Emoji or Icon Name)
                </label>
                <input
                  type="text"
                  value={sectionForm.icon}
                  onChange={(e) => setSectionForm({ ...sectionForm, icon: e.target.value })}
                  placeholder="e.g., 🌱 or leaf"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Classes
                </label>
                <input
                  type="text"
                  value={sectionForm.color}
                  onChange={(e) => setSectionForm({ ...sectionForm, color: e.target.value })}
                  placeholder="e.g., bg-green-100 text-green-800 border-green-200"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={sectionForm.isActive}
                    onChange={(e) => setSectionForm({ ...sectionForm, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Active
                </label>
                <p className="text-xs text-gray-500 mt-1">Inactive sections won't appear in inspections.</p>
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={sectionForm.isCustomerVisible}
                    onChange={(e) => setSectionForm({ ...sectionForm, isCustomerVisible: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Visible in Customer PDF
                </label>
                <p className="text-xs text-gray-500 mt-1">Show this section in customer-facing reports.</p>
              </div>
              
              <div className="md:col-span-2 flex gap-3 pt-4">
                {editingSectionId ? (
                  <>
                    <button
                      onClick={handleUpdateSection}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      disabled={!sectionForm.key || !sectionForm.label}
                    >
                      Update Section
                    </button>
                    <button
                      onClick={() => {
                        setEditingSectionId(null);
                        setSectionForm({
                          key: '',
                          label: '',
                          description: '',
                          icon: '',
                          color: '',
                          isActive: true,
                          isCustomerVisible: true,
                          order: 0
                        });
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleAddSection}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={!sectionForm.key || !sectionForm.label}
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Add Section
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sections List */}
          <div className="space-y-4">
            {settings.sections.sort((a, b) => a.order - b.order).map((section) => (
              <div key={section.id} className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
                {/* Section Header */}
                <div className={`p-4 ${section.isActive ? 'bg-gray-50' : 'bg-gray-200'} border-b border-gray-200`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${section.color} rounded-lg flex items-center justify-center`}>
                        <span className="text-lg">{section.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{section.label}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <code className="bg-gray-100 px-1 rounded text-xs">{section.key}</code>
                          {section.description && <span>• {section.description}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSectionActive(section.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          section.isActive
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={section.isActive ? 'Deactivate Section' : 'Activate Section'}
                      >
                        {section.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleToggleSectionCustomerVisible(section.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          section.isCustomerVisible
                            ? 'text-blue-600 hover:bg-blue-50'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={section.isCustomerVisible ? 'Hide from Customer PDF' : 'Show in Customer PDF'}
                      >
                        {section.isCustomerVisible ? <FileText className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleEditSection(section)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Section"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSection(section.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Section"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      section.isActive ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {section.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      section.isCustomerVisible ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {section.isCustomerVisible ? 'Customer Visible' : 'Internal Only'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {section.items.length} items • {section.items.filter(item => item.isActive).length} active
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="p-4">
                  <h5 className="font-medium text-gray-900 mb-3">Inspection Items</h5>
                  
                  {section.items.length > 0 ? (
                    <div className="space-y-2 mb-4">
                      {section.items.sort((a, b) => a.order - b.order).map((item) => (
                        <div key={item.id} className={`p-3 rounded-lg border ${item.isActive ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-300'}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">{item.label}</div>
                              {item.description && (
                                <div className="text-sm text-gray-600">{item.description}</div>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                {item.isRequired && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                    Required
                                  </span>
                                )}
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                  item.isActive ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-800 border border-gray-200'
                                }`}>
                                  {item.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleItemActive(section.id, item.id)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  item.isActive
                                    ? 'text-green-600 hover:bg-green-50'
                                    : 'text-gray-400 hover:bg-gray-100'
                                }`}
                                title={item.isActive ? 'Deactivate Item' : 'Activate Item'}
                              >
                                {item.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => handleEditItem(section.id, item)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Item"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(section.id, item.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-gray-50 rounded-lg mb-4">
                      <p className="text-gray-500">No items in this section yet.</p>
                    </div>
                  )}

                  {/* Add/Edit Item Form */}
                  <div className="border-t border-gray-200 pt-4">
                    <h6 className="font-medium text-gray-900 mb-3">
                      {editingItemId ? 'Edit Item' : 'Add New Item'}
                    </h6>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Item Label *
                        </label>
                        <input
                          type="text"
                          value={itemForm.label}
                          onChange={(e) => setItemForm({ ...itemForm, label: e.target.value })}
                          placeholder="e.g., Pass Emissions Test"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={itemForm.description}
                          onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                          placeholder="Brief description of this item"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <input
                            type="checkbox"
                            checked={itemForm.isRequired}
                            onChange={(e) => setItemForm({ ...itemForm, isRequired: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          Required
                        </label>
                        
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <input
                            type="checkbox"
                            checked={itemForm.isActive}
                            onChange={(e) => setItemForm({ ...itemForm, isActive: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          Active
                        </label>
                      </div>
                      
                      <div className="flex gap-3 pt-2">
                        {editingItemId ? (
                          <>
                            <button
                              onClick={() => handleUpdateItem(section.id)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              disabled={!itemForm.label}
                            >
                              Update Item
                            </button>
                            <button
                              onClick={() => {
                                setEditingItemId(null);
                                setItemForm({
                                  label: '',
                                  description: '',
                                  isRequired: true,
                                  order: 0,
                                  isActive: true
                                });
                              }}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleAddItem(section.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            disabled={!itemForm.label}
                          >
                            <Plus className="w-4 h-4 inline mr-1" />
                            Add Item
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {settings.sections.length === 0 && (
              <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-8 text-center">
                <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sections Found</h3>
                <p className="text-gray-600 mb-4">Add your first inspection section to get started.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rating Labels Tab */}
      {activeTab === 'ratings' && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Rating Labels</h3>
          
          <div className="space-y-6">
            {settings.ratingLabels.map((rating) => (
              <div key={rating.key} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${rating.color} rounded-lg flex items-center justify-center`}>
                      {rating.key === 'great' && <Star className="w-5 h-5" />}
                      {rating.key === 'fair' && <CheckCircle className="w-5 h-5" />}
                      {rating.key === 'needs-attention' && <AlertTriangle className="w-5 h-5" />}
                      {rating.key === 'not-checked' && <Circle className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{rating.label}</h4>
                      <p className="text-sm text-gray-600">Key: {rating.key}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleEditRating(rating)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Rating"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                
                {editingRatingKey === rating.key ? (
                  <div className="space-y-3 border-t border-gray-200 pt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Label *
                      </label>
                      <input
                        type="text"
                        value={ratingForm.label}
                        onChange={(e) => setRatingForm({ ...ratingForm, label: e.target.value })}
                        placeholder="e.g., Excellent"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={ratingForm.description}
                        onChange={(e) => setRatingForm({ ...ratingForm, description: e.target.value })}
                        placeholder="Brief description of this rating"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color Classes *
                      </label>
                      <input
                        type="text"
                        value={ratingForm.color}
                        onChange={(e) => setRatingForm({ ...ratingForm, color: e.target.value })}
                        placeholder="e.g., bg-emerald-600 text-white ring-2 ring-emerald-300"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Icon (Optional)
                      </label>
                      <input
                        type="text"
                        value={ratingForm.icon}
                        onChange={(e) => setRatingForm({ ...ratingForm, icon: e.target.value })}
                        placeholder="e.g., ⭐ or star"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleUpdateRating}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        disabled={!ratingForm.label || !ratingForm.color}
                      >
                        Update Rating
                      </button>
                      <button
                        onClick={() => {
                          setEditingRatingKey(null);
                          setRatingForm({
                            label: '',
                            description: '',
                            color: '',
                            icon: ''
                          });
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700">Description</h5>
                      <p className="text-sm text-gray-600">{rating.description || 'No description'}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-700">Color</h5>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{rating.color}</code>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PDF Settings Tab */}
      {activeTab === 'pdf' && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Customer PDF Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <h4 className="font-medium text-gray-900">Include Vehicle Photos</h4>
                <p className="text-sm text-gray-600">Add vehicle photos to the PDF report</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.customerPdfSettings.includeVehiclePhotos}
                  onChange={(e) => handleUpdatePdfSettings('includeVehiclePhotos', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <h4 className="font-medium text-gray-900">Include Customer Comments</h4>
                <p className="text-sm text-gray-600">Add customer comments to the PDF report</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.customerPdfSettings.includeCustomerComments}
                  onChange={(e) => handleUpdatePdfSettings('includeCustomerComments', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <h4 className="font-medium text-gray-900">Show Detailed Ratings</h4>
                <p className="text-sm text-gray-600">Include detailed rating information for each item</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.customerPdfSettings.showDetailedRatings}
                  onChange={(e) => handleUpdatePdfSettings('showDetailedRatings', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Footer Text
              </label>
              <textarea
                value={settings.customerPdfSettings.footerText || ''}
                onChange={(e) => handleUpdatePdfSettings('footerText', e.target.value)}
                placeholder="Custom footer text for PDF reports"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Global Settings Tab */}
      {activeTab === 'global' && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Global Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <h4 className="font-medium text-gray-900">Require User Initials</h4>
                <p className="text-sm text-gray-600">Require users to enter their initials for each action</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.globalSettings.requireUserInitials}
                  onChange={(e) => handleUpdateGlobalSettings('requireUserInitials', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <h4 className="font-medium text-gray-900">Allow Skip Items</h4>
                <p className="text-sm text-gray-600">Allow users to skip non-required inspection items</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.globalSettings.allowSkipItems}
                  onChange={(e) => handleUpdateGlobalSettings('allowSkipItems', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <h4 className="font-medium text-gray-900">Auto-Save Progress</h4>
                <p className="text-sm text-gray-600">Automatically save inspection progress</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.globalSettings.autoSaveProgress}
                  onChange={(e) => handleUpdateGlobalSettings('autoSaveProgress', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <h4 className="font-medium text-gray-900">Show Progress Percentage</h4>
                <p className="text-sm text-gray-600">Display completion percentage for each section</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.globalSettings.showProgressPercentage}
                  onChange={(e) => handleUpdateGlobalSettings('showProgressPercentage', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <h4 className="font-medium text-gray-900">Enable Team Notes</h4>
                <p className="text-sm text-gray-600">Allow team members to add notes to vehicles</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.globalSettings.enableTeamNotes}
                  onChange={(e) => handleUpdateGlobalSettings('enableTeamNotes', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Reset to Defaults?</h3>
            <p className="text-gray-600 mb-6">
              This will reset all inspection settings to their default values. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleResetToDefaults}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reset Settings
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionSettings;