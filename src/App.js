import React, { useState, useEffect } from 'react';
import { getIcon } from './utils/icons';
import MapComponent from './components/MapComponent';
import ChatInterface from './components/ChatInterface';
import HomePage from './components/HomePage';
import Header from './components/Header';
import Login from './components/Login';
import NotificationToast from './components/NotificationToast';
import MapOverlay from './components/MapOverlay';
import { ContextualLoader, PropertyCardSkeleton, EmptyState } from './components/LoadingStates';
import { queryProperties, getTerritorialAuthorities, getSchoolsByTA, getRentalsBySchool, searchCommuteIsochrone, logout } from './services/api';
import CommuteSearchComponent from './components/CommuteSearchComponent';
import FavoritesList from './components/FavoritesList';
import FavoriteButton from './components/FavoriteButton';
import { useSessionManager } from './hooks/useSessionManager';
import { useNotifications } from './hooks/useNotifications';
import { useMapOverlay } from './hooks/useMapOverlay';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home' or 'results'
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState(null);
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [highlightedPropertyId, setHighlightedPropertyId] = useState(null);
  const [mapZoom, setMapZoom] = useState(12);
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [schoolZone, setSchoolZone] = useState(null);
  const [displayMode, setDisplayMode] = useState('properties'); // 'properties', 'schools', 'zones', 'territorialAuthorities', or 'commute'
  const [territorialAuthorities, setTerritorialAuthorities] = useState([]);
  const [selectedTA, setSelectedTA] = useState(null);
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  
  // Commute search states
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isMapClickMode, setIsMapClickMode] = useState(false);
  const [commuteSearchData, setCommuteSearchData] = useState(null);
  
  // Favorites states
  const [showFavoritesList, setShowFavoritesList] = useState(false);
  
  // Layout states
  const [leftPanelWidth, setLeftPanelWidth] = useState(300); // Default to 300px (smaller than before)
  
  // Use the session manager hook
  const { 
    sessionId, 
    isSessionValid, 
    isLoading: sessionLoading, 
    initializeSession 
  } = useSessionManager();
  
  // Use the notifications hook
  const {
    notifications,
    removeNotification,
    showSuccess,
    showError,
    showWarning
  } = useNotifications();
  
  // Use the map overlay hook for prominent alerts
  const {
    overlay,
    hideOverlay,
    showSuccess: showMapSuccess,
    showError: showMapError,
    showWarning: showMapWarning
  } = useMapOverlay();

  // Calculate optimal map center and zoom for all properties
  const calculateMapBounds = (properties) => {
    if (!properties || properties.length === 0) {
      return { center: [-36.8485, 174.7633], zoom: 12 }; // Default Auckland center
    }

    if (properties.length === 1) {
      const property = properties[0];
      return { center: [property.lat, property.lng], zoom: 15 };
    }

    // Calculate bounding box of all properties
    let minLat = properties[0].lat;
    let maxLat = properties[0].lat;
    let minLng = properties[0].lng;
    let maxLng = properties[0].lng;

    properties.forEach(property => {
      if (property.lat < minLat) minLat = property.lat;
      if (property.lat > maxLat) maxLat = property.lat;
      if (property.lng < minLng) minLng = property.lng;
      if (property.lng > maxLng) maxLng = property.lng;
    });

    // Calculate center point
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    // Calculate zoom level based on the span of coordinates
    const latSpan = maxLat - minLat;
    const lngSpan = maxLng - minLng;
    const maxSpan = Math.max(latSpan, lngSpan);

    // Determine zoom level - smaller spans need higher zoom
    let zoom;
    if (maxSpan > 0.5) zoom = 10;       // Very spread out
    else if (maxSpan > 0.2) zoom = 11;  // Spread out
    else if (maxSpan > 0.1) zoom = 12;  // Medium spread
    else if (maxSpan > 0.05) zoom = 13; // Close together
    else if (maxSpan > 0.02) zoom = 14; // Very close
    else zoom = 15;                     // Extremely close

    return { center: [centerLat, centerLng], zoom };
  };

  const handleSearch = async (query) => {
    // Switch to results page
    setCurrentPage('results');
    
    // Add user message
    const userMessage = { type: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    
    if (!sessionId || !isSessionValid) {
      const errorMessage = {
        type: 'ai',
        content: sessionLoading 
          ? "Session is being initialized. Please wait a moment and try again."
          : "Session expired or not initialized. Please refresh the page."
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Try to reinitialize session if not loading
      if (!sessionLoading) {
        await initializeSession();
      }
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await queryProperties(sessionId, query);
      
      if (response.success) {
        // Map the backend data format to frontend format
        const mappedProperties = response.properties.map(property => ({
          ...property,
          lat: property.latitude,
          lng: property.longitude
        }));
        setProperties(mappedProperties);
        
        // Add AI response
        const resultCount = mappedProperties.length;
        const aiMessage = {
          type: 'ai',
          content: resultCount > 0 
            ? `I found ${resultCount} ${resultCount === 1 ? 'property' : 'properties'} for you`
            : "No properties found"
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // Show search result notifications
        if (resultCount === 0) {
          showWarning(
            'No properties match your search criteria. Try adjusting your search terms or exploring different areas.',
            {
              title: 'No Results Found',
              duration: 6000,
              action: {
                label: 'Explore Zones',
                onClick: handleShowZones
              }
            }
          );
        } else if (resultCount >= 10) {
          showSuccess(
            `Excellent! Found ${resultCount} properties matching your search. Properties are displayed on the map and in the sidebar.`,
            {
              title: 'Great Results!',
              duration: 4000
            }
          );
        }
        
        // Calculate optimal map center and zoom for all results
        const mapBounds = calculateMapBounds(mappedProperties);
        setMapCenter(mapBounds.center);
        setMapZoom(mapBounds.zoom);
      } else {
        const errorMessage = {
          type: 'ai',
          content: "Sorry, I couldn't process your request."
        };
        setMessages(prev => [...prev, errorMessage]);
        setProperties([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePropertySelect = (property) => {
    setMapCenter([property.lat, property.lng]);
    setMapZoom(16); // Zoom closer when selecting individual property
    setSelectedPropertyId(property.id || property.address);
    setHighlightedPropertyId(property.id || property.address);
    
    // Scroll the property to the top of the visible area (same logic as map marker click)
    setTimeout(() => {
      const propertyId = property.id || property.address;
      const propertyElement = document.getElementById(`property-${propertyId}`);
      const scrollContainer = document.querySelector('.scrollbar-thin');
      
      if (propertyElement && scrollContainer) {
        const propertyOffsetTop = propertyElement.offsetTop;
        const containerPadding = 12; // p-3 = 12px
        const extraMargin = 180; // Additional margin to ensure full visibility including image
        const targetScrollTop = Math.max(0, propertyOffsetTop - containerPadding - extraMargin);
        
        scrollContainer.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
      }
    }, 100);
  };


  const handleMapMarkerClick = (property) => {
    setSelectedPropertyId(property.id || property.address);
    setHighlightedPropertyId(property.id || property.address);
    
    // Scroll the property card to the top of the visible area
    setTimeout(() => {
      const propertyId = property.id || property.address;
      const propertyElement = document.getElementById(`property-${propertyId}`);
      
      // Try multiple selectors to find the scroll container
      let scrollContainer = document.querySelector('.scrollbar-thin');
      if (!scrollContainer) {
        scrollContainer = document.querySelector('[style*="calc(100vh - 160px)"]');
      }
      if (!scrollContainer) {
        scrollContainer = document.querySelector('.overflow-y-auto');
      }
      
      if (propertyElement && scrollContainer) {
        // Use offsetTop for accurate positioning within the container
        const propertyOffsetTop = propertyElement.offsetTop;
        const containerPadding = 12; // p-3 = 12px
        const extraMargin = 180; // Additional margin to ensure full visibility including image
        const targetScrollTop = Math.max(0, propertyOffsetTop - containerPadding - extraMargin);
        
        scrollContainer.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
        
        // Add a brief highlight effect
        propertyElement.classList.add('animate-pulse');
        setTimeout(() => {
          propertyElement.classList.remove('animate-pulse');
        }, 2000);
      } else {
        // Fallback: use scrollIntoView if our method doesn't work
        if (propertyElement) {
          propertyElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center', // Use center instead of start for better visibility
            inline: 'nearest'
          });
        }
      }
    }, 150); // Slightly longer delay to ensure DOM is ready
  };

  const handleShowZones = async () => {
    // Switch to results page
    setCurrentPage('results');
    setDisplayMode('territorialAuthorities');
    
    // Clear previous results
    setProperties([]);
    setMessages([]);
    setSchoolInfo(null);
    setSchoolZone(null);
    setSelectedTA(null);
    setSchools([]);
    setSelectedSchool(null);
    
    if (!sessionId || !isSessionValid) {
      const errorMessage = {
        type: 'ai',
        content: sessionLoading 
          ? "Session is being initialized. Please wait a moment and try again."
          : "Session expired or not initialized. Please refresh the page."
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Try to reinitialize session if not loading
      if (!sessionLoading) {
        await initializeSession();
      }
      return;
    }
    
    try {
      setIsLoading(true);
      
      const taResponse = await getTerritorialAuthorities(sessionId);
      
      if (taResponse.success) {
        setTerritorialAuthorities(taResponse.territorialAuthorities);
        
        // Set default map center to Auckland
        setMapCenter([-36.8485, 174.7633]);
        setMapZoom(10); 
        
        // Add AI message
        const aiMessage = {
          type: 'ai',
          content: `Found ${taResponse.territorialAuthorities.length} territorial authorities. Click on a zone to view schools in that area.`
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = {
          type: 'ai',
          content: "Sorry, I couldn't load the territorial authorities."
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = {
        type: 'ai',
        content: "Sorry, there was an error loading the zones."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };


  const handleBackToHome = () => {
    setCurrentPage('home');
    setDisplayMode('properties');
    setProperties([]);
    setMessages([]);
    setMapCenter(null);
    setMapZoom(12);
    setSelectedPropertyId(null);
    setHighlightedPropertyId(null);
    setSchoolInfo(null);
    setSchoolZone(null);
    setTerritorialAuthorities([]);
    setSelectedTA(null);
    setSchools([]);
    setSelectedSchool(null);
  };

  // Handle clicking on a territorial authority zone
  const handleTerritorialAuthoritySelect = async (ta) => {
    setSelectedTA(ta);
    setDisplayMode('zones'); // Change to zones mode to show area and schools
    
    // Clear previous data
    setSchools([]);
    setSelectedSchool(null);
    setSchoolInfo(null);
    setSchoolZone(null);
    setProperties([]);
    
    if (!sessionId || !isSessionValid) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Call getSchoolsByTA with territorial authority name
      const schoolsResponse = await getSchoolsByTA(sessionId, ta.name);
      
      if (schoolsResponse.success) {
        // Clear properties initially - we're focusing on area and schools
        setProperties([]);
        
        // Set schools data - this is the main focus
        if (schoolsResponse.schools && Array.isArray(schoolsResponse.schools)) {
          setSchools(schoolsResponse.schools);
          console.log('Schools data:', schoolsResponse.schools);
        }
        
        // Set territory zone boundary for highlighting (if returned)
        console.log('Full schoolsResponse:', schoolsResponse);
        if (schoolsResponse.territoryZone) {
          setSchoolZone(schoolsResponse.territoryZone);
          console.log('Territory zone found:', schoolsResponse.territoryZone);
        } else if (schoolsResponse.areaZone) {
          setSchoolZone(schoolsResponse.areaZone);
          console.log('Area zone found:', schoolsResponse.areaZone);
        } else if (schoolsResponse.zone) {
          setSchoolZone(schoolsResponse.zone);
          console.log('Zone found:', schoolsResponse.zone);
        } else {
          console.log('No boundary data found in response');
          setSchoolZone(null);
        }
        
        // Set map center to TA location
        setMapCenter([ta.latitude, ta.longitude]);
        setMapZoom(11); // Zoom out a bit to see the whole area
        
        // Add AI message
        const schoolCount = schoolsResponse.schools?.length || 0;
        const aiMessage = {
          type: 'ai',
          content: `Showing ${ta.name} with ${schoolCount} schools. The area is highlighted on the map and school locations are marked.`
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = {
          type: 'ai',
          content: `Sorry, I couldn't find schools in ${ta.name}.`
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = {
        type: 'ai',
        content: "Sorry, there was an error loading schools for this area."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle clicking on a school
  const handleSchoolClick = async (school) => {
    console.log('=== SCHOOL CLICK DEBUG START ===');
    console.log('School clicked:', school);
    console.log('Session ID:', sessionId);
    console.log('Session valid:', isSessionValid);
    
    setSelectedSchool(school);
    setDisplayMode('properties'); // Switch to properties mode to show rentals
    
    if (!sessionId || !isSessionValid) {
      console.log('Session invalid - aborting school click');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('Setting loading to true');
      
      // Call getRentalsBySchool with school name
      console.log('Calling getRentalsBySchool with school name:', school.name);
      const rentalsResponse = await getRentalsBySchool(sessionId, school.name);
      console.log('getRentalsBySchool full response:', rentalsResponse);
      console.log('Rentals data:', rentalsResponse.rentals);
      console.log('School zone data:', rentalsResponse.schoolZone);
      
      if (rentalsResponse.success) {
        console.log('API call successful - processing data...');
        
        // Check if we have rentals data
        if (!rentalsResponse.rentals || !Array.isArray(rentalsResponse.rentals)) {
          console.warn('No rentals array found in response:', rentalsResponse.rentals);
        }
        
        // Map the rental data to properties format
        const mappedProperties = (rentalsResponse.rentals || []).map((rental, index) => {
          const mapped = {
            ...rental,
            lat: rental.latitude || rental.lat,
            lng: rental.longitude || rental.lng || rental.lon
          };
          console.log(`Mapping rental ${index}:`, rental, '-> mapped:', mapped);
          return mapped;
        });
        
        console.log('Final mapped properties:', mappedProperties);
        
        // Set school info for display (always update this)
        const schoolInfo = {
          name: school.name,
          latitude: school.latitude || school.lat,
          longitude: school.longitude || school.lng || school.lon
        };
        console.log('Setting school info:', schoolInfo);
        setSchoolInfo(schoolInfo);
        
        // Set school zone boundary
        if (rentalsResponse.schoolZone) {
          console.log('Setting school zone:', rentalsResponse.schoolZone);
          setSchoolZone(rentalsResponse.schoolZone);
        } else {
          console.log('No school zone data found in response');
          setSchoolZone(null);
        }
        
        // Handle properties - clear previous results when no properties found
        if (mappedProperties.length > 0) {
          // New school has properties - update normally
          console.log('New school has properties - updating display');
          setProperties(mappedProperties);
          
          // Set map center to school location
          const lat = school.latitude || school.lat;
          const lng = school.longitude || school.lng || school.lon;
          if (lat && lng) {
            const newCenter = [lat, lng];
            console.log('Setting map center to:', newCenter);
            setMapCenter(newCenter);
            setMapZoom(14);
          }
        } else {
          // New school has no properties - clear everything for cleaner UX
          console.log('New school has no properties - clearing all properties');
          setProperties([]);
          
          // Still center on the new school location if available
          const lat = school.latitude || school.lat;
          const lng = school.longitude || school.lng || school.lon;
          if (lat && lng) {
            const newCenter = [lat, lng];
            console.log('Setting map center to new school:', newCenter);
            setMapCenter(newCenter);
            setMapZoom(13);
          }
        }
        
        // Add simplified AI message
        const aiMessage = {
          type: 'ai',
          content: mappedProperties.length > 0 
            ? `Found ${mappedProperties.length} rental properties near ${school.name}.`
            : `No rental properties found near ${school.name}.`
        };
        console.log('Adding AI message:', aiMessage);
        setMessages(prev => [...prev, aiMessage]);
        
        // Show simplified notifications
        if (mappedProperties.length === 0) {
          // Simple "no properties found" message
          showMapWarning(
            `No properties found near ${school.name}`,
            {
              duration: 4000,
              actions: [
                {
                  label: 'Try Another School',
                  onClick: () => handleShowZones()
                }
              ]
            }
          );
        } else if (mappedProperties.length < 5) {
          showMapSuccess(
            `Found ${mappedProperties.length} ${mappedProperties.length === 1 ? 'property' : 'properties'} near ${school.name}`,
            {
              duration: 3000
            }
          );
        } else {
          showMapSuccess(
            `Found ${mappedProperties.length} properties near ${school.name}`,
            {
              duration: 3000
            }
          );
        }
        
        console.log('=== SCHOOL CLICK SUCCESS ===');
      } else {
        console.log('API call failed:', rentalsResponse.error);
        const errorMessage = {
          type: 'ai',
          content: `No rental properties found near ${school.name}.`
        };
        setMessages(prev => [...prev, errorMessage]);
        
        // Show unified "no properties" message
        showMapWarning(
          `No properties found near ${school.name}`,
          {
            duration: 4000,
            actions: [
              {
                label: 'Try Another School',
                onClick: () => handleShowZones()
              }
            ]
          }
        );
      }
    } catch (error) {
      console.error('Exception in handleSchoolClick:', error);
      const errorMessage = {
        type: 'ai',
        content: `No rental properties found near ${school.name}.`
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Show unified "no properties" message
      showMapWarning(
        `No properties found near ${school.name}`,
        {
          duration: 4000,
          actions: [
            {
              label: 'Try Another School',
              onClick: () => handleShowZones()
            }
          ]
        }
      );
    } finally {
      console.log('Setting loading to false');
      setIsLoading(false);
      console.log('=== SCHOOL CLICK DEBUG END ===');
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setShowLogin(false);
    // Save user data to localStorage for persistence
    localStorage.setItem('user', JSON.stringify(userData));
  };


  const handleLogout = async () => {
    try {
      // Call the new async logout function that clears session and creates new one
      await logout();
      
      setUser(null);
      localStorage.removeItem('user');
      
      // Reset app state
      setCurrentPage('home');
      setDisplayMode('properties');
      setProperties([]);
      setMessages([]);
      setMapCenter(null);
      setMapZoom(12);
      setSelectedPropertyId(null);
      
      // Show success notification
      showSuccess('Successfully logged out. New guest session created.');
      
    } catch (error) {
      console.error('Error during logout:', error);
      showError('Error during logout, but you have been signed out.');
    }
    setHighlightedPropertyId(null);
    setSchoolInfo(null);
    setSchoolZone(null);
    setSelectedLocation(null);
    setIsMapClickMode(false);
    setCommuteSearchData(null);
  };

  // Show commute search page
  const handleShowCommuteSearch = () => {
    setCurrentPage('results');
    setDisplayMode('commute');
    
    // Clear previous results
    setProperties([]);
    setMessages([]);
    setSchoolInfo(null);
    setSchoolZone(null);
    setSelectedTA(null);
    setSchools([]);
    setSelectedSchool(null);
    
    // Reset commute search state
    setSelectedLocation(null);
    setIsMapClickMode(false);
    setCommuteSearchData(null);
    
    // Set map to Auckland center for commute search
    setMapCenter([-36.8485, 174.7633]);
    setMapZoom(11);
  };

  // Handle map click for location selection
  const handleMapClick = (lngLat) => {
    if (isMapClickMode && displayMode === 'commute') {
      const location = {
        lng: lngLat.lng,
        lat: lngLat.lat,
        name: `位置 (${lngLat.lng.toFixed(4)}, ${lngLat.lat.toFixed(4)})`
      };
      
      setSelectedLocation(location);
      setIsMapClickMode(false);
      
      // Set map center to selected location
      setMapCenter([location.lat, location.lng]);
      setMapZoom(13);
      
      showMapSuccess(
        'Location selected! Set commute time and search for properties',
        { duration: 3000 }
      );
    }
  };

  // Handle commute search
  const handleCommuteSearch = async (lon, lat, minutes) => {
    setIsLoading(true);
    
    try {
      console.log('Starting commute search:', { lon, lat, minutes });
      
      const response = await searchCommuteIsochrone(lon, lat, minutes);
      console.log('Commute search response:', response);
      
      if (response.success) {
        const mappedProperties = response.rentals.map(rental => ({
          id: rental.id || rental.address,
          address: rental.address || 'Unknown Address',
          rent_per_week: rental.rent_per_week || 0,
          bedrooms: rental.bedrooms || 0,
          bathrooms: rental.bathrooms || 0,
          lat: rental.lat || 0,
          lng: rental.lon || rental.lng || 0,
        }));
        
        setProperties(mappedProperties);
        setCommuteSearchData(response);
        
        // Calculate map bounds for properties
        if (mappedProperties.length > 0) {
          const bounds = calculateMapBounds(mappedProperties);
          setMapCenter(bounds.center);
          setMapZoom(bounds.zoom);
        }
        
        const aiMessage = {
          type: 'ai',
          content: `Found ${mappedProperties.length} rental properties within ${minutes} minutes driving time from your selected location.`
        };
        setMessages(prev => [...prev, aiMessage]);
        
        if (mappedProperties.length === 0) {
          showMapWarning(
            `No properties found within ${minutes} minutes`,
            {
              duration: 4000,
              actions: [
                {
                  label: 'Try Different Time',
                  onClick: () => setIsMapClickMode(true)
                }
              ]
            }
          );
        } else if (mappedProperties.length < 5) {
          showMapSuccess(
            `Found ${mappedProperties.length} ${mappedProperties.length === 1 ? 'property' : 'properties'} within ${minutes} minutes`,
            { duration: 3000 }
          );
        } else {
          showMapSuccess(
            `Found ${mappedProperties.length} properties within ${minutes} minutes`,
            { duration: 3000 }
          );
        }
      } else {
        const errorMessage = {
          type: 'ai',
          content: 'Sorry, there was an error with your commute search. Please try again.'
        };
        setMessages(prev => [...prev, errorMessage]);
        
        showMapError(
          'Commute search failed',
          { duration: 4000 }
        );
      }
    } catch (error) {
      console.error('Commute search error:', error);
      const errorMessage = {
        type: 'ai',
        content: 'Sorry, there was an error with your commute search. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
      
      showMapError(
        'Commute search failed',
        { duration: 4000 }
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle panel resizing
  const handleMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftPanelWidth;

    const handleMouseMove = (e) => {
      const newWidth = startWidth + (e.clientX - startX);
      // Set minimum and maximum widths
      const minWidth = 250;
      const maxWidth = window.innerWidth * 0.6; // Maximum 60% of window width
      
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setLeftPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  // Check for saved user data on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const getResultText = () => {
    if (sessionLoading) return "Initializing session...";
    if (isLoading) {
      switch (displayMode) {
        case 'territorialAuthorities': return "Loading zones...";
        case 'zones': return "Loading schools...";
        default: return "Searching...";
      }
    }
    if (!isSessionValid) return "Session expired";
    
    switch (displayMode) {
      case 'territorialAuthorities':
        if (!Array.isArray(territorialAuthorities) || territorialAuthorities.length === 0) return "No zones found";
        return `Found ${territorialAuthorities.length} territorial zones`;
      case 'zones':
        if (!Array.isArray(schools) || schools.length === 0) return "No schools found";
        return `Found ${schools.length} schools in ${selectedTA?.name || 'selected zone'}`;
      default:
        const propertyCount = Array.isArray(properties) ? properties.length : 0;
        const schoolCount = Array.isArray(schools) ? schools.length : 0;
        
        if (selectedTA && (propertyCount > 0 || schoolCount > 0)) {
          return `${selectedTA.name}: ${propertyCount} properties, ${schoolCount} schools`;
        } else if (propertyCount === 0) {
          return selectedSchool ? `No properties near ${selectedSchool.name}` : "No properties found";
        }
        
        return selectedSchool 
          ? `${propertyCount} ${propertyCount === 1 ? 'property' : 'properties'} near ${selectedSchool.name}`
          : `Found ${propertyCount} ${propertyCount === 1 ? 'property' : 'properties'}`;
    }
  };

  // Show loading state while session is initializing
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing session...</p>
        </div>
      </div>
    );
  }

  // Show homepage or results based on current page
  if (currentPage === 'home') {
    return (
      <>
        <Header
          onShowFavorites={() => setShowFavoritesList(true)}
          onShowLogin={() => setShowLogin(true)}
          onLogout={handleLogout}
          onNavigateHome={() => setCurrentPage('home')}
          currentPage={currentPage}
        />
        <HomePage 
          onSearch={handleSearch} 
          onShowZones={handleShowZones} 
          onShowCommuteSearch={handleShowCommuteSearch}
          isLoading={isLoading} 
          user={user} 
          onShowLogin={() => setShowLogin(true)} 
          onLogout={handleLogout} 
        />
        {showLogin && <Login onLogin={handleLogin} onClose={() => setShowLogin(false)} />}
        <FavoritesList 
          isVisible={showFavoritesList} 
          onClose={() => setShowFavoritesList(false)} 
        />
        <NotificationToast notifications={notifications} onDismiss={removeNotification} />
        {overlay && (
          <MapOverlay 
            message={overlay.message}
            type={overlay.type}
            duration={overlay.duration}
            actions={overlay.actions}
            onDismiss={hideOverlay}
          />
        )}
      </>
    );
  }

  // Results page
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
      {/* Universal Header */}
      <Header
        onShowFavorites={() => setShowFavoritesList(true)}
        onShowLogin={() => setShowLogin(true)}
        onLogout={handleLogout}
        onNavigateHome={handleBackToHome}
        currentPage={currentPage}
      />
      
      {/* Results Content */}
      <div className="flex-1 flex lg:flex-row overflow-hidden">
        
        {/* Results Header for mobile */}
        <div className="lg:hidden bg-white border-b border-gray-200 flex-shrink-0">
          <div className="px-4 py-3">
            <p className="text-sm text-gray-600">{getResultText()}</p>
          </div>
        </div>

      {/* Left Panel - Listings */}
      <div 
        className="bg-white shadow-2xl lg:shadow-xl border-r border-gray-200 flex flex-col z-20 lg:flex-none flex-1"
        style={{ width: window.innerWidth >= 1024 ? `${leftPanelWidth}px` : '100%' }}
      >
        {/* Results Info */}
        <div className="hidden lg:block px-6 py-4 border-b border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-700 font-medium">{getResultText()}</p>
        </div>
        
        {/* Content Container */}
        <div 
          className={`flex-1 overflow-y-auto scrollbar-thin ${
            displayMode === 'zones'
              ? 'scrollbar-thumb-green-300 scrollbar-track-gray-100 hover:scrollbar-thumb-green-400' 
              : displayMode === 'territorialAuthorities'
              ? 'scrollbar-thumb-purple-300 scrollbar-track-gray-100 hover:scrollbar-thumb-purple-400'
              : 'scrollbar-thumb-blue-300 scrollbar-track-gray-100 hover:scrollbar-thumb-blue-400'
          }`}
          style={{height: 'calc(100vh - 160px)'}}
        >
          <div className="p-3 space-y-2">
            {displayMode === 'commute' ? (
              // Commute Search Display
              <CommuteSearchComponent
                onSearch={handleCommuteSearch}
                isLoading={isLoading}
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
                isMapClickMode={isMapClickMode}
                setIsMapClickMode={setIsMapClickMode}
              />
            ) : displayMode === 'territorialAuthorities' ? (
              // Territorial Authorities Display
              isLoading ? (
                <ContextualLoader 
                  type="zone" 
                  message="Loading territorial authorities..." 
                  submessage="Finding zones with school data"
                />
              ) : !Array.isArray(territorialAuthorities) || territorialAuthorities.length === 0 ? (
                <EmptyState 
                  type="zone" 
                  title="No territorial zones found" 
                  message="Zone data might be temporarily unavailable. Please try again."
                  action={{
                    label: 'Retry',
                    icon: 'arrow',
                    onClick: handleShowZones
                  }}
                />
              ) : (
                territorialAuthorities.map((ta, index) => (
                  <div 
                    key={ta.id || index}
                    onClick={() => handleTerritorialAuthoritySelect(ta)}
                    className="bg-white border rounded-2xl hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden border-purple-200 hover:border-purple-400 transform hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] active:translate-y-0"
                  >
                    {/* TA Header */}
                    <div className="h-20 bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center relative">
                      <div className="text-2xl">🗺️</div>
                      <div className="absolute top-2 right-2">
                        <div className="bg-purple-500 text-white rounded-full p-1">
                          {getIcon('mapPin', 'sm', 'white')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-purple-900 mb-2">
                        {ta.name}
                      </h3>
                      <div className="text-sm text-gray-600">
                        Click to view schools in this territorial authority
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : displayMode === 'zones' ? (
              // Schools in Selected TA Display
              isLoading ? (
                <ContextualLoader 
                  type="school" 
                  message="Loading schools..." 
                  submessage={`Finding schools in ${selectedTA?.name || 'selected area'}`}
                />
              ) : !Array.isArray(schools) || schools.length === 0 ? (
                <EmptyState 
                  type="school" 
                  title="No schools found" 
                  message={`No schools available in ${selectedTA?.name || 'this area'}. Try selecting a different territorial authority.`}
                  action={{
                    label: 'Back to Zones',
                    icon: 'arrow',
                    onClick: handleShowZones
                  }}
                />
              ) : (
                schools.map((school, index) => (
                  <div 
                    key={school.id || index}
                    onClick={() => handleSchoolClick(school)}
                    className="bg-white border rounded-2xl hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden border-green-200 hover:border-green-400 transform hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] active:translate-y-0"
                  >
                    {/* School Header */}
                    <div className="h-20 bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center relative">
                      <div className="text-2xl">🎓</div>
                      <div className="absolute top-2 right-2">
                        <div className="bg-green-500 text-white rounded-full p-1">
                          {getIcon('graduation', 'sm', 'white')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-green-900 mb-2">
                        {school.name}
                      </h3>
                      <div className="text-sm text-gray-600">
                        Click to view rental properties near this school
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : (
              // Properties Display
              isLoading ? (
                <div className="space-y-2">
                  <ContextualLoader 
                    type="search" 
                    message="Searching for properties..." 
                    submessage={selectedSchool ? `Near ${selectedSchool.name}` : "Loading rental data"}
                  />
                  {/* Show skeleton cards while loading */}
                  {[...Array(3)].map((_, i) => (
                    <PropertyCardSkeleton key={i} />
                  ))}
                </div>
              ) : properties.length === 0 ? (
                <EmptyState 
                  type="search" 
                  title="No properties found" 
                  message={selectedSchool 
                    ? `No rental properties available near ${selectedSchool.name}. This area might have limited rental options.`
                    : "Try searching with different criteria or explore other areas."
                  }
                  action={{
                    label: selectedSchool ? 'Try Another School' : 'Explore Zones',
                    icon: selectedSchool ? 'graduation' : 'mapPin',
                    onClick: selectedSchool ? handleShowZones : handleShowZones
                  }}
                />
              ) : (
                <>
                  {properties.map((property, index) => {
                    const propertyId = property.id || property.address;
                    const isHighlighted = highlightedPropertyId === propertyId;
                    const isSelected = selectedPropertyId === propertyId;
                    
                    return (
                  <div 
                    key={property.id || index}
                    id={`property-${propertyId}`}
                    className={`bg-white rounded-2xl transition-all duration-300 group overflow-hidden relative transform hover:scale-[1.02] ${
                      isSelected 
                        ? 'shadow-xl ring-2 ring-blue-300 border-2 border-blue-400 translate-y-[-2px]' 
                        : isHighlighted
                          ? 'shadow-lg ring-1 ring-blue-200 border border-blue-300'
                          : 'shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 hover:-translate-y-1'
                    }`}
                  >

                    {/* Property Image - Non-clickable area */}
                    <div className={`h-36 bg-gradient-to-br flex items-center justify-center transition-all duration-300 relative overflow-hidden ${
                      isSelected 
                        ? 'from-blue-100 to-indigo-200 shadow-inner' 
                        : isHighlighted
                          ? 'from-blue-50 to-indigo-100'
                          : 'from-gray-100 to-gray-200 group-hover:from-blue-50 group-hover:to-indigo-100 group-hover:shadow-inner'
                    }`}>
                      {getIcon('home', 'xl', isSelected ? 'primary' : 'muted')}
                      
                      {/* Status and type badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                          Available Now
                        </span>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium shadow-sm transition-colors ${
                          isSelected 
                            ? 'bg-blue-500 text-white shadow-blue-200' 
                            : 'bg-white/90 text-gray-700 backdrop-blur-sm'
                        }`}>
                          {property.property_type || 'Rental'}
                        </span>
                      </div>

                      {/* Favorite button */}
                      <div className="absolute top-3 right-3">
                        <FavoriteButton 
                          listingId={property.id || property.listing_id || (index % 5) + 1}
                          size="small"
                          className="shadow-md hover:shadow-lg"
                          onToggle={(listingId, isFavorited, result) => {
                            if (result.success) {
                              showSuccess(isFavorited ? 'Added to favorites' : 'Removed from favorites');
                            } else {
                              showError('Failed to update favorites. Property might not exist in database.');
                            }
                          }}
                        />
                      </div>

                      
                      {/* Subtle shine effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                    </div>
                    
                    {/* Property Info - Clickable area */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200" 
                      onClick={() => handlePropertySelect(property)}
                      title="Click to view on map"
                    >
                      {/* Price Section - More prominent */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className={`text-2xl font-bold transition-colors ${
                            isSelected ? 'text-blue-700' : 'text-gray-900'
                          }`}>
                            ${property.rent_per_week}
                          </div>
                          <div className="text-sm text-gray-500 font-medium">per week</div>
                        </div>
                      </div>

                      {/* Title with region */}
                      <div className="mb-3">
                        <h3 className={`font-semibold text-sm leading-tight mb-1 line-clamp-2 ${
                          isSelected ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {property.title || property.address}
                        </h3>
                        {property.region && (
                          <div className="text-xs text-gray-500 font-medium">
                            {property.region} {property.suburb && `• ${property.suburb}`}
                          </div>
                        )}
                      </div>
                      
                      {/* Property details - enhanced layout */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100">
                          {getIcon('bed', 'sm', 'secondary')}
                          <span className="font-semibold text-sm text-gray-700">{property.bedrooms}</span>
                          <span className="text-xs text-gray-500">bed{property.bedrooms !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100">
                          {getIcon('bath', 'sm', 'secondary')}
                          <span className="font-semibold text-sm text-gray-700">{property.bathrooms}</span>
                          <span className="text-xs text-gray-500">bath{property.bathrooms !== 1 ? 's' : ''}</span>
                        </div>
                        {property.parking > 0 && (
                          <div className="flex items-center gap-1 px-3 py-1.5 bg-green-50 rounded-lg text-green-700 transition-colors hover:bg-green-100">
                            {getIcon('car', 'sm', 'success')}
                            <span className="font-semibold text-sm">{property.parking}</span>
                            <span className="text-xs">park</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Property amenities hint */}
                      {(property.parking > 0 || property.bedrooms >= 3) && (
                        <div className="mb-2 flex items-center gap-1 text-xs text-green-600 bg-green-50 rounded-full px-2 py-1">
                          {getIcon('checkCircle', 'xs', 'success')}
                          <span className="font-medium">
                            {property.parking > 0 && 'Parking'}
                            {property.parking > 0 && property.bedrooms >= 3 && ' • '}
                            {property.bedrooms >= 3 && 'Family Size'}
                          </span>
                        </div>
                      )}
                      
                      {/* Action button */}
                      <div className="border-t border-gray-100 pt-3 mt-1">
                        <button 
                          className={`w-full py-2.5 px-4 rounded-xl font-medium transition-all duration-200 border ${
                            isSelected 
                              ? 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100' 
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                          }`}
                        >
                          Details
                        </button>
                      </div>
                    </div>
                    </div>
                    );
                  })}
                </>
              )
            )}
          </div>
        </div>
      </div>

      {/* Resizable Divider */}
      <div 
        className="hidden lg:block w-1 bg-gray-300 hover:bg-blue-400 cursor-col-resize transition-colors duration-200 relative group"
        onMouseDown={handleMouseDown}
        title="Drag to resize panels"
      >
        {/* Visual indicator */}
        <div className="absolute inset-y-0 left-0 w-full bg-blue-500 opacity-0 group-hover:opacity-30 transition-opacity duration-200"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-gray-400 rounded group-hover:bg-blue-500 transition-colors duration-200"></div>
      </div>

      {/* Right Panel - Map */}
      <div className="flex-1 relative bg-gray-100 h-full overflow-hidden">
        <MapComponent
          properties={properties}
          center={mapCenter}
          zoom={mapZoom}
          onMarkerClick={handleMapMarkerClick}
          selectedPropertyId={selectedPropertyId}
          schoolInfo={schoolInfo}
          schoolZone={schoolZone}
          displayMode={displayMode}
          territorialAuthorities={territorialAuthorities}
          schools={schools}
          selectedSchool={selectedSchool}
          selectedTA={selectedTA}
          onTerritorialAuthorityClick={handleTerritorialAuthoritySelect}
          onSchoolClick={handleSchoolClick}
          onMapClick={handleMapClick}
          isMapClickMode={isMapClickMode}
          selectedLocation={selectedLocation}
          commuteSearchData={commuteSearchData}
        />
        
        <ChatInterface
          onSearch={handleSearch}
          isLoading={isLoading}
          messages={messages}
        />
      </div>
      </div>
      
      {showLogin && <Login onLogin={handleLogin} onClose={() => setShowLogin(false)} />}
      <FavoritesList 
        isVisible={showFavoritesList} 
        onClose={() => setShowFavoritesList(false)} 
      />
      <NotificationToast notifications={notifications} onDismiss={removeNotification} />
      {overlay && (
        <MapOverlay 
          message={overlay.message}
          type={overlay.type}
          duration={overlay.duration}
          actions={overlay.actions}
          onDismiss={hideOverlay}
        />
      )}
    </div>
  );
}

export default App;
