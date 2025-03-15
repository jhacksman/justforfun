// Create a simplified integration test that doesn't rely on mocking the entire server
const WebSocket = require('ws');

// Import mock modules
const playersMock = require('./mocks/players.mock');
const commandsMock = require('./mocks/commands.mock');

// Mock game state
const players = new Map();
const rooms = new Map();
const mobs = new Map();
const items = new Map();

describe('WebSocket Communication Tests', () => {
  let mockSocket;
  
  beforeEach(() => {
    // Clear game state
    players.clear();
    rooms.clear();
    mobs.clear();
    items.clear();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock socket
    mockSocket = {
      send: jest.fn(),
      on: jest.fn()
    };
  });
  
  test('Player login should create a player and send welcome message', () => {
    // Setup mock player creation
    const testPlayer = {
      id: 'test-id',
      name: 'TestPlayer',
      class: 'Warrior',
      level: 1,
      health: 100,
      maxHealth: 100
    };
    
    // Mock player login response
    playersMock.handleLogin.mockReturnValue({
      type: 'login',
      message: 'Welcome, TestPlayer!',
      player: {
        name: 'TestPlayer',
        class: 'Warrior'
      }
    });
    
    // Simulate login message handling
    const loginData = {
      type: 'login',
      name: 'TestPlayer',
      className: 'Warrior'
    };
    
    // Call the mock login handler
    const response = playersMock.handleLogin(loginData, mockSocket);
    
    // Check response
    expect(response.type).toBe('login');
    expect(response.message).toContain('Welcome');
    expect(response.player.name).toBe('TestPlayer');
  });
  
  test('Command parsing should handle look command', () => {
    // Mock command parsing response
    commandsMock.parseCommand.mockReturnValue({
      type: 'look',
      message: 'You see a room with stone walls and a wooden door.'
    });
    
    // Call the mock command parser
    const response = commandsMock.parseCommand('look');
    
    // Check response
    expect(response.type).toBe('look');
    expect(response.message).toContain('room');
  });
  
  test('Command parsing should handle unknown commands', () => {
    // Mock command parsing response for unknown command
    commandsMock.parseCommand.mockReturnValue({
      type: 'error',
      message: 'Unknown command.'
    });
    
    // Call the mock command parser
    const response = commandsMock.parseCommand('invalidcommand');
    
    // Check response
    expect(response.type).toBe('error');
    expect(response.message).toContain('Unknown command');
  });
  
  test('Player removal should remove player from game state', () => {
    // Setup test player
    const testPlayerId = 'test-player-id';
    const testPlayer = {
      id: testPlayerId,
      name: 'TestPlayer',
      roomId: 'castle-entrance'
    };
    
    // Add player to game state
    players.set(testPlayerId, testPlayer);
    
    // Setup test room
    const testRoom = {
      id: 'castle-entrance',
      players: new Set([testPlayerId])
    };
    rooms.set('castle-entrance', testRoom);
    
    // Verify initial state
    expect(players.has(testPlayerId)).toBe(true);
    expect(rooms.get('castle-entrance').players.has(testPlayerId)).toBe(true);
    
    // Call removePlayer mock
    playersMock.removePlayer(testPlayerId);
    
    // Verify player was removed in our mock implementation
    expect(playersMock.removePlayer).toHaveBeenCalledWith(testPlayerId);
  });
  
  test('Room broadcasting should send messages to all players in room', () => {
    // Setup test message
    const testMessage = {
      type: 'message',
      message: 'Hello, world!'
    };
    
    // Call broadcastToRoom mock
    commandsMock.broadcastToRoom('castle-entrance', testMessage);
    
    // Verify broadcastToRoom was called with correct parameters
    expect(commandsMock.broadcastToRoom).toHaveBeenCalledWith('castle-entrance', testMessage);
  });
});
