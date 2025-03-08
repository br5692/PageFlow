import api, { API_BASE_URL } from './api';
import axios from 'axios';

// Mock axios
jest.mock('axios', () => {
  return {
    create: jest.fn(() => mockAxiosInstance),
    AxiosError: jest.fn() // Mock the AxiosError class
  };
});

// Create a separate mock for the axios instance returned by axios.create()
const mockAxiosInstance = {
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  },
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
};

describe('api', () => {
  let localStorageMock: { [key: string]: string } = {};
  let originalWindowLocation: Location;

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(key => localStorageMock[key] || null);
    jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(key => { delete localStorageMock[key]; });
    
    // Save original window.location and provide a mock implementation
    originalWindowLocation = window.location;
    // @ts-ignore - just for testing
    delete window.location;
    window.location = { ...originalWindowLocation, href: '' };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // Restore window.location
    window.location = originalWindowLocation;
  });

  it('creates axios instance with correct configuration', () => {
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true
    });
  });

  it('adds request interceptor to add auth token', () => {
    // Verify the interceptor was added
    expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
    
    // Get the request interceptor function
    const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
    
    // Test with token present
    localStorageMock['token'] = 'test-token';
    const configWithoutAuth = { headers: {} };
    const configWithAuth = requestInterceptor(configWithoutAuth);
    expect(configWithAuth.headers.Authorization).toBe('Bearer test-token');
    
    // Test without token
    delete localStorageMock['token'];
    const configWithoutToken = requestInterceptor({ headers: {} });
    expect(configWithoutToken.headers.Authorization).toBeUndefined();
  });

  it('adds response interceptor to handle auth errors', () => {
    // Verify the interceptor was added
    expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    
    // Get the response error handler
    const successHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][0];
    const errorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
    
    // Test the success handler
    const mockResponse = { data: { test: 'data' } };
    expect(successHandler(mockResponse)).toBe(mockResponse);
    
    // Test the error handler with a 401 error
    const mockError = { 
      response: { status: 401 }
    };
    
    try {
      errorHandler(mockError);
    } catch (error) {
      // We expect this to throw because it returns Promise.reject
    }
    
    // Verify localStorage items were removed and redirect occurred
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    expect(window.location.href).toBe('/login');
  });
});