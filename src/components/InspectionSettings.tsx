import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SupabaseInspectionManager } from '../utils/supabaseInspection';
import { InspectionSettings as InspectionSettingsType, InspectionSection, InspectionItem, RatingLabel } from '../types/inspectionSettings';
import { 
  ClipboardList, 
  Plus, 
  Save, 
  Trash2, 
  Edit3, 
  X, 
  Check, 
  ArrowUp, 
  ArrowDown,
  Settings,
  Eye,
  EyeOff,
  FileText,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  Star,
  CheckCircle,
  Circle,
  Palette
} from 'lucide-react';

const InspectionSettings: React.FC = () => {
  const { dealership } = useAuth();
  const [settings, setSettings] = useState<InspectionSettingsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sections' | 'ratings' | 'pdf' | 'global'>('sections');
  const [editingSection, setEditingSection] = useState<InspectionSection | null>(null);
  const [editingItem, setEditingItem] = useState<{ sectionId: string; item: InspectionItem } | null>(null);
  const [editingRating, setEditingRating] = useState<RatingLabel | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

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
      const loadedSettings = await SupabaseInspectionManager.getSettings(dealership.id);
      setSettings(loadedSettings);
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
    
    if (window.confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      try {
        await SupabaseInspectionManager.resetToDefaults(dealership.id);
        await loadSettings();
        setHasChanges(false);
        alert('Settings reset to defaults successfully!');
      } catch (error) {
        console.error('Error resetting settings:', error);
        alert('Error resetting settings. Please try again.');
      }
    }
  };

  const updateSettings = (updatedSettings: InspectionSettingsType) => {
    setSettings(updatedSettings);
    setHasChanges(true);
  };

  // Section management
  const handleAddSection = () => {
    if (!settings) return;
    
    const newSection: InspectionSection = {
      id: `section-${Date.now()}`,
      key: `custom-${Date.now()}`,
      label: 'New Section',
      description: '',
      icon: '📋',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      isActive: true,
      isCustomerVisible: false,
      order: settings.sections.length + 1,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedSettings = {
      ...settings,
      sections: [...settings.sections, newSection]
    };
    
    updateSettings(updatedSettings);
    setEditingSection(newSection);
  };

  const handleUpdateSection = (updatedSection: InspectionSection) => {
    if (!settings) return;
    
    const updatedSections = settings.sections.map(section => 
      section.id === updatedSection.id ? updatedSection : section
    );
    
    const updatedSettings = {
      ...settings,
      sections: updatedSections
    };
    
    updateSettings(updatedSettings);
    setEditingSection(null);
  };

  const handleDeleteSection = (sectionId: string) => {
    if (!settings) return;
    
    if (window.confirm('Are you sure you want to delete this section? This will also delete all items in this section.')) {
      const updatedSections = settings.sections.filter(section => section.id !== sectionId);
      
      const updatedSettings = {
        ...settings,
        sections: updatedSections
      };
      
      updateSettings(updatedSettings);
    }
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
    
    const updatedSettings = {
      ...settings,
      sections: updatedSections
    };
    
    updateSettings(updatedSettings);
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
    
    const updatedSettings = {
      ...settings,
      sections: updatedSections
    };
    
    updateSettings(updatedSettings);
  };

  const handleMoveSectionUp = (sectionId: string) => {
    if (!settings) return;
    
    const sectionIndex = settings.sections.findIndex(section => section.id === sectionId);
    if (sectionIndex <= 0) return;
    
    const updatedSections = [...settings.sections];
    const currentSection = { ...updatedSections[sectionIndex], order: sectionIndex };
    const prevSection = { ...updatedSections[sectionIndex - 1], order: sectionIndex + 1 };
    
    updatedSections[sectionIndex - 1] = currentSection;
    updatedSections[sectionIndex] = prevSection;
    
    const updatedSettings = {
      ...settings,
      sections: updatedSections
    };
    
    updateSettings(updatedSettings);
  };

  const handleMoveSectionDown = (sectionId: string) => {
    if (!settings) return;
    
    const sectionIndex = settings.sections.findIndex(section => section.id === sectionId);
    if (sectionIndex >= settings.sections.length - 1) return;
    
    const updatedSections = [...settings.sections];
    const currentSection = { ...updatedSections[sectionIndex], order: sectionIndex + 2 };
    const nextSection = { ...updatedSections[sectionIndex + 1], order: sectionIndex + 1 };
    
    updatedSections[sectionIndex + 1] = currentSection;
    updatedSections[sectionIndex] = nextSection;
    
    const updatedSettings = {
      ...settings,
      sections: updatedSections
    };
    
    updateSettings(updatedSettings);
  };

  // Item management
  const handleAddItem = (sectionId: string) => {
    if (!settings) return;
    
    const section = settings.sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const newItem: InspectionItem = {
      id: `item-${Date.now()}`,
      label: 'New Item',
      description: '',
      isRequired: false,
      order: section.items.length + 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedSection = {
      ...section,
      items: [...section.items, newItem],
      updatedAt: new Date().toISOString()
    };
    
    const updatedSections = settings.sections.map(s => 
      s.id === sectionId ? updatedSection : s
    );
    
    const updatedSettings = {
      ...settings,
      sections: updatedSections
    };
    
    updateSettings(updatedSettings);
    setEditingItem({ sectionId, item: newItem });
  };

  const handleUpdateItem = (sectionId: string, updatedItem: InspectionItem) => {
    if (!settings) return;
    
    const section = settings.sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const updatedItems = section.items.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    
    const updatedSection = {
      ...section,
      items: updatedItems,
      updatedAt: new Date().toISOString()
    };
    
    const updatedSections = settings.sections.map(s => 
      s.id === sectionId ? updatedSection : s
    );
    
    const updatedSettings = {
      ...settings,
      sections: updatedSections
    };
    
    updateSettings(updatedSettings);
    setEditingItem(null);
  };

  const handleDeleteItem = (sectionId: string, itemId: string) => {
    if (!settings) return;
    
    if (window.confirm('Are you sure you want to delete this item?')) {
      const section = settings.sections.find(s => s.id === sectionId);
      if (!section) return;
      
      const updatedItems = section.items.filter(item => item.id !== itemId);
      
      const updatedSection = {
        ...section,
        items: updatedItems,
        updatedAt: new Date().toISOString()
      };
      
      const updatedSections = settings.sections.map(s => 
        s.id === sectionId ? updatedSection : s
      );
      
      const updatedSettings = {
        ...settings,
        sections: updatedSections
      };
      
      updateSettings(updatedSettings);
    }
  };

  const handleToggleItemActive = (sectionId: string, itemId: string) => {
    if (!settings) return;
    
    const section = settings.sections.find(s => s.id === sectionId);
    if (!section) return;
    
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
    
    const updatedSection = {
      ...section,
      items: updatedItems,
      updatedAt: new Date().toISOString()
    };
    
    const updatedSections = settings.sections.map(s => 
      s.id === sectionId ? updatedSection : s
    );
    
    const updatedSettings = {
      ...settings,
      sections: updatedSections
    };
    
    updateSettings(updatedSettings);
  };

  // Rating label management
  const handleUpdateRating = (updatedRating: RatingLabel) => {
    if (!settings) return;
    
    const updatedRatingLabels = settings.ratingLabels.map(rating => 
      rating.key === updatedRating.key ? updatedRating : rating
    );
    
    const updatedSettings = {
      ...settings,
      ratingLabels: updatedRatingLabels
    };
    
    updateSettings(updatedSettings);
    setEditingRating(null);
  };

  // PDF settings management
  const handleUpdatePdfSettings = (updates: Partial<InspectionSettingsType['customerPdfSettings']>) => {
    if (!settings) return;
    
    const updatedSettings = {
      ...settings,
      customerPdfSettings: {
        ...settings.customerPdfSettings,
        ...updates
      }
    };
    
    updateSettings(updatedSettings);
  };

  // Global settings management
  const handleUpdateGlobalSettings = (updates: Partial<InspectionSettingsType['globalSettings']>) => {
    if (!settings) return;
    
    const updatedSettings = {
      ...settings,
      globalSettings: {
        ...settings.globalSettings,
        ...updates
      }
    };
    
    updateSettings(updatedSettings);
  };

  if (isLoading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 text-center">
        <div className="animate-pulse">
          <div className="w-12 h-12 bg-blue-200 rounded-xl mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3 mx-auto"></div>
        </div>
        <p className="text-gray-600 mt-4">Loading inspection settings...</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Settings</h3>
        <p className="text-gray-600 mb-4">Unable to load inspection settings.</p>
        <button 
          onClick={loadSettings}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
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
            {hasChanges && (
              <button
                onClick={handleSaveSettings}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            )}
            <button
              onClick={handleResetToDefaults}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
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

      {/* Content */}
      {activeTab === 'sections' && (
        <div className="space-y-6">
          {/* Sections List */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Inspection Sections</h3>
              <button
                onClick={handleAddSection}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Section
              </button>
            </div>
            
            <div className="space-y-4">
              {settings.sections.sort((a, b) => a.order - b.order).map((section) => (
                <div 
                  key={section.id}
                  className={`border rounded-xl p-4 transition-colors ${
                    section.isActive 
                      ? 'border-gray-200 bg-white' 
                      : 'border-gray-200 bg-gray-50 opacity-70'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${section.color} rounded-lg flex items-center justify-center text-xl`}>
                        {section.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{section.label}</h4>
                        <p className="text-sm text-gray-600">{section.description || 'No description'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSectionActive(section.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          section.isActive
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                        title={section.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {section.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleToggleSectionCustomerVisible(section.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          section.isCustomerVisible
                            ? 'text-blue-600 hover:bg-blue-50'
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                        title={section.isCustomerVisible ? 'Hide from customer' : 'Show to customer'}
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingSection(section)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSection(section.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveSectionUp(section.id)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Move Up"
                        disabled={section.order <= 1}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveSectionDown(section.id)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Move Down"
                        disabled={section.order >= settings.sections.length}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Items List */}
                  <div className="mt-4 pl-4 border-l border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-gray-700">Items ({section.items.filter(item => item.isActive).length} active / {section.items.length} total)</h5>
                      <button
                        onClick={() => handleAddItem(section.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-xs font-medium"
                      >
                        <Plus className="w-3 h-3" />
                        Add Item
                      </button>
                    </div>
                    
                    {section.items.length > 0 ? (
                      <div className="space-y-2">
                        {section.items.sort((a, b) => a.order - b.order).map((item) => (
                          <div 
                            key={item.id}
                            className={`flex items-center justify-between p-2 rounded border ${
                              item.isActive 
                                ? 'border-gray-200 bg-white' 
                                : 'border-gray-200 bg-gray-50 opacity-70'
                            }`}
                          >
                            <div>
                              <p className={`text-sm ${item.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                                {item.label}
                                {item.isRequired && <span className="text-red-500 ml-1">*</span>}
                              </p>
                              {item.description && (
                                <p className="text-xs text-gray-500">{item.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleToggleItemActive(section.id, item.id)}
                                className={`p-1 rounded transition-colors ${
                                  item.isActive
                                    ? 'text-green-600 hover:bg-green-50'
                                    : 'text-gray-400 hover:bg-gray-50'
                                }`}
                                title={item.isActive ? 'Deactivate' : 'Activate'}
                              >
                                {item.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              </button>
                              <button
                                onClick={() => setEditingItem({ sectionId: section.id, item })}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(section.id, item.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No items in this section</p>
                    )}
                  </div>
                </div>
              ))}
              
              {settings.sections.length === 0 && (
                <div className="text-center py-8">
                  <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sections Found</h3>
                  <p className="text-gray-600 mb-4">Add your first inspection section to get started.</p>
                  <button
                    onClick={handleAddSection}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add Section
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ratings' && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Rating Labels</h3>
          
          <div className="space-y-4">
            {settings.ratingLabels.map((rating) => (
              <div 
                key={rating.key}
                className="border border-gray-200 rounded-xl p-4 bg-white"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${rating.color} rounded-lg flex items-center justify-center`}>
                      {rating.key === 'great' && <Star className="w-5 h-5" />}
                      {rating.key === 'fair' && <CheckCircle className="w-5 h-5" />}
                      {rating.key === 'needs-attention' && <AlertTriangle className="w-5 h-5" />}
                      {rating.key === 'not-checked' && <Circle className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{rating.label}</h4>
                      <p className="text-sm text-gray-600">{rating.description || 'No description'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingRating(rating)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'pdf' && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer PDF Settings</h3>
          
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
                  onChange={(e) => handleUpdatePdfSettings({ includeVehiclePhotos: e.target.checked })}
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
                  onChange={(e) => handleUpdatePdfSettings({ includeCustomerComments: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <h4 className="font-medium text-gray-900">Show Detailed Ratings</h4>
                <p className="text-sm text-gray-600">Display detailed rating information</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.customerPdfSettings.showDetailedRatings}
                  onChange={(e) => handleUpdatePdfSettings({ showDetailedRatings: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Footer Text
              </label>
              <textarea
                value={settings.customerPdfSettings.footerText || ''}
                onChange={(e) => handleUpdatePdfSettings({ footerText: e.target.value })}
                placeholder="Enter footer text for PDF reports..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'global' && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Global Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <h4 className="font-medium text-gray-900">Require User Initials</h4>
                <p className="text-sm text-gray-600">Require user initials for all inspection actions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.globalSettings.requireUserInitials}
                  onChange={(e) => handleUpdateGlobalSettings({ requireUserInitials: e.target.checked })}
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
                  onChange={(e) => handleUpdateGlobalSettings({ allowSkipItems: e.target.checked })}
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
                  onChange={(e) => handleUpdateGlobalSettings({ autoSaveProgress: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <h4 className="font-medium text-gray-900">Show Progress Percentage</h4>
                <p className="text-sm text-gray-600">Display progress percentage in inspection UI</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.globalSettings.showProgressPercentage}
                  onChange={(e) => handleUpdateGlobalSettings({ showProgressPercentage: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <h4 className="font-medium text-gray-900">Enable Team Notes</h4>
                <p className="text-sm text-gray-600">Allow team members to add notes to inspections</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.globalSettings.enableTeamNotes}
                  onChange={(e) => handleUpdateGlobalSettings({ enableTeamNotes: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Edit Section Modal */}
      {editingSection && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full border border-white/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingSection.id.startsWith('section-') ? 'Edit Section' : 'Add Section'}
                </h3>
                <button
                  onClick={() => setEditingSection(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section Label *
                  </label>
                  <input
                    type="text"
                    value={editingSection.label}
                    onChange={(e) => setEditingSection({ ...editingSection, label: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section Key *
                  </label>
                  <input
                    type="text"
                    value={editingSection.key}
                    onChange={(e) => setEditingSection({ ...editingSection, key: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Unique identifier for this section (no spaces, lowercase)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editingSection.description || ''}
                    onChange={(e) => setEditingSection({ ...editingSection, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon
                  </label>
                  <input
                    type="text"
                    value={editingSection.icon}
                    onChange={(e) => setEditingSection({ ...editingSection, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Emoji or icon name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <select
                    value={editingSection.color}
                    onChange={(e) => setEditingSection({ ...editingSection, color: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="bg-green-100 text-green-800 border-green-200">Green</option>
                    <option value="bg-blue-100 text-blue-800 border-blue-200">Blue</option>
                    <option value="bg-purple-100 text-purple-800 border-purple-200">Purple</option>
                    <option value="bg-red-100 text-red-800 border-red-200">Red</option>
                    <option value="bg-yellow-100 text-yellow-800 border-yellow-200">Yellow</option>
                    <option value="bg-orange-100 text-orange-800 border-orange-200">Orange</option>
                    <option value="bg-indigo-100 text-indigo-800 border-indigo-200">Indigo</option>
                    <option value="bg-pink-100 text-pink-800 border-pink-200">Pink</option>
                    <option value="bg-gray-100 text-gray-800 border-gray-200">Gray</option>
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingSection.isActive}
                      onChange={(e) => setEditingSection({ ...editingSection, isActive: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingSection.isCustomerVisible}
                      onChange={(e) => setEditingSection({ ...editingSection, isCustomerVisible: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Customer Visible</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleUpdateSection(editingSection)}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Save Section
                </button>
                <button
                  onClick={() => setEditingSection(null)}
                  className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full border border-white/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingItem.item.id.startsWith('item-') ? 'Edit Item' : 'Add Item'}
                </h3>
                <button
                  onClick={() => setEditingItem(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Label *
                  </label>
                  <input
                    type="text"
                    value={editingItem.item.label}
                    onChange={(e) => setEditingItem({ 
                      ...editingItem, 
                      item: { ...editingItem.item, label: e.target.value } 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editingItem.item.description || ''}
                    onChange={(e) => setEditingItem({ 
                      ...editingItem, 
                      item: { ...editingItem.item, description: e.target.value } 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingItem.item.isRequired}
                      onChange={(e) => setEditingItem({ 
                        ...editingItem, 
                        item: { ...editingItem.item, isRequired: e.target.checked } 
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Required</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingItem.item.isActive}
                      onChange={(e) => setEditingItem({ 
                        ...editingItem, 
                        item: { ...editingItem.item, isActive: e.target.checked } 
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleUpdateItem(editingItem.sectionId, {
                    ...editingItem.item,
                    updatedAt: new Date().toISOString()
                  })}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Save Item
                </button>
                <button
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Rating Modal */}
      {editingRating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full border border-white/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Edit Rating Label</h3>
                <button
                  onClick={() => setEditingRating(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Label *
                  </label>
                  <input
                    type="text"
                    value={editingRating.label}
                    onChange={(e) => setEditingRating({ 
                      ...editingRating, 
                      label: e.target.value 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editingRating.description || ''}
                    onChange={(e) => setEditingRating({ 
                      ...editingRating, 
                      description: e.target.value 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <select
                    value={editingRating.color}
                    onChange={(e) => setEditingRating({ 
                      ...editingRating, 
                      color: e.target.value 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="bg-emerald-600 text-white ring-2 ring-emerald-300">Emerald</option>
                    <option value="bg-green-600 text-white ring-2 ring-green-300">Green</option>
                    <option value="bg-blue-600 text-white ring-2 ring-blue-300">Blue</option>
                    <option value="bg-yellow-600 text-white ring-2 ring-yellow-300">Yellow</option>
                    <option value="bg-orange-600 text-white ring-2 ring-orange-300">Orange</option>
                    <option value="bg-red-600 text-white ring-2 ring-red-300">Red</option>
                    <option value="bg-purple-600 text-white ring-2 ring-purple-300">Purple</option>
                    <option value="bg-gray-500 text-white">Gray</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon (Emoji)
                  </label>
                  <input
                    type="text"
                    value={editingRating.icon || ''}
                    onChange={(e) => setEditingRating({ 
                      ...editingRating, 
                      icon: e.target.value 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="⭐, ✓, ⚠️, ?"
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleUpdateRating(editingRating)}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Save Rating
                </button>
                <button
                  onClick={() => setEditingRating(null)}
                  className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionSettings;