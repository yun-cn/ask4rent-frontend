const API_BASE_URL = 'http://localhost:8000';


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
    // Send the natural language query directly to AI assistant
    const requestData = {
      session_id: sessionId,
      message: query
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

// Helper function to parse natural language queries into structured format
const parseNaturalLanguageQuery = (query) => {
  const lowerQuery = query.toLowerCase();
  const queryData = {
    school_name: null,
    min_price: null,
    max_price: null
  };

  // Extract school name
  const schoolPatterns = [
    /near\s+([^,]+?)(?:\s+under|\s+below|\s*$)/i,
    /close to\s+([^,]+?)(?:\s+under|\s+below|\s*$)/i,
    /around\s+([^,]+?)(?:\s+under|\s+below|\s*$)/i
  ];

  for (const pattern of schoolPatterns) {
    const match = query.match(pattern);
    if (match) {
      queryData.school_name = match[1].trim();
      break;
    }
  }

  // Extract price constraints
  const pricePatterns = [
    /under\s*\$?(\d+)/i,
    /below\s*\$?(\d+)/i,
    /less than\s*\$?(\d+)/i,
    /maximum\s*\$?(\d+)/i,
    /max\s*\$?(\d+)/i
  ];

  for (const pattern of pricePatterns) {
    const match = query.match(pattern);
    if (match) {
      queryData.max_price = parseInt(match[1]);
      break;
    }
  }

  // Extract minimum price
  const minPricePatterns = [
    /over\s*\$?(\d+)/i,
    /above\s*\$?(\d+)/i,
    /more than\s*\$?(\d+)/i,
    /minimum\s*\$?(\d+)/i,
    /min\s*\$?(\d+)/i
  ];

  for (const pattern of minPricePatterns) {
    const match = query.match(pattern);
    if (match) {
      queryData.min_price = parseInt(match[1]);
      break;
    }
  }

  console.log('Parsed query data:', queryData);
  return queryData;
}