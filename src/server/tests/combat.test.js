const { attackTarget, calculateDifficulty, generateMobForRoom } = require('../combat');

// Mock dependencies
jest.mock('../commands', () => ({
  broadcastToRoom: jest.fn(),
  sendToPlayer: jest.fn(),
  lookRoom: jest.fn().mockReturnValue({ type: 'look', message: 'Room description' })
}));

const { broadcastToRoom, sendToPlayer, lookRoom } = require('../commands');

describe('Combat Module Tests', () => {
  let gameState;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock game state
    gameState = {
      players: new Map(),
      rooms: new Map(),
      items: new Map(),
      mobs: new Map()
    };
    
    // Create a test player
    const player = {
      id: 'player1',
      name: 'TestPlayer',
      level: 1,
      health: 100,
      maxHealth: 100,
      attack: 10,
      defense: 5,
      experience: 0,
      roomId: 'forest-path-1',
      inventory: new Set()
    };
    gameState.players.set('player1', player);
    
    // Create a test mob
    const mob = {
      id: 'forest-wolf-1',
      name: 'Forest Wolf',
      description: 'A gray wolf with piercing yellow eyes.',
      health: 20,
      maxHealth: 20,
      attack: 5,
      defense: 2,
      level: 1,
      aggressive: true,
      roomId: 'forest-path-1',
      respawnTime: 60000,
      loot: ['wolf-pelt', 'wolf-fang']
    };
    gameState.mobs.set('forest-wolf-1', mob);
    
    // Create a test room
    const room = {
      id: 'forest-path-1',
      name: 'Forest Path',
      description: 'A winding path through the forest.',
      exits: {},
      players: new Set(['player1']),
      mobs: new Set(['forest-wolf-1']),
      items: new Set(),
      isSafe: false
    };
    gameState.rooms.set('forest-path-1', room);
    
    // Create a safe room
    const safeRoom = {
      id: 'castle-entrance',
      name: 'Castle Entrance',
      description: 'The grand entrance to the castle.',
      exits: {},
      players: new Set(),
      mobs: new Set(),
      items: new Set(),
      isSafe: true
    };
    gameState.rooms.set('castle-entrance', safeRoom);
  });
  
  test('calculateDifficulty should return correct difficulty based on room location', () => {
    // Castle rooms should be difficulty 0
    expect(calculateDifficulty('castle-entrance', gameState)).toBe(0);
    expect(calculateDifficulty('castle-hall', gameState)).toBe(0);
    
    // Forest paths should be difficulty 1
    expect(calculateDifficulty('forest-path-1', gameState)).toBe(1);
    expect(calculateDifficulty('forest-clearing-1', gameState)).toBe(1);
    
    // Deep forest should be difficulty 2
    expect(calculateDifficulty('deep-forest-1', gameState)).toBe(2);
    
    // Unknown locations default to difficulty 1
    expect(calculateDifficulty('unknown-location', gameState)).toBe(1);
  });
  
  test('generateMobForRoom should create appropriate mob for room difficulty', () => {
    // Generate mob for castle (difficulty 0)
    const castleMob = generateMobForRoom('castle-hall', gameState);
    expect(castleMob.level).toBe(1); // difficulty + 1
    expect(castleMob.health).toBe(15); // 15 + (0 * 10)
    expect(castleMob.attack).toBe(4);  // 4 + (0 * 2)
    expect(castleMob.defense).toBe(2); // 2 + 0
    
    // Generate mob for forest path (difficulty 1)
    const forestMob = generateMobForRoom('forest-path-1', gameState);
    expect(forestMob.level).toBe(2); // difficulty + 1
    expect(forestMob.health).toBe(25); // 15 + (1 * 10)
    expect(forestMob.attack).toBe(6);  // 4 + (1 * 2)
    expect(forestMob.defense).toBe(3); // 2 + 1
    
    // Generate mob for deep forest (difficulty 2)
    const deepForestMob = generateMobForRoom('deep-forest-1', gameState);
    expect(deepForestMob.level).toBe(3); // difficulty + 1
    expect(deepForestMob.health).toBe(35); // 15 + (2 * 10)
    expect(deepForestMob.attack).toBe(8);  // 4 + (2 * 2)
    expect(deepForestMob.defense).toBe(4); // 2 + 2
    
    // Check that forest mobs have appropriate names
    expect(forestMob.name.toLowerCase()).toMatch(/wolf|bandit|deer|bear/);
  });
  
  test('attackTarget should not allow attacks in safe zones', () => {
    // Move player to safe zone
    const player = gameState.players.get('player1');
    player.roomId = 'castle-entrance';
    
    // Attempt to attack
    const result = attackTarget(player, 'Forest Wolf', gameState);
    
    // Check result
    expect(result.type).toBe('error');
    expect(result.message).toContain('cannot attack in a safe zone');
  });
  
  test('attackTarget should handle non-existent targets', () => {
    const player = gameState.players.get('player1');
    
    // Attempt to attack non-existent target
    const result = attackTarget(player, 'Dragon', gameState);
    
    // Check result
    expect(result.type).toBe('error');
    expect(result.message).toContain('don\'t see Dragon here');
  });
  
  test('attackTarget should handle successful attacks', () => {
    const player = gameState.players.get('player1');
    
    // Attempt to attack wolf
    const result = attackTarget(player, 'Forest Wolf', gameState);
    
    // Check result
    expect(result.type).toBe('combat');
    expect(result.message).toContain('attack Forest Wolf for');
    expect(result.health).toBe(player.health);
    
    // Check that broadcast was called
    expect(broadcastToRoom).toHaveBeenCalledWith('forest-path-1', expect.objectContaining({
      type: 'combat',
      message: expect.stringContaining('TestPlayer attacks Forest Wolf')
    }));
  });
});
