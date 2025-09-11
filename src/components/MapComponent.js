import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getIcon } from '../utils/icons';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapComponent = ({ 
  properties, 
  center, 
  zoom, 
  onMarkerClick, 
  selectedPropertyId, 
  schoolInfo, 
  schoolZone, 
  displayMode,
  territorialAuthorities,
  schools,
  selectedSchool,
  selectedTA,
  onTerritorialAuthorityClick,
  onSchoolClick,
  onMapClick,
  isMapClickMode,
  selectedLocation,
  commuteSearchData
}) => {
  const defaultCenter = [-36.8485, 174.7633]; // Auckland, NZ
  const defaultZoom = 12;

  // State for filter dropdown
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Handle clicking outside of filter dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isFilterOpen && !event.target.closest('.territorial-authority-filter')) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isFilterOpen]);


  // Create custom icons for selected and normal markers
  const createCustomIcon = (isSelected = false) => {
    const iconHtml = `
      <div style="
        background: ${isSelected ? '#3B82F6' : '#6B7280'};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        ${isSelected ? 'animation: bounce 0.6s ease-in-out;' : ''}
      ">
        <div style="
          color: white;
          font-size: 14px;
          transform: rotate(45deg);
          font-weight: bold;
        ">🏠</div>
      </div>
      <style>
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translateY(0) rotate(-45deg); }
          40%, 43% { transform: translateY(-8px) rotate(-45deg); }
          70% { transform: translateY(-4px) rotate(-45deg); }
        }
      </style>
    `;

    return new L.DivIcon({
      html: iconHtml,
      className: 'custom-map-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    });
  };

  // Create custom icon for territorial authority marker - styled like property search websites
  const createTerritorialAuthorityIcon = (schoolCount, taName) => {
    const displayName = taName || 'Zone'; // Show full name, no truncation
    
    const iconHtml = `
      <div style="
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <!-- Combined label box -->
        <div style="
          background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
          color: white;
          padding: 8px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: schoolZoneFadeIn 0.5s ease-out;
          max-width: 300px;
        ">
          <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
            <span style="font-size: 13px; line-height: 1;">${displayName}</span>
            <span style="
              font-size: 11px; 
              background: rgba(255,255,255,0.2); 
              padding: 1px 6px; 
              border-radius: 8px;
              line-height: 1;
            ">${schoolCount} schools</span>
          </div>
        </div>
        
        <!-- Pointer arrow -->
        <div style="
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 10px solid #1E40AF;
          margin-top: 2px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        "></div>
      </div>
      
      <style>
        @keyframes schoolZoneFadeIn {
          0% { opacity: 0; transform: translateY(-10px) scale(0.8); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      </style>
    `;

    return new L.DivIcon({
      html: iconHtml,
      className: 'custom-school-zone-marker',
      iconSize: [300, 60],
      iconAnchor: [150, 60],
      popupAnchor: [0, -60]
    });
  };

  // Create custom icon for school marker - styled like property search websites
  const createSchoolIcon = (schoolName, isSelected = false) => {
    const displayName = schoolName || 'School'; // Show full name, no truncation
    
    const iconHtml = `
      <div style="
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        transform: ${isSelected ? 'scale(1.05)' : 'scale(1)'};
        transition: transform 0.3s ease;
      ">
        <!-- Main label box -->
        <div style="
          background: ${isSelected ? 
            'linear-gradient(135deg, #047857 0%, #065F46 100%)' : 
            'linear-gradient(135deg, #059669 0%, #047857 100%)'
          };
          color: white;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: ${isSelected ? 
            '0 6px 16px rgba(4, 120, 87, 0.5)' : 
            '0 4px 12px rgba(5, 150, 105, 0.4)'
          };
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: ${isSelected ? 'selectedSchoolFadeIn 0.6s ease-out' : 'schoolFadeIn 0.5s ease-out'};
          max-width: 300px;
        ">
          <span>${displayName}</span>
        </div>
        
        <!-- Pointer arrow -->
        <div style="
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid ${isSelected ? '#065F46' : '#047857'};
          margin-top: 2px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        "></div>
      </div>
      
      <style>
        @keyframes schoolFadeIn {
          0% { opacity: 0; transform: translateY(-8px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes selectedSchoolFadeIn {
          0% { opacity: 0; transform: translateY(-10px) scale(0.8); }
          50% { opacity: 0.7; transform: translateY(-5px) scale(1.05); }
          100% { opacity: 1; transform: translateY(0) scale(1.05); }
        }
      </style>
    `;

    return new L.DivIcon({
      html: iconHtml,
      className: 'custom-school-label-marker',
      iconSize: [300, 50],
      iconAnchor: [150, 50],
      popupAnchor: [0, -50]
    });
  };

  const MapUpdater = ({ center, zoom }) => {
    const map = useMap();
    
    useEffect(() => {
      if (center && center[0] !== undefined && center[1] !== undefined) {
        map.setView(center, zoom, { animate: true, duration: 1 });
      }
    }, [center, zoom, map]);

    return null;
  };

  const CustomZoomControl = () => {
    const map = useMap();
    
    useEffect(() => {
      const zoomControl = L.control.zoom({
        position: 'topright'
      });
      
      map.addControl(zoomControl);
      
      return () => {
        map.removeControl(zoomControl);
      };
    }, [map]);

    return null;
  };

  const MapClickHandler = () => {
    const map = useMap();
    
    useEffect(() => {
      const handleClick = (e) => {
        if (isMapClickMode && onMapClick) {
          onMapClick(e.latlng);
        }
      };
      
      map.on('click', handleClick);
      
      if (isMapClickMode) {
        map.getContainer().style.cursor = 'crosshair';
      } else {
        map.getContainer().style.cursor = '';
      }
      
      return () => {
        map.off('click', handleClick);
        map.getContainer().style.cursor = '';
      };
    }, [map]); // eslint-disable-line react-hooks/exhaustive-deps
    
    return null;
  };

  const TerritorialAuthorityFilter = () => {
    const shouldShowFilter = (displayMode === 'zones' || displayMode === 'properties') && 
                            Array.isArray(territorialAuthorities) && 
                            territorialAuthorities.length > 0;

    if (!shouldShowFilter) return null;

    return (
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg border border-gray-200 territorial-authority-filter">
        <div className="relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors w-full min-w-[240px]"
          >
            <div className="flex items-center gap-2 flex-1">
              {getIcon('mapPin', 'sm', 'primary')}
              <span className="truncate">
                {selectedTA ? selectedTA.name : 'Select Territory'}
              </span>
            </div>
            <div className={`transform transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}>
              {getIcon('chevronDown', 'sm', 'secondary')}
            </div>
          </button>
          
          {isFilterOpen && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-lg max-h-64 overflow-y-auto z-[1001]">
              {territorialAuthorities.map((ta, index) => (
                <button
                  key={ta.id || index}
                  onClick={() => {
                    if (onTerritorialAuthorityClick) {
                      onTerritorialAuthorityClick(ta);
                    }
                    setIsFilterOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                    selectedTA && selectedTA.id === ta.id 
                      ? 'bg-blue-50 text-blue-700 font-medium' 
                      : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate flex-1">{ta.name}</span>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {ta.school_count} schools
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const PropertyFilters = () => {
    if (displayMode !== 'properties' || !properties || properties.length === 0) {
      return null;
    }

    return (
      <div className="absolute top-4 left-96 z-[1000] pointer-events-auto">
        <div className="flex items-center gap-3 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
          <input
            type="number"
            placeholder="Min $"
            className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="number"
            placeholder="Max $"
            className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
            <option value="">Any beds</option>
            <option value="1">1 bed</option>
            <option value="2">2 beds</option>
            <option value="3">3 beds</option>
            <option value="4">4 beds</option>
          </select>
          <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
            <option value="">Any baths</option>
            <option value="1">1 bath</option>
            <option value="2">2 baths</option>
            <option value="3">3 baths</option>
          </select>
        </div>
      </div>
    );
  };

  const createLocationIcon = () => {
    const iconHtml = `
      <div style="
        background: #EF4444;
        width: 40px;
        height: 40px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 4px solid white;
        box-shadow: 0 3px 12px rgba(239,68,68,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        animation: locationBounce 1.5s ease-in-out infinite;
      ">
        <div style="
          color: white;
          font-size: 18px;
          transform: rotate(45deg);
          font-weight: bold;
        ">📍</div>
      </div>
      <style>
        @keyframes locationBounce {
          0%, 100% { transform: translateY(0) rotate(-45deg); }
          50% { transform: translateY(-5px) rotate(-45deg); }
        }
      </style>
    `;

    return new L.DivIcon({
      html: iconHtml,
      className: 'custom-location-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });
  };

  return (
    <MapContainer
      center={center || defaultCenter}
      zoom={zoom || defaultZoom}
      style={{ height: '100%', width: '100%', touchAction: 'none' }}
      scrollWheelZoom={true}
      doubleClickZoom={true}
      touchZoom={true}
      dragging={true}
      zoomControl={false}
    >
      <MapUpdater center={center} zoom={zoom} />
      <MapClickHandler />
      <CustomZoomControl />
      <TerritorialAuthorityFilter />
      <PropertyFilters />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Selected location marker for commute search */}
      {selectedLocation && displayMode === 'commute' && (
        <Marker 
          position={[selectedLocation.lat, selectedLocation.lng]}
          icon={createLocationIcon()}
        >
          <Popup>
            <div className="min-w-[200px] p-3">
              <h3 className="text-lg font-semibold text-red-600 mb-2 flex items-center gap-2">
                <span>📍</span>
                Selected Location
              </h3>
              <div className="text-sm text-gray-600 mb-2">
                <div className="font-mono bg-gray-50 px-2 py-1 rounded text-xs">
                  {Math.abs(selectedLocation.lat).toFixed(4)}°{selectedLocation.lat >= 0 ? 'N' : 'S'}, {Math.abs(selectedLocation.lng).toFixed(4)}°{selectedLocation.lng >= 0 ? 'E' : 'W'}
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <span>🚗</span>
                <span>Commute search origin point</span>
              </div>
            </div>
          </Popup>
        </Marker>
      )}
      {properties && properties.map((property, index) => {
        const propertyId = property.id || property.address;
        const isSelected = selectedPropertyId === propertyId;
        
        return (
        <Marker 
          key={property.id || index} 
          position={[property.lat, property.lng]}
          icon={createCustomIcon(isSelected)}
          eventHandlers={{
            click: () => {
              if (onMarkerClick) {
                onMarkerClick(property);
              }
            }
          }}
        >
          <Popup>
            <div className="min-w-[260px] p-4">
              {/* Property Header */}
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
                  {property.title || property.address}
                </h3>
                <div className="flex items-start gap-1.5 text-sm text-gray-600 mb-2">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="flex-1">{property.address}</span>
                </div>
                {property.region && (
                  <div className="text-xs text-gray-500 font-medium">
                    {property.region} {property.suburb && `• ${property.suburb}`}
                  </div>
                )}
              </div>

              {/* Property Details */}
              <div className="flex items-center gap-4 mb-3 text-sm text-gray-700">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                  </svg>
                  <span>{property.bedrooms} bed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H8zm0 2h8v12H8V4zm2 2a1 1 0 011 1v6a1 1 0 11-2 0V7a1 1 0 011-1zm4 0a1 1 0 011 1v6a1 1 0 11-2 0V7a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span>{property.bathrooms} bath</span>
                </div>
                {property.parking > 0 && (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2V4zm2 0h8v12H6V4zm10 0a2 2 0 012 2v8a2 2 0 01-2 2V4zM8 7a1 1 0 000 2h4a1 1 0 100-2H8z" clipRule="evenodd" />
                    </svg>
                    <span>{property.parking} car</span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between">
                  <div className="text-xl font-bold text-blue-600">
                    ${property.rent_per_week || property.rent}/week
                  </div>
                  <div className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    {property.property_type || 'Property'}
                  </div>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
        );
      })}
      
      
      {/* Territorial Authorities Display */}
      {displayMode === 'territorialAuthorities' && Array.isArray(territorialAuthorities) && territorialAuthorities.length > 0 && (
        territorialAuthorities.map((ta, index) => {
          if (ta.latitude && ta.longitude) {
            return (
              <Marker 
                key={`ta-${index}`} 
                position={[ta.latitude, ta.longitude]}
                icon={createTerritorialAuthorityIcon(ta.school_count, ta.name)}
                eventHandlers={{
                  click: () => {
                    if (onTerritorialAuthorityClick) {
                      onTerritorialAuthorityClick(ta);
                    }
                  }
                }}
              >
                <Popup>
                  <div className="min-w-[250px] p-4">
                    <div className="text-center mb-3">
                      <h3 className="text-lg font-semibold text-purple-700 mb-2">
                        {ta.name}
                      </h3>
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-3">
                        <span className="text-2xl">🎓</span>
                        <span className="font-medium">{ta.school_count} schools</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Click to view schools in this area
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })
      )}

      {/* Schools in Selected TA Display - now shown with properties */}
      {(displayMode === 'zones' || displayMode === 'properties') && Array.isArray(schools) && schools.length > 0 && (
        schools.map((school, index) => {
          // Handle different coordinate field names
          const lat = school.latitude || school.lat;
          const lng = school.longitude || school.lon;
          
          if (lat && lng) {
            const isSelected = selectedSchool && selectedSchool.id === school.id;
            return (
              <Marker 
                key={school.id || index} 
                position={[lat, lng]}
                icon={createSchoolIcon(school.name, isSelected)}
                eventHandlers={{
                  click: () => {
                    if (onSchoolClick) {
                      onSchoolClick(school);
                    }
                  }
                }}
              >
                <Popup>
                  <div className="p-2">
                    <div className="text-center">
                      <h3 className="text-base font-semibold text-green-700">
                        {school.name}
                      </h3>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })
      )}

      {/* Territory Zone Display (when TA is selected) */}
      {displayMode === 'zones' && (
        // If we have boundary data, show polygon
        schoolZone && schoolZone.features && schoolZone.features.length > 0 ? (
          schoolZone.features.map((feature, index) => {
            if (feature.geometry && feature.geometry.coordinates) {
              const coordinates = feature.geometry.coordinates[0]; // Get first ring of polygon
              return (
                <Polygon
                  key={`territory-zone-${index}`}
                  positions={coordinates.map(coord => [coord[1], coord[0]])} // Convert [lng, lat] to [lat, lng]
                  pathOptions={{
                    color: '#7C3AED',
                    weight: 3,
                    opacity: 0.8,
                    fillColor: '#8B5CF6',
                    fillOpacity: 0.2
                  }}
                >
                  <Popup>
                    <div className="text-center p-2">
                      <h4 className="font-semibold text-purple-700">Territory Boundary</h4>
                      <p className="text-sm text-gray-600">{selectedTA?.name}</p>
                    </div>
                  </Popup>
                </Polygon>
              );
            }
            return null;
          })
        ) : (
          // Fallback: If no boundary data, show approximate circular area around TA center
          selectedTA && selectedTA.latitude && selectedTA.longitude && (
            <Circle
              key={`territory-circle-${selectedTA.id}`}
              center={[selectedTA.latitude, selectedTA.longitude]}
              radius={8000} // 8km radius - adjust as needed
              pathOptions={{
                color: '#7C3AED',
                weight: 3,
                opacity: 0.8,
                fillColor: '#8B5CF6',
                fillOpacity: 0.15
              }}
            >
              <Popup>
                <div className="text-center p-2">
                  <h4 className="font-semibold text-purple-700">{selectedTA.name}</h4>
                  <p className="text-sm text-gray-600">Approximate area (8km radius)</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedTA.school_count} schools in this area
                  </p>
                </div>
              </Popup>
            </Circle>
          )
        )
      )}

      {/* School Zone Display (when a specific school is selected) */}
      {(displayMode === 'schools' || displayMode === 'properties') && schoolInfo && schoolZone && schoolZone.features && schoolZone.features.length > 0 && (
        schoolZone.features.map((feature, index) => {
          if (feature.geometry && feature.geometry.coordinates) {
            const coordinates = feature.geometry.coordinates[0]; // Get first ring of polygon
            return (
              <Polygon
                key={`focused-zone-${index}`}
                positions={coordinates.map(coord => [coord[1], coord[0]])} // Convert [lng, lat] to [lat, lng]
                pathOptions={{
                  color: '#059669',
                  weight: 4,
                  opacity: 1,
                  fillColor: '#10B981',
                  fillOpacity: 0.3
                }}
              >
                <Popup>
                  <div className="text-center p-2">
                    <h4 className="font-semibold text-green-700">School Zone</h4>
                    <p className="text-sm text-gray-600">{schoolInfo.name}</p>
                  </div>
                </Popup>
              </Polygon>
            );
          }
          return null;
        })
      )}

      {/* Commute Range Isochrone Display (when in commute mode) */}
      {displayMode === 'commute' && commuteSearchData && commuteSearchData.isochrone && (
        (() => {
          const isochrone = commuteSearchData.isochrone;
          
          // Handle different isochrone data formats
          if (isochrone.type === 'FeatureCollection' && isochrone.features && isochrone.features.length > 0) {
            return isochrone.features.map((feature, index) => {
              if (feature.geometry && feature.geometry.type === 'Polygon' && feature.geometry.coordinates) {
                const coordinates = feature.geometry.coordinates[0]; // Get first ring of polygon
                return (
                  <Polygon
                    key={`commute-isochrone-${index}`}
                    positions={coordinates.map(coord => [coord[1], coord[0]])} // Convert [lng, lat] to [lat, lng]
                    pathOptions={{
                      color: '#1D4ED8',
                      weight: 4,
                      opacity: 1,
                      fillColor: '#3B82F6',
                      fillOpacity: 0.15,
                      dashArray: '8, 8'
                    }}
                  >
                    <Popup>
                      <div className="text-center p-3">
                        <h4 className="font-semibold text-blue-600 mb-2 flex items-center justify-center gap-2">
                          <span>🚗</span>
                          Commute Range
                        </h4>
                        <p className="text-sm text-gray-600 mb-1">
                          {commuteSearchData.searchMinutes} minutes driving time
                        </p>
                        <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                          From: {Math.abs(commuteSearchData.searchLocation.lat).toFixed(4)}°{commuteSearchData.searchLocation.lat >= 0 ? 'N' : 'S'}, {Math.abs(commuteSearchData.searchLocation.lon).toFixed(4)}°{commuteSearchData.searchLocation.lon >= 0 ? 'E' : 'W'}
                        </div>
                      </div>
                    </Popup>
                  </Polygon>
                );
              }
              return null;
            });
          } else if (isochrone.type === 'Polygon' && isochrone.coordinates) {
            // Handle single Polygon format
            const coordinates = isochrone.coordinates[0];
            return (
              <Polygon
                key="commute-isochrone-single"
                positions={coordinates.map(coord => [coord[1], coord[0]])} // Convert [lng, lat] to [lat, lng]
                pathOptions={{
                  color: '#1D4ED8',
                  weight: 4,
                  opacity: 1,
                  fillColor: '#3B82F6',
                  fillOpacity: 0.15,
                  dashArray: '8, 8'
                }}
              >
                <Popup>
                  <div className="text-center p-3">
                    <h4 className="font-semibold text-blue-600 mb-2 flex items-center justify-center gap-2">
                      <span>🚗</span>
                      Commute Range
                    </h4>
                    <p className="text-sm text-gray-600 mb-1">
                      {commuteSearchData.searchMinutes} minutes driving time
                    </p>
                    <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                      From: {Math.abs(commuteSearchData.searchLocation.lat).toFixed(4)}°{commuteSearchData.searchLocation.lat >= 0 ? 'N' : 'S'}, {Math.abs(commuteSearchData.searchLocation.lon).toFixed(4)}°{commuteSearchData.searchLocation.lon >= 0 ? 'E' : 'W'}
                    </div>
                  </div>
                </Popup>
              </Polygon>
            );
          }
          
          return null;
        })()
      )}

      {/* Selected School Marker (when showing school zone and properties) */}
      {displayMode === 'properties' && schoolInfo && schoolInfo.latitude && schoolInfo.longitude && (
        <Marker 
          position={[schoolInfo.latitude, schoolInfo.longitude]}
          icon={createSchoolIcon(schoolInfo.name, true)} // Show as selected
        >
          <Popup>
            <div className="p-2">
              <div className="text-center">
                <h3 className="text-base font-semibold text-green-700">
                  {schoolInfo.name}
                </h3>
              </div>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default MapComponent;