import React from 'react';
import styled from 'styled-components';

const PanelContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin: 20px;
  max-height: 400px;
  overflow-y: auto;
`;

const ResultsHeader = styled.h3`
  margin: 0 0 15px 0;
  color: #333;
  font-size: 18px;
`;

const PropertyCard = styled.div`
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 102, 204, 0.1);
    border-color: #0066cc;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const PropertyTitle = styled.h4`
  margin: 0 0 8px 0;
  color: #333;
  font-size: 16px;
`;

const PropertyDetail = styled.p`
  margin: 4px 0;
  color: #666;
  font-size: 14px;
`;

const PropertyPrice = styled.p`
  margin: 8px 0 0 0;
  color: #0066cc;
  font-weight: bold;
  font-size: 16px;
`;

const NoResults = styled.div`
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 40px 20px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: #666;
  padding: 40px 20px;
`;

const ResultsPanel = ({ properties, isLoading, onPropertySelect, selectedQuery }) => {
  if (isLoading) {
    return (
      <PanelContainer>
        <LoadingMessage>Searching for properties...</LoadingMessage>
      </PanelContainer>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <PanelContainer>
        <NoResults>
          {selectedQuery ? 
            `No properties found for "${selectedQuery}". Try adjusting your search criteria.` :
            'Enter a search query to find rental properties.'
          }
        </NoResults>
      </PanelContainer>
    );
  }

  return (
    <PanelContainer>
      <ResultsHeader>
        Found {properties.length} property{properties.length !== 1 ? 'ies' : ''}
        {selectedQuery && ` for "${selectedQuery}"`}
      </ResultsHeader>
      
      {properties.map((property, index) => (
        <PropertyCard 
          key={property.id || index}
          onClick={() => onPropertySelect && onPropertySelect(property)}
        >
          <PropertyTitle>{property.title || property.address}</PropertyTitle>
          <PropertyDetail>📍 {property.address}</PropertyDetail>
          <PropertyDetail>🛏️ {property.bedrooms} bed • 🚿 {property.bathrooms} bath</PropertyDetail>
          {property.parking && <PropertyDetail>🚗 {property.parking} parking space{property.parking !== 1 ? 's' : ''}</PropertyDetail>}
          {property.description && (
            <PropertyDetail>{property.description.substring(0, 120)}...</PropertyDetail>
          )}
          <PropertyPrice>${property.rent}/week</PropertyPrice>
        </PropertyCard>
      ))}
    </PanelContainer>
  );
};

export default ResultsPanel;