module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    // Handle CSS imports (with CSS modules)
    '\\.css$': 'identity-obj-proxy',
    // Handle image imports
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testMatch: ['<rootDir>/src/**/*.test.(ts|tsx)'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/reportWebVitals.ts',
  ],
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { 
      tsconfig: '<rootDir>/tsconfig.json',
      isolatedModules: true
    }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@mui|axios)).+\\.js$'
  ],
  // Added for fixing hanging tests
  testTimeout: 10000,
  verbose: true,
  globals: {
    'ts-jest': {
      diagnostics: false
    }
  }
};