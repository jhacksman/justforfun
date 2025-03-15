const { createPlayer, removePlayer, setPlayerClass } = require('../players');

// Mock dependencies
jest.mock('../server', () => ({
  players: new Map(),
  rooms: new Map()
}));

jest.mock('../commands', () => ({
  broadcastToRoom: jest.fn(),
  sendToPlayer: jest.fn()
}));

const { players, rooms } = require('../server');
const { broadcastToRoom } = require('../commands');

describe('Player Module Tests', () => {
  beforeEach(() => {
    // Clear mocks and maps
    players.clear();
    rooms.clear();
    jest.clearAllMocks();
    
    // Setup mock room
    rooms.set('castle-entrance', {
      id: 'castle-entrance',
      players: new Set()
    });
  });
  
  test('createPlayer should create a new player', () => {
    const mockSocket = {};
    const player = createPlayer('TestPlayer', mockSocket);
    
    // Check player properties
    expect(player).toHaveProperty('id');
    expect(player).toHaveProperty('name', 'TestPlayer');
    expect(player).toHaveProperty('class', 'Adventurer');
    expect(player).toHaveProperty('level', 1);
    expect(player).toHaveProperty('health', 100);
    expect(player).toHaveProperty('maxHealth', 100);
    expect(player).toHaveProperty('attack', 10);
    expect(player).toHaveProperty('defense', 5);
    expect(player).toHaveProperty('experience', 0);
    expect(player).toHaveProperty('roomId', 'castle-entrance');
    expect(player).toHaveProperty('inventory');
    expect(player).toHaveProperty('socket', mockSocket);
    
    // Check that player was added to the players map
    expect(players.size).toBe(1);
    expect(players.get(player.id)).toBe(player);
    
    // Check that player was added to the starting room
    const startingRoom = rooms.get('castle-entrance');
    expect(startingRoom.players.has(player.id)).toBe(true);
  });
  
  test('removePlayer should remove a player', () => {
    // Create a player first
    const mockSocket = {};
    const player = createPlayer('TestPlayer', mockSocket);
    const playerId = player.id;
    
    // Verify player exists
    expect(players.has(playerId)).toBe(true);
    
    // Remove the player
    removePlayer(playerId);
    
    // Check player was removed from players map
    expect(players.has(playerId)).toBe(false);
    
    // Check player was removed from room
    const room = rooms.get('castle-entrance');
    expect(room.players.has(playerId)).toBe(false);
    
    // Check broadcast was called
    expect(broadcastToRoom).toHaveBeenCalledWith('castle-entrance', expect.objectContaining({
      type: 'message',
      message: expect.stringContaining('TestPlayer has left the game'),
      exclude: [playerId]
    }));
  });
  
  test('setPlayerClass should update player stats based on class', () => {
    // Create a player first
    const mockSocket = {};
    const player = createPlayer('TestPlayer', mockSocket);
    
    // Test warrior class
    setPlayerClass(player, 'warrior');
    expect(player.class).toBe('warrior');
    expect(player.health).toBe(120);
    expect(player.maxHealth).toBe(120);
    expect(player.attack).toBe(12);
    expect(player.defense).toBe(8);
    
    // Test mage class
    setPlayerClass(player, 'mage');
    expect(player.class).toBe('mage');
    expect(player.health).toBe(80);
    expect(player.maxHealth).toBe(80);
    expect(player.attack).toBe(15);
    expect(player.defense).toBe(3);
    
    // Test rogue class
    setPlayerClass(player, 'rogue');
    expect(player.class).toBe('rogue');
    expect(player.health).toBe(90);
    expect(player.maxHealth).toBe(90);
    expect(player.attack).toBe(13);
    expect(player.defense).toBe(4);
    
    // Test invalid class (should default to Adventurer)
    setPlayerClass(player, 'invalid');
    expect(player.class).toBe('Adventurer');
    expect(player.health).toBe(100);
    expect(player.maxHealth).toBe(100);
    expect(player.attack).toBe(10);
    expect(player.defense).toBe(5);
  });
});
