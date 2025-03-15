// Game world initialization
function initializeWorld(gameState) {
  console.log('Initializing game world...');
  
  // Create the castle (starting area)
  const castleEntrance = {
    id: 'castle-entrance',
    name: 'Castle Entrance',
    description: 'You stand at the grand entrance of a magnificent castle. Stone walls rise high above you, and a large wooden gate stands open, welcoming adventurers. This is a safe area where new adventurers gather.',
    exits: {
      north: 'castle-courtyard',
      east: 'castle-gardens',
      west: 'castle-guardhouse',
      south: 'forest-path-1'
    },
    players: new Set(),
    items: new Set(),
    mobs: new Set(),
    difficulty: 0, // Safe zone
    isSafe: true
  };
  
  const castleCourtyard = {
    id: 'castle-courtyard',
    name: 'Castle Courtyard',
    description: 'The courtyard is bustling with activity. Merchants have set up stalls selling various goods, and other adventurers are preparing for their journeys.',
    exits: {
      south: 'castle-entrance',
      north: 'castle-keep',
      east: 'castle-barracks',
      west: 'castle-stables'
    },
    players: new Set(),
    items: new Set(),
    mobs: new Set(),
    difficulty: 0, // Safe zone
    isSafe: true
  };
  
  const castleGardens = {
    id: 'castle-gardens',
    name: 'Castle Gardens',
    description: 'Beautiful gardens surround this part of the castle. Colorful flowers bloom, and the air is filled with their sweet scent.',
    exits: {
      west: 'castle-entrance',
      north: 'castle-barracks'
    },
    players: new Set(),
    items: new Set(),
    mobs: new Set(),
    difficulty: 0, // Safe zone
    isSafe: true
  };
  
  const castleGuardhouse = {
    id: 'castle-guardhouse',
    name: 'Castle Guardhouse',
    description: 'The guardhouse is where the castle guards rest between shifts. Weapons and armor are neatly arranged on racks.',
    exits: {
      east: 'castle-entrance',
      north: 'castle-stables'
    },
    players: new Set(),
    items: new Set(),
    mobs: new Set(),
    difficulty: 0, // Safe zone
    isSafe: true
  };
  
  const forestPath1 = {
    id: 'forest-path-1',
    name: 'Forest Path',
    description: 'A narrow path leads into a dense forest. The trees provide shade from the sun, and you can hear birds chirping in the distance.',
    exits: {
      north: 'castle-entrance',
      south: 'forest-clearing-1',
      east: 'forest-path-2',
      west: 'forest-path-3'
    },
    players: new Set(),
    items: new Set(),
    mobs: new Set(['forest-wolf-1']),
    difficulty: 1, // First level outside castle
    isSafe: false
  };
  
  const forestPath2 = {
    id: 'forest-path-2',
    name: 'Eastern Forest Path',
    description: 'The forest path continues eastward. The trees are thicker here, and less sunlight filters through the canopy.',
    exits: {
      west: 'forest-path-1',
      east: 'forest-river-1'
    },
    players: new Set(),
    items: new Set(),
    mobs: new Set(['forest-wolf-2']),
    difficulty: 1,
    isSafe: false
  };
  
  const forestPath3 = {
    id: 'forest-path-3',
    name: 'Western Forest Path',
    description: 'The forest path continues westward. You can hear the sounds of small animals moving through the underbrush.',
    exits: {
      east: 'forest-path-1',
      west: 'forest-cave-entrance'
    },
    players: new Set(),
    items: new Set(),
    mobs: new Set(['forest-bandit-1']),
    difficulty: 1,
    isSafe: false
  };
  
  const forestClearing1 = {
    id: 'forest-clearing-1',
    name: 'Forest Clearing',
    description: 'A small clearing in the forest. Sunlight streams down, illuminating a patch of wildflowers.',
    exits: {
      north: 'forest-path-1',
      south: 'deep-forest-1'
    },
    players: new Set(),
    items: new Set(),
    mobs: new Set(['forest-deer-1']),
    difficulty: 1,
    isSafe: false
  };
  
  const deepForest1 = {
    id: 'deep-forest-1',
    name: 'Deep Forest',
    description: 'The forest grows darker and more ominous. The trees are ancient and twisted, and strange sounds echo in the distance.',
    exits: {
      north: 'forest-clearing-1',
      south: 'deep-forest-2',
      east: 'deep-forest-3',
      west: 'deep-forest-4'
    },
    players: new Set(),
    items: new Set(),
    mobs: new Set(['forest-bear-1']),
    difficulty: 2, // Higher difficulty as we move further from the castle
    isSafe: false
  };
  
  // Add rooms to the game world
  gameState.rooms.set('castle-entrance', castleEntrance);
  gameState.rooms.set('castle-courtyard', castleCourtyard);
  gameState.rooms.set('castle-gardens', castleGardens);
  gameState.rooms.set('castle-guardhouse', castleGuardhouse);
  gameState.rooms.set('forest-path-1', forestPath1);
  gameState.rooms.set('forest-path-2', forestPath2);
  gameState.rooms.set('forest-path-3', forestPath3);
  gameState.rooms.set('forest-clearing-1', forestClearing1);
  gameState.rooms.set('deep-forest-1', deepForest1);
  
  console.log('Game world initialized with', gameState.rooms.size, 'rooms');
}

module.exports = { initializeWorld };
