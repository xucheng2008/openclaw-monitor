// Test setup for in-memory storage
import { execSync } from 'child_process';

// Clear any existing test data before each test
beforeEach(() => {
  // Clear in-memory caches and data stores
  jest.clearAllMocks();
});

// Clean up after all tests
afterAll(() => {
  // No cleanup needed for in-memory storage
});