import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapComponent = ({ properties, center, zoom }) => {
  const defaultCenter = [-36.8485, 174.7633]; // Auckland, NZ
  const defaultZoom = 12;

  return (
    <MapContainer
      center={center || defaultCenter}
      zoom={zoom || defaultZoom}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {properties && properties.map((property, index) => (
        <Marker 
          key={property.id || index} 
          position={[property.lat, property.lng]}
        >
          <Popup>
            <div className="min-w-[250px] p-2">
              {/* Property Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="text-3xl">🏠</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">
                    {property.title || property.address}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <span className="text-blue-500">📍</span>
                    <span>{property.address}</span>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-700">
                    <div className="flex items-center gap-1">
                      <span>🛏️</span>
                      <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>🚿</span>
                      <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
                
                {property.parking > 0 && (
                  <div className="flex items-center gap-1 text-sm text-gray-700">
                    <span>🚗</span>
                    <span>{property.parking} parking space{property.parking !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="flex items-center justify-between">
                <div className="text-xl font-bold text-blue-600">
                  ${property.rent_per_week || property.rent}/week
                </div>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  📅 Weekly
                </div>
              </div>

              {/* Description if available */}
              {property.description && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {property.description.substring(0, 120)}
                    {property.description.length > 120 && '...'}
                  </p>
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;