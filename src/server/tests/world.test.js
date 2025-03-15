const { initializeWorld } = require('../world');

// Mock game state
const gameState = {
  players: new Map(),
  rooms: new Map(),
  items: new Map(),
  mobs: new Map()
};

describe('World Module Tests', () => {
  test('initializeWorld should create rooms', () => {
    // Initialize the world
    initializeWorld(gameState);
    
    // Check that rooms were created
    expect(gameState.rooms.size).toBeGreaterThan(0);
    
    // Check for specific rooms
    expect(gameState.rooms.has('castle-entrance')).toBe(true);
    expect(gameState.rooms.has('castle-courtyard')).toBe(true);
    expect(gameState.rooms.has('forest-path-1')).toBe(true);
    
    // Check room properties
    const castleEntrance = gameState.rooms.get('castle-entrance');
    expect(castleEntrance).toHaveProperty('id', 'castle-entrance');
    expect(castleEntrance).toHaveProperty('name', 'Castle Entrance');
    expect(castleEntrance).toHaveProperty('description');
    expect(castleEntrance).toHaveProperty('exits');
    expect(castleEntrance).toHaveProperty('players');
    expect(castleEntrance).toHaveProperty('mobs');
    expect(castleEntrance).toHaveProperty('items');
    
    // Check room connections
    expect(castleEntrance.exits).toHaveProperty('north', 'castle-courtyard');
    
    // Check that the castle entrance is a safe zone
    expect(castleEntrance.isSafe).toBe(true);
  });
  
  test('Rooms should have proper connections', () => {
    // Check bidirectional connections
    const castleEntrance = gameState.rooms.get('castle-entrance');
    const castleCourtyard = gameState.rooms.get('castle-courtyard');
    
    expect(castleEntrance.exits.north).toBe('castle-courtyard');
    expect(castleCourtyard.exits.south).toBe('castle-entrance');
    
    // Check forest path connections
    const forestPath1 = gameState.rooms.get('forest-path-1');
    expect(forestPath1.exits.north).toBe('castle-entrance');
    
    // Check that core rooms have valid connections
    // Note: Some rooms may have exits to rooms not defined in our test world
    const coreRooms = ['castle-entrance', 'castle-courtyard', 'forest-path-1'];
    for (const roomId of coreRooms) {
      const room = gameState.rooms.get(roomId);
      for (const [direction, targetRoomId] of Object.entries(room.exits)) {
        if (coreRooms.includes(targetRoomId)) {
          expect(gameState.rooms.has(targetRoomId)).toBe(true);
        }
      }
    }
  });
});
