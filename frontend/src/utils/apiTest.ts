import api, { API_BASE_URL } from '../services/api';

export const testApiConnection = async (): Promise<boolean> => {
  try {
    console.log('Attempting to connect to:', API_BASE_URL);
    
    // Try direct fetch to avoid React Router interference
    const response = await fetch(`${API_BASE_URL}/Books/featured?count=1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    
    const status = response.status;
    console.log('Response status:', status);
    
    // Try to parse JSON if possible
    let data;
    try {
      data = await response.json();
      console.log('Response data:', data);
    } catch (e) {
      console.log('Could not parse response as JSON', await response.text());
    }
    
    // Even a 401 Unauthorized is OK - it means the endpoint exists
    return status === 200 || status === 401;
  } catch (error: any) {
    console.error('API connection test failed:', error.message);
    return false;
  }
};

// Expose to window for browser console testing
// @ts-ignore
window.testApiConnection = testApiConnection;