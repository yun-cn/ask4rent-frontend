import React, { useState, useCallback, useMemo } from 'react';
import { Icons, getIcon, LoadingSpinner } from '../utils/icons';

const HomePage = ({ onSearch, isLoading, user, onShowLogin, onLogout }) => {
  const [searchMode, setSearchMode] = useState('traditional');
  const [activeTab, setActiveTab] = useState('rental');

  const searchModes = useMemo(() => [
    { id: 'traditional', label: 'Traditional Search', icon: 'search' },
    { id: 'ai', label: 'AI Assistant', icon: 'bot' }
  ], []);

  const tabs = useMemo(() => [
    { id: 'rental', label: 'Rental Search', icon: 'home' },
    { id: 'school', label: 'School Search', icon: 'graduation' },
    { id: 'landmark', label: 'Landmark Search', icon: 'mapPin' }
  ], []);

  const handleSearchModeChange = useCallback((mode) => {
    setSearchMode(mode);
  }, []);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const renderSearchContent = () => {
    if (searchMode === 'ai') {
      return <AISearchForm onSearch={onSearch} isLoading={isLoading} />;
    }
    
    switch (activeTab) {
      case 'rental':
        return <RentalSearchForm onSearch={onSearch} />;
      case 'school':
        return <SchoolSearchForm onSearch={onSearch} />;
      case 'landmark':
        return <LandmarkSearchForm onSearch={onSearch} />;
      default:
        return <RentalSearchForm onSearch={onSearch} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Ask4Rent
            </h1>
            <p className="text-gray-600 text-lg">Your trusted rental companion</p>
          </div>
          
          {/* User Authentication */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                  {user.firstName?.[0]?.toUpperCase() || 'U'}
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Sign out"
                >
                  {getIcon('logout', 'sm', 'secondary')}
                </button>
              </div>
            ) : (
              <button
                onClick={onShowLogin}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:shadow-lg"
              >
                {getIcon('user', 'sm', 'white')}
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Mode Toggle */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex bg-white rounded-xl shadow-lg p-2">
            {searchModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleSearchModeChange(mode.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-lg text-base font-medium transition-all duration-200 ${
                  searchMode === mode.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {getIcon(mode.icon, 'md', searchMode === mode.id ? 'white' : 'secondary')}
                <span>{mode.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Traditional Search Tabs */}
        {searchMode === 'traditional' && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex bg-white rounded-xl shadow-lg p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {getIcon(tab.icon, 'sm', activeTab === tab.id ? 'white' : 'secondary')}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Form */}
        <div className="max-w-4xl mx-auto">
          {renderSearchContent()}
        </div>
      </div>
    </div>
  );
};

// Reusable Components
const FormInput = ({ label, type = 'text', placeholder, value, onChange, className = '' }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${className}`}
    />
  </div>
);

const FormSelect = ({ label, value, onChange, options, placeholder, className = '' }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <select
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${className}`}
    >
      <option value="">{placeholder}</option>
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const SubmitButton = ({ children, color = 'blue', className = '', ...props }) => {
  const colorClasses = {
    blue: 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
    green: 'from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700',
    purple: 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
  };

  return (
    <button
      type="submit"
      className={`w-full bg-gradient-to-r ${colorClasses[color]} text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02] flex items-center justify-center gap-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Search Form Components
const AISearchForm = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  }, [query, onSearch]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
          {getIcon('bot', 'xl', 'primary')}
          AI Assistant
        </h2>
        <p className="text-gray-600">Ask in natural language and let AI find your perfect rental</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {getIcon('search', 'md', 'primary')}
          </div>
          <textarea
            placeholder="Ask about rental properties in natural language... e.g., 'Show me 2-bedroom apartments near Massey University under $600 per week with parking'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={4}
            className="w-full pl-12 pr-4 py-4 text-base border-2 border-gray-200 rounded-xl outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 placeholder:text-gray-500 bg-gray-50 focus:bg-white resize-none"
          />
        </div>
        
        <SubmitButton disabled={isLoading || !query.trim()}>
          {isLoading ? (
            <>
              <LoadingSpinner size="md" className="text-white" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              {getIcon('bot', 'md', 'white')}
              <span>Ask AI Assistant</span>
            </>
          )}
        </SubmitButton>
      </form>
    </div>
  );
};

const RentalSearchForm = ({ onSearch }) => {
  const [formData, setFormData] = useState({
    location: '',
    bedrooms: '',
    maxRent: '',
    propertyType: ''
  });

  const bedroomOptions = useMemo(() => [
    { value: '1', label: '1 bedroom' },
    { value: '2', label: '2 bedrooms' },
    { value: '3', label: '3 bedrooms' },
    { value: '4', label: '4 bedrooms' },
    { value: '5', label: '5+ bedrooms' }
  ], []);

  const propertyTypeOptions = useMemo(() => [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'studio', label: 'Studio' }
  ], []);

  const buildQuery = useCallback((data) => {
    const parts = [];
    
    if (data.bedrooms) parts.push(`${data.bedrooms}-bedroom`);
    parts.push(data.propertyType || 'property');
    if (data.location) parts.push(`in ${data.location}`);
    if (data.maxRent) parts.push(`under $${data.maxRent}/week`);
    
    return parts.join(' ');
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const query = buildQuery(formData);
    if (query.trim()) onSearch(query);
  }, [formData, buildQuery, onSearch]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        {getIcon('home', 'lg', 'primary')}
        Rental Search
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Location"
            placeholder="e.g., Auckland CBD"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
          />
          
          <FormSelect
            label="Bedrooms"
            value={formData.bedrooms}
            onChange={(e) => handleInputChange('bedrooms', e.target.value)}
            options={bedroomOptions}
            placeholder="Any"
          />
          
          <FormInput
            label="Max Rent (per week)"
            type="number"
            placeholder="e.g., 600"
            value={formData.maxRent}
            onChange={(e) => handleInputChange('maxRent', e.target.value)}
          />
          
          <FormSelect
            label="Property Type"
            value={formData.propertyType}
            onChange={(e) => handleInputChange('propertyType', e.target.value)}
            options={propertyTypeOptions}
            placeholder="Any"
          />
        </div>
        
        <SubmitButton>
          {getIcon('search', 'md', 'white')}
          <span>Search Rentals</span>
        </SubmitButton>
      </form>
    </div>
  );
};

const SchoolSearchForm = ({ onSearch }) => {
  const [formData, setFormData] = useState({
    schoolName: '',
    distance: '',
    bedrooms: '',
    maxRent: ''
  });

  const distanceOptions = useMemo(() => [
    { value: '1km', label: 'Within 1km' },
    { value: '2km', label: 'Within 2km' },
    { value: '5km', label: 'Within 5km' },
    { value: '10km', label: 'Within 10km' }
  ], []);

  const bedroomOptions = useMemo(() => [
    { value: '1', label: '1 bedroom' },
    { value: '2', label: '2 bedrooms' },
    { value: '3', label: '3 bedrooms' },
    { value: '4', label: '4 bedrooms' },
    { value: '5', label: '5+ bedrooms' }
  ], []);

  const buildQuery = useCallback((data) => {
    const parts = [];
    
    if (data.bedrooms) parts.push(`${data.bedrooms}-bedroom`);
    parts.push('property');
    
    if (data.schoolName) {
      if (data.distance) {
        parts.push(`within ${data.distance} of ${data.schoolName}`);
      } else {
        parts.push(`near ${data.schoolName}`);
      }
    }
    
    if (data.maxRent) parts.push(`under $${data.maxRent}/week`);
    
    return parts.join(' ');
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const query = buildQuery(formData);
    if (query.trim()) onSearch(query);
  }, [formData, buildQuery, onSearch]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        {getIcon('graduation', 'lg', 'success')}
        School Search
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="School Name"
            placeholder="e.g., Massey University"
            value={formData.schoolName}
            onChange={(e) => handleInputChange('schoolName', e.target.value)}
          />
          
          <FormSelect
            label="Distance Range"
            value={formData.distance}
            onChange={(e) => handleInputChange('distance', e.target.value)}
            options={distanceOptions}
            placeholder="Any distance"
          />
          
          <FormSelect
            label="Bedrooms"
            value={formData.bedrooms}
            onChange={(e) => handleInputChange('bedrooms', e.target.value)}
            options={bedroomOptions}
            placeholder="Any"
          />
          
          <FormInput
            label="Max Rent (per week)"
            type="number"
            placeholder="e.g., 600"
            value={formData.maxRent}
            onChange={(e) => handleInputChange('maxRent', e.target.value)}
          />
        </div>
        
        <SubmitButton color="green">
          {getIcon('search', 'md', 'white')}
          <span>Search Near Schools</span>
        </SubmitButton>
      </form>
    </div>
  );
};

const LandmarkSearchForm = ({ onSearch }) => {
  const [formData, setFormData] = useState({
    landmark: '',
    distance: '',
    bedrooms: '',
    maxRent: ''
  });

  const landmarkOptions = useMemo(() => [
    { value: 'Sky Tower', label: 'Sky Tower' },
    { value: 'Auckland CBD', label: 'Auckland CBD' },
    { value: 'Viaduct Harbour', label: 'Viaduct Harbour' },
    { value: 'Newmarket', label: 'Newmarket' },
    { value: 'Ponsonby', label: 'Ponsonby' },
    { value: 'Mount Eden', label: 'Mount Eden' },
    { value: 'Takapuna', label: 'Takapuna' },
    { value: 'Albany', label: 'Albany' },
    { value: 'Botany Downs', label: 'Botany Downs' },
    { value: 'Westfield Newmarket', label: 'Westfield Newmarket' },
    { value: 'Commercial Bay', label: 'Commercial Bay' },
    { value: 'Queen Street', label: 'Queen Street' }
  ], []);

  const distanceOptions = useMemo(() => [
    { value: '1km', label: 'Within 1km' },
    { value: '2km', label: 'Within 2km' },
    { value: '5km', label: 'Within 5km' },
    { value: '10km', label: 'Within 10km' }
  ], []);

  const bedroomOptions = useMemo(() => [
    { value: '1', label: '1 bedroom' },
    { value: '2', label: '2 bedrooms' },
    { value: '3', label: '3 bedrooms' },
    { value: '4', label: '4 bedrooms' },
    { value: '5', label: '5+ bedrooms' }
  ], []);

  const buildQuery = useCallback((data) => {
    const parts = [];
    
    if (data.bedrooms) parts.push(`${data.bedrooms}-bedroom`);
    parts.push('property');
    
    if (data.landmark) {
      if (data.distance) {
        parts.push(`within ${data.distance} of ${data.landmark}`);
      } else {
        parts.push(`near ${data.landmark}`);
      }
    }
    
    if (data.maxRent) parts.push(`under $${data.maxRent}/week`);
    
    return parts.join(' ');
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const query = buildQuery(formData);
    if (query.trim()) onSearch(query);
  }, [formData, buildQuery, onSearch]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        {getIcon('mapPin', 'lg', 'purple')}
        Landmark Search
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormSelect
            label="Landmark Name"
            value={formData.landmark}
            onChange={(e) => handleInputChange('landmark', e.target.value)}
            options={landmarkOptions}
            placeholder="Select Landmark"
          />
          
          <FormSelect
            label="Distance Range"
            value={formData.distance}
            onChange={(e) => handleInputChange('distance', e.target.value)}
            options={distanceOptions}
            placeholder="Any distance"
          />
          
          <FormSelect
            label="Bedrooms"
            value={formData.bedrooms}
            onChange={(e) => handleInputChange('bedrooms', e.target.value)}
            options={bedroomOptions}
            placeholder="Any"
          />
          
          <FormInput
            label="Max Rent (per week)"
            type="number"
            placeholder="e.g., 600"
            value={formData.maxRent}
            onChange={(e) => handleInputChange('maxRent', e.target.value)}
          />
        </div>
        
        <SubmitButton color="purple">
          {getIcon('search', 'md', 'white')}
          <span>Search Near Landmarks</span>
        </SubmitButton>
      </form>
    </div>
  );
};

export default HomePage;