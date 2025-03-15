// Mock console methods to prevent "Cannot log after tests are done" warnings
global.console = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock server.listen to prevent actual server startup during tests
jest.mock('http', () => {
  const mockServer = {
    listen: jest.fn().mockImplementation((port, callback) => {
      if (callback) callback();
      return mockServer;
    }),
  };
  return {
    createServer: jest.fn().mockReturnValue(mockServer),
  };
});
