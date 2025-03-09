const mockApi = {
    get: jest.fn().mockResolvedValue({ data: {} }),
    post: jest.fn().mockResolvedValue({ data: {} }),
    put: jest.fn().mockResolvedValue({ data: {} }),
    delete: jest.fn().mockResolvedValue({ data: {} }),
  };
  
  // Export the API_BASE_URL as well to avoid import errors
  export const API_BASE_URL = 'http://localhost:3000/api';
  
  export default mockApi;