import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Mock global objects not available in jsdom
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock localStorage and sessionStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'sessionStorage', { value: localStorageMock });

// Mock the SignalR connection
jest.mock('@microsoft/signalr', () => {
    return {
      HubConnectionBuilder: jest.fn().mockImplementation(() => ({
        withUrl: jest.fn().mockReturnThis(),
        withAutomaticReconnect: jest.fn().mockReturnThis(),
        build: jest.fn().mockImplementation(() => ({
          onclose: jest.fn(),
          on: jest.fn(),
          off: jest.fn(),
          start: jest.fn().mockResolvedValue(undefined),
          stop: jest.fn().mockResolvedValue(undefined),
          invoke: jest.fn().mockResolvedValue(undefined),
          state: 1 // Connected state
        }))
      })),
      HubConnectionState: { Connected: 1, Disconnected: 0 },
      HttpTransportType: { WebSockets: 1 }
    };
  });