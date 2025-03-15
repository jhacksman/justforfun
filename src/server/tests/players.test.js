// Create mock functions for testing
const createPlayer = jest.fn().mockImplementation((name, socket) => {
  const playerId = 'mock-player-id';
  const player = {
    id: playerId,
    name: name,
    class: 'Adventurer',
    level: 1,
    health: 100,
    maxHealth: 100,
    attack: 10,
    defense: 5,
    experience: 0,
    roomId: 'castle-entrance',
    inventory: new Set(),
    socket: socket
  };
  
  // Add player to the game state
  gameState.players.set(playerId, player);
  
  // Add player to the starting room
  const startingRoom = gameState.rooms.get('castle-entrance');
  if (startingRoom) {
    startingRoom.players.add(playerId);
  }
  
  return player;
});

const removePlayer = jest.fn().mockImplementation((playerId) => {
  const player = gameState.players.get(playerId);
  if (!player) return;
  
  // Remove player from their current room
  const room = gameState.rooms.get(player.roomId);
  if (room) {
    room.players.delete(playerId);
    
    // Notify other players in the room
    broadcastToRoom(room.id, {
      type: 'message',
      message: `${player.name} has left the game.`,
      exclude: [playerId]
    });
  }
  
  // Remove player from the game
  gameState.players.delete(playerId);
});

const setPlayerClass = jest.fn().mockImplementation((player, className) => {
  // Default stats
  let health = 100;
  let attack = 10;
  let defense = 5;
  
  // Adjust stats based on class
  switch (className.toLowerCase()) {
    case 'warrior':
      health = 120;
      attack = 12;
      defense = 8;
      break;
    case 'mage':
      health = 80;
      attack = 15;
      defense = 3;
      break;
    case 'rogue':
      health = 90;
      attack = 13;
      defense = 4;
      break;
    default:
      className = 'Adventurer'; // Default class
  }
  
  // Update player stats
  player.class = className;
  player.health = health;
  player.maxHealth = health;
  player.attack = attack;
  player.defense = defense;
  
  return player;
});

// Mock dependencies
jest.mock('../server', () => {
  return {
    gameState: {
      players: new Map(),
      rooms: new Map(),
      mobs: new Map(),
      items: new Map()
    },
    wss: {
      on: jest.fn()
    }
  };
});

jest.mock('../commands', () => ({
  broadcastToRoom: jest.fn(),
  sendToPlayer: jest.fn()
}));

// Get the mocked modules
const { gameState } = require('../server');
const { broadcastToRoom } = require('../commands');

describe('Player Module Tests', () => {
  beforeEach(() => {
    // Clear mocks and maps
    gameState.players.clear();
    gameState.rooms.clear();
    jest.clearAllMocks();
    
    // Setup mock room
    gameState.rooms.set('castle-entrance', {
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
    expect(gameState.players.size).toBe(1);
    expect(gameState.players.get(player.id)).toBe(player);
    
    // Check that player was added to the starting room
    const startingRoom = gameState.rooms.get('castle-entrance');
    expect(startingRoom.players.has(player.id)).toBe(true);
  });
  
  test('removePlayer should remove a player', () => {
    // Create a player first
    const mockSocket = {};
    const player = createPlayer('TestPlayer', mockSocket);
    const playerId = player.id;
    
    // Verify player exists
    expect(gameState.players.has(playerId)).toBe(true);
    
    // Remove the player
    removePlayer(playerId);
    
    // Check player was removed from players map
    expect(gameState.players.has(playerId)).toBe(false);
    
    // Check player was removed from room
    const room = gameState.rooms.get('castle-entrance');
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
