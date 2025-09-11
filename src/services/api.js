const API_BASE_URL = 'http://localhost:8000';

// Authentication related functions
export const signup = async (email, password, sessionId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
        session_id: sessionId
      }),
    });

    // Handle CORS/Network errors
    if (!response) {
      throw new Error('Network error - please check if backend is running');
    }

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (parseError) {
        // If we can't parse the error response, use the status
        console.warn('Could not parse error response:', parseError);
      }
      
      // Even if backend has errors, the user might be created
      // Check for specific signup success patterns
      if (response.status === 500) {
        console.warn('Backend returned 500 but user might be created. Please try logging in.');
        return {
          success: false,
          error: 'Account creation encountered an error. If this email is new, please try logging in.',
          possibleSuccess: true
        };
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Signup response:', data);
    
    return {
      success: true,
      userId: data.user_id
    };

  } catch (error) {
    console.error("Signup API error:", error);
    
    // Handle network/CORS errors
    if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
      return {
        success: false,
        error: 'Connection error. Please ensure backend is running and try again.',
        networkError: true
      };
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

export const login = async (email, password, sessionId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
        session_id: sessionId
      }),
    });

    // Handle CORS/Network errors
    if (!response) {
      throw new Error('Network error - please check if backend is running');
    }

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Login response:', data);
    
    // Store access token in localStorage
    localStorage.setItem('ask4rent_access_token', data.access_token);
    localStorage.setItem('ask4rent_user', JSON.stringify(data.user));
    
    return {
      success: true,
      accessToken: data.access_token,
      tokenType: data.token_type,
      user: data.user
    };

  } catch (error) {
    console.error("Login API error:", error);
    
    // Handle network/CORS errors
    if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
      return {
        success: false,
        error: 'Connection error. Please check your internet connection and try again.',
        networkError: true
      };
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Get stored access token
export const getAccessToken = () => {
  return localStorage.getItem('ask4rent_access_token');
}

// Get stored user info
export const getStoredUser = () => {
  try {
    const userJson = localStorage.getItem('ask4rent_user');
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error("Error parsing stored user:", error);
    return null;
  }
}

// Check if user is logged in
export const isLoggedIn = () => {
  const token = getAccessToken();
  const user = getStoredUser();
  return !!(token && user);
}

// Logout function
export const logout = async () => {
  // Remove user authentication data
  localStorage.removeItem('ask4rent_access_token');
  localStorage.removeItem('ask4rent_user');
  
  // Clear the old session to ensure favorites are reset
  clearSession();
  
  // Generate a new session for guest browsing
  try {
    await getSession();
    console.log('New guest session created after logout');
    
    // Trigger a custom event to notify components about logout
    window.dispatchEvent(new CustomEvent('userLoggedOut'));
  } catch (error) {
    console.error('Error creating new session after logout:', error);
  }
}

export const getSession = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/onStartUpSession`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const sessionId = await response.text();
    const cleanSessionId = sessionId.replace(/"/g, '');
    console.log('Generated session ID:', cleanSessionId);
    
    const sessionData = {
      sessionId: cleanSessionId,
      timestamp: Date.now(),
      lastActivity: Date.now()
    };
    localStorage.setItem('ask4rent_session', JSON.stringify(sessionData));
    
    return {
      success: true,
      sessionId: cleanSessionId
    };

  } catch (error) {
    console.error("Get Session API error: ", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export const refreshSession = async (sessionId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/onReflashSession?session_id=${sessionId}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Update last activity timestamp in localStorage
    const sessionData = JSON.parse(localStorage.getItem('ask4rent_session') || '{}');
    sessionData.lastActivity = Date.now();
    localStorage.setItem('ask4rent_session', JSON.stringify(sessionData));
    
    console.log('Session refreshed for ID:', sessionId);
    return {
      success: true,
      sessionId: sessionId
    };
  } catch (error) {
    console.error("Refresh Session API error: ", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Get session from localStorage with expiration check
export const getStoredSession = () => {
  try {
    const sessionData = JSON.parse(localStorage.getItem('ask4rent_session') || '{}');
    const currentTime = Date.now();
    const fiveMinutesInMs = 5 * 60 * 1000; // 5 minutes
    
    if (sessionData.sessionId &&
        sessionData.lastActivity && 
        (currentTime - sessionData.lastActivity) < fiveMinutesInMs) {
      return sessionData.sessionId;
    }
    
    // Session expired or doesn't exist
    localStorage.removeItem('ask4rent_session');
    return null;
  } catch (error) {
    console.error("Error getting stored session:", error);
    localStorage.removeItem('ask4rent_session');
    return null;
  }
}

// Update last activity timestamp
export const updateLastActivity = () => {
  try {
    const sessionData = JSON.parse(localStorage.getItem('ask4rent_session') || '{}');
    if (sessionData.sessionId) {
      sessionData.lastActivity = Date.now();
      localStorage.setItem('ask4rent_session', JSON.stringify(sessionData));
    }
  } catch (error) {
    console.error("Error updating last activity:", error);
  }
}

// Clear session from localStorage
export const clearSession = () => {
  localStorage.removeItem('ask4rent_session');
}

export const queryProperties = async (sessionId, query) => {
  try {
    // Send the natural language query using RentQuery format
    const requestData = {
      session_id: sessionId,
      text: query
    };

    const response = await fetch(`${API_BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Query response:', data);
    
    return {
      success: true,
      properties: data || [],
    };

  } catch (error) {
    console.error("Query API error:", error);
    return {
      success: false,
      error: error.message,
      properties: []
    };
  }
}

export const querySchoolZone = async (sessionId, schoolName) => {
  try {
    const requestData = {
      session_id: sessionId,
      school_name: schoolName
    };

    const response = await fetch(`${API_BASE_URL}/querySchoolZone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('QuerySchoolZone API response:', data);
    
    // The API returns GeoJSON FeatureCollection format
    // Transform it to match the expected frontend format
    if (data && data.type === 'FeatureCollection' && data.features && data.features.length > 0) {
      const feature = data.features[0];
      const schoolName = feature.properties.school_name;
      
      return {
        success: true,
        school: {
          name: schoolName,
          // Note: Real school details (address, coordinates, etc.) would need to come from a schools API
          // For now, just return the name from the zone data
        },
        zone: {
          type: 'FeatureCollection',
          features: data.features
        }
      };
    } else {
      return {
        success: false,
        error: `School zone for "${schoolName}" not found`,
        school: null,
        zone: null
      };
    }

  } catch (error) {
    console.error("School Zone API error:", error);
    return {
      success: false,
      error: error.message,
      school: null,
      zone: null
    };
  }
}

// Get territorial authorities (for Zone button functionality)
export const getTerritorialAuthorities = async (sessionId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/query/getTerritorialAuthorities?session_id=${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle the specific API response format
    let territorialAuthorities = [];
    
    if (data.items && Array.isArray(data.items)) {
      // Process the API response format
      territorialAuthorities = data.items.map((item, index) => ({
        id: index,
        name: item.territorial_authority,
        school_count: item.school_count,
        latitude: item.lat,
        longitude: item.lon,
        // For compatibility with existing code
        properties: {
          name: item.territorial_authority,
          school_count: item.school_count
        }
      }));
    } else if (Array.isArray(data)) {
      // If data is already an array
      territorialAuthorities = data;
    } else {
      // Fallback
      territorialAuthorities = data || [];
    }
    
    return {
      success: true,
      territorialAuthorities: territorialAuthorities,
    };

  } catch (error) {
    console.error("GetTerritorialAuthorities API error:", error);
    return {
      success: false,
      error: error.message,
      territorialAuthorities: []
    };
  }
}

// Get schools by territorial authority (when clicking on a zone)
export const getSchoolsByTA = async (sessionId, taName) => {
  try {
    const requestData = {
      session_id: sessionId,
      ta_name: taName
    };

    const response = await fetch(`${API_BASE_URL}/query/getSchoolsByTA`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('GetSchoolsByTA API response:', data);
    
    // Handle different possible response formats
    let schools = [];
    let territoryZone = null;
    
    if (data.schools && Array.isArray(data.schools)) {
      schools = data.schools;
    } else if (Array.isArray(data)) {
      schools = data;
    }
    
    // Check for territory boundary data
    if (data.territoryZone) {
      territoryZone = data.territoryZone;
    } else if (data.zone) {
      territoryZone = data.zone;
    } else if (data.boundary) {
      territoryZone = data.boundary;
    }
    
    return {
      success: true,
      schools: schools,
      territoryZone: territoryZone,
      taName: taName
    };

  } catch (error) {
    console.error("GetSchoolsByTA API error:", error);
    return {
      success: false,
      error: error.message,
      schools: [],
      taName: taName
    };
  }
}

// Get rentals by school (when clicking on a school)
export const getRentalsBySchool = async (sessionId, schoolNameOrData) => {
  console.log('=== getRentalsBySchool API DEBUG START ===');
  console.log('Function called with:', { sessionId, schoolNameOrData });
  
  try {
    let requestData;
    
    // Handle different parameter types
    if (typeof schoolNameOrData === 'string') {
      // If it's a string, treat as school name
      requestData = {
        session_id: sessionId,
        school_name: schoolNameOrData
      };
      console.log('Using school_name parameter format');
    } else {
      // If it's an object, treat as school data (legacy)
      requestData = {
        session_id: sessionId,
        school: schoolNameOrData
      };
      console.log('Using legacy school object format');
    }

    console.log('Request data being sent:', requestData);
    console.log('API endpoint:', `${API_BASE_URL}/query/getRentalsBySchool`);

    const response = await fetch(`${API_BASE_URL}/query/getRentalsBySchool`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error text:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data = await response.json();
    console.log('Raw API response data:', data);
    console.log('Response structure check:');
    console.log('- data.rentals:', data.rentals);
    console.log('- data.properties:', data.properties);
    console.log('- data.houses:', data.houses);
    console.log('- data.schoolZone:', data.schoolZone);
    console.log('- data.zone:', data.zone);
    console.log('- data.school:', data.school);
    console.log('- data.school_name:', data.school_name);
    
    // Process school zone data - convert single Polygon to FeatureCollection format if needed
    let schoolZone = data.schoolZone || data.zone || null;
    if (schoolZone && schoolZone.type === 'Polygon') {
      // Convert single Polygon to FeatureCollection format
      schoolZone = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: schoolZone,
            properties: {
              school_name: data.school_name || schoolNameOrData
            }
          }
        ]
      };
      console.log('Converted Polygon to FeatureCollection:', schoolZone);
    }

    const result = {
      success: true,
      rentals: data.rentals || data.properties || data.houses || [],
      schoolZone: schoolZone,
      school: data.school || { name: data.school_name || schoolNameOrData }
    };
    
    console.log('Processed result being returned:', result);
    console.log('=== getRentalsBySchool API DEBUG END ===');
    
    return result;

  } catch (error) {
    console.error("GetRentalsBySchool API error:", error);
    console.error("Error stack:", error.stack);
    
    const errorResult = {
      success: false,
      error: error.message,
      rentals: [],
      schoolZone: null,
      school: schoolNameOrData
    };
    
    console.log('Error result being returned:', errorResult);
    console.log('=== getRentalsBySchool API DEBUG END (ERROR) ===');
    
    return errorResult;
  }
}

// Commute search - driving isochrone (new function)
export const searchCommuteIsochrone = async (lon, lat, minutes = 30) => {
  console.log('=== searchCommuteIsochrone API DEBUG START ===');
  console.log('Function called with:', { lon, lat, minutes });
  
  try {
    const url = `${API_BASE_URL}/commute/driving-isochrone?lon=${lon}&lat=${lat}&minutes=${minutes}`;
    console.log('API URL:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error text:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data = await response.json();
    console.log('Raw API response data:', data);
    
    const result = {
      success: true,
      rentals: data.rentals || [],
      isochrone: data.isochrone || null,
      searchLocation: { lon, lat },
      searchMinutes: minutes
    };
    
    console.log('Processed result being returned:', result);
    console.log('=== searchCommuteIsochrone API DEBUG END ===');
    
    return result;

  } catch (error) {
    console.error("Commute Isochrone API error:", error);
    console.error("Error stack:", error.stack);
    
    const errorResult = {
      success: false,
      error: error.message,
      rentals: [],
      isochrone: null,
      searchLocation: { lon, lat },
      searchMinutes: minutes
    };
    
    console.log('Error result being returned:', errorResult);
    console.log('=== searchCommuteIsochrone API DEBUG END (ERROR) ===');
    
    return errorResult;
  }
}

// Photon API for place search and geocoding (frontend only)
export const searchPlaces = async (query, limit = 5) => {
  if (!query || query.length < 2) {
    return {
      success: true,
      places: []
    };
  }
  
  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=${limit}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Process Photon GeoJSON response
    const places = data.features ? data.features.map((feature, index) => ({
      id: index,
      name: feature.properties.name || feature.properties.street || 'Unknown',
      display_name: [
        feature.properties.name,
        feature.properties.street,
        feature.properties.city,
        feature.properties.state,
        feature.properties.country
      ].filter(Boolean).join(', '),
      lat: feature.geometry.coordinates[1],
      lon: feature.geometry.coordinates[0],
      type: feature.properties.osm_type || 'place',
      category: feature.properties.osm_key || 'place'
    })) : [];
    
    return {
      success: true,
      places: places
    };

  } catch (error) {
    console.error("Photon Place Search API error:", error);
    return {
      success: false,
      error: error.message,
      places: []
    };
  }
}

// Favorites API functions
export const addFavorite = async (sessionId, listingId) => {
  try {
    const requestData = {
      session_id: sessionId,
      listing_id: listingId
    };

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header if user is logged in
    const accessToken = getAccessToken();
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/favorites/add`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      listingId: data.listing_id,
      result: data.Result
    };

  } catch (error) {
    console.error("Add Favorite API error:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const removeFavorite = async (sessionId, listingId) => {
  try {
    const requestData = {
      session_id: sessionId,
      listing_id: listingId
    };

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header if user is logged in
    const accessToken = getAccessToken();
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/favorites/remove`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      listingId: data.listing_id,
      result: data.Result
    };

  } catch (error) {
    console.error("Remove Favorite API error:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const getFavorites = async (sessionId) => {
  try {
    const requestData = {
      session_id: sessionId,
      listing_id: 0 // Required by backend but not used for get operation
    };

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header if user is logged in
    const accessToken = getAccessToken();
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/favorites/get`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      // Handle token expiration
      if (response.status === 401 || response.status === 403) {
        console.log('Token expired or invalid, clearing authentication');
        localStorage.removeItem('ask4rent_access_token');
        localStorage.removeItem('ask4rent_user');
        // Retry without token
        delete headers['Authorization'];
        const retryResponse = await fetch(`${API_BASE_URL}/favorites/get`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(requestData),
        });
        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          return {
            success: true,
            favorites: Array.isArray(retryData) ? retryData : []
          };
        }
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      favorites: Array.isArray(data) ? data : []
    };

  } catch (error) {
    console.error("Get Favorites API error:", error);
    return {
      success: false,
      error: error.message,
      favorites: []
    };
  }
};

