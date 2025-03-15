const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

// Mock dependencies
jest.mock('ws');
jest.mock('express', () => {
  const mockExpress = jest.fn(() => ({
    use: jest.fn(),
    get: jest.fn()
  }));
  mockExpress.static = jest.fn();
  return mockExpress;
});
jest.mock('http', () => ({
  createServer: jest.fn(() => ({
    listen: jest.fn((port, callback) => {
      if (callback) callback();
      return this;
    })
  }))
}));

// Mock the server module
jest.mock('../server', () => {
  // Create mock game state inside the mock factory
  const mockGameState = {
    players: new Map(),
    rooms: new Map(),
    mobs: new Map(),
    items: new Map()
  };
  
  return {
    gameState: mockGameState,
    wss: {
      on: jest.fn()
    }
  };
}, { virtual: true });

// Get the mocked gameState for use in tests
const { gameState } = require('../server');

// Mock the commands module
jest.mock('../commands', () => ({
  parseCommand: jest.fn(),
  lookRoom: jest.fn().mockReturnValue({
    type: 'look',
    message: 'You are in a room.'
  }),
  broadcastToRoom: jest.fn()
}));

// Import the players module after mocking dependencies
const playerManager = require('../players');

describe('Character Entry Flow Tests', () => {
  let mockSocket;
  let originalHandleLogin;
  
  beforeEach(() => {
    // Clear game state
    gameState.players.clear();
    gameState.rooms.clear();
    gameState.mobs.clear();
    gameState.items.clear();
    
    // Setup test room
    gameState.rooms.set('castle-entrance', {
      id: 'castle-entrance',
      name: 'Castle Entrance',
      description: 'The grand entrance to the castle.',
      exits: {},
      players: new Set(),
      mobs: new Set(),
      items: new Set(),
      isSafe: true
    });
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock socket
    mockSocket = {
      send: jest.fn(),
      on: jest.fn()
    };
    
    // Store original handleLogin function
    originalHandleLogin = playerManager.handleLogin;
  });
  
  afterEach(() => {
    // Restore original handleLogin function
    if (originalHandleLogin) {
      playerManager.handleLogin = originalHandleLogin;
    }
  });
  
  test('Character entry should handle valid login message', () => {
    // Create a valid login message
    const loginMessage = {
      type: 'login',
      name: 'TestPlayer',
      className: 'Warrior'
    };
    
    // Call handleLogin directly
    const response = playerManager.handleLogin(loginMessage, mockSocket);
    
    // Check response
    expect(response).toBeDefined();
    expect(response.type).toBe('login');
    expect(response.message).toContain('Welcome');
    expect(response.player).toBeDefined();
    expect(response.player.name).toBe('TestPlayer');
    expect(response.player.class).toBe('Warrior');
    
    // Check that player was added to the game state
    expect(gameState.players.size).toBe(1);
    const player = Array.from(gameState.players.values())[0];
    expect(player.name).toBe('TestPlayer');
    expect(player.class).toBe('Warrior');
  });
  
  test('Character entry should handle login message with missing className', () => {
    // Create a login message without className
    const loginMessage = {
      type: 'login',
      name: 'TestPlayer'
    };
    
    // Call handleLogin directly
    const response = playerManager.handleLogin(loginMessage, mockSocket);
    
    // Check response
    expect(response).toBeDefined();
    expect(response.type).toBe('login');
    expect(response.player).toBeDefined();
    expect(response.player.name).toBe('TestPlayer');
    expect(response.player.class).toBe('Adventurer'); // Default class
    
    // Check that player was added to the game state
    expect(gameState.players.size).toBe(1);
  });
  
  test('Character entry should handle login message with invalid name', () => {
    // Create a login message with invalid name
    const loginMessage = {
      type: 'login',
      name: 'A', // Too short
      className: 'Warrior'
    };
    
    // Call handleLogin directly
    const response = playerManager.handleLogin(loginMessage, mockSocket);
    
    // Check response
    expect(response).toBeDefined();
    expect(response.type).toBe('error');
    expect(response.message).toContain('Name must be between');
    
    // Check that no player was added to the game state
    expect(gameState.players.size).toBe(0);
  });
  
  test('Character entry should handle login message with duplicate name', () => {
    // Create a player with the name we'll try to use
    const existingPlayer = {
      id: uuidv4(),
      name: 'TestPlayer',
      class: 'Warrior',
      roomId: 'castle-entrance',
      socket: {}
    };
    gameState.players.set(existingPlayer.id, existingPlayer);
    
    // Create a login message with the same name
    const loginMessage = {
      type: 'login',
      name: 'TestPlayer',
      className: 'Mage'
    };
    
    // Call handleLogin directly
    const response = playerManager.handleLogin(loginMessage, mockSocket);
    
    // Check response
    expect(response).toBeDefined();
    expect(response.type).toBe('error');
    expect(response.message).toContain('already taken');
    
    // Check that no new player was added to the game state
    expect(gameState.players.size).toBe(1);
  });
  
  test('Character entry should handle WebSocket message parsing', () => {
    // Mock the WebSocket message handler
    const messageHandler = (message) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'login') {
          const result = playerManager.handleLogin(data, mockSocket);
          mockSocket.send(JSON.stringify(result));
        }
      } catch (error) {
        mockSocket.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }
    };
    
    // Test with valid JSON
    const validMessage = JSON.stringify({
      type: 'login',
      name: 'TestPlayer',
      className: 'Warrior'
    });
    
    messageHandler(validMessage);
    
    // Check that the socket received a login response
    expect(mockSocket.send).toHaveBeenCalledWith(expect.stringContaining('login'));
    
    // Reset mock
    mockSocket.send.mockClear();
    
    // Test with invalid JSON
    const invalidMessage = '{type:"login",name:"TestPlayer",className:"Warrior"}'; // Missing quotes around keys
    
    messageHandler(invalidMessage);
    
    // Check that the socket received an error response
    expect(mockSocket.send).toHaveBeenCalledWith(expect.stringContaining('Invalid message format'));
  });
});
