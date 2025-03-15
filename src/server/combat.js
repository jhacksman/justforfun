const { broadcastToRoom, sendToPlayer, lookRoom } = require('./commands');

// Combat system
function initializeMobs(gameState) {
  console.log('Initializing mobs...');
  
  // Create some starter mobs
  const forestWolf = {
    id: 'forest-wolf-1',
    name: 'Forest Wolf',
    description: 'A gray wolf with piercing yellow eyes. It looks hungry.',
    health: 20,
    maxHealth: 20,
    attack: 5,
    defense: 2,
    level: 1,
    aggressive: true,
    roomId: 'forest-path-1',
    respawnTime: 60000, // 1 minute in milliseconds
    loot: ['wolf-pelt', 'wolf-fang']
  };
  
  const forestWolf2 = {
    id: 'forest-wolf-2',
    name: 'Forest Wolf',
    description: 'A gray wolf with piercing yellow eyes. It looks hungry.',
    health: 20,
    maxHealth: 20,
    attack: 5,
    defense: 2,
    level: 1,
    aggressive: true,
    roomId: 'forest-path-2',
    respawnTime: 60000,
    loot: ['wolf-pelt', 'wolf-fang']
  };
  
  const forestBandit = {
    id: 'forest-bandit-1',
    name: 'Forest Bandit',
    description: 'A rough-looking human wearing tattered clothes and wielding a rusty dagger.',
    health: 25,
    maxHealth: 25,
    attack: 6,
    defense: 3,
    level: 1,
    aggressive: true,
    roomId: 'forest-path-3',
    respawnTime: 120000, // 2 minutes
    loot: ['rusty-dagger', 'leather-pouch']
  };
  
  const forestDeer = {
    id: 'forest-deer-1',
    name: 'Forest Deer',
    description: 'A gentle deer grazing in the clearing. It looks up nervously as you approach.',
    health: 15,
    maxHealth: 15,
    attack: 2,
    defense: 1,
    level: 1,
    aggressive: false,
    roomId: 'forest-clearing-1',
    respawnTime: 45000, // 45 seconds
    loot: ['deer-hide', 'venison']
  };
  
  const forestBear = {
    id: 'forest-bear-1',
    name: 'Forest Bear',
    description: 'A large brown bear. It looks powerful and dangerous.',
    health: 40,
    maxHealth: 40,
    attack: 10,
    defense: 5,
    level: 2,
    aggressive: true,
    roomId: 'deep-forest-1',
    respawnTime: 180000, // 3 minutes
    loot: ['bear-pelt', 'bear-claw']
  };
  
  // Add mobs to the game
  gameState.mobs.set('forest-wolf-1', forestWolf);
  gameState.mobs.set('forest-wolf-2', forestWolf2);
  gameState.mobs.set('forest-bandit-1', forestBandit);
  gameState.mobs.set('forest-deer-1', forestDeer);
  gameState.mobs.set('forest-bear-1', forestBear);
  
  console.log('Mobs initialized with', gameState.mobs.size, 'creatures');
}

function attackTarget(player, target, gameState) {
  const room = gameState.rooms.get(player.roomId);
  if (!room) {
    return { type: 'error', message: 'You are in an unknown location.' };
  }
  
  // Check if room is a safe zone
  if (room.isSafe) {
    return { type: 'error', message: 'You cannot attack in a safe zone.' };
  }
  
  // Find the target mob
  let targetMob = null;
  for (const mobId of room.mobs) {
    const mob = gameState.mobs.get(mobId);
    if (mob && mob.name.toLowerCase() === target.toLowerCase()) {
      targetMob = mob;
      break;
    }
  }
  
  if (!targetMob) {
    return { type: 'error', message: `You don't see ${target} here.` };
  }
  
  // Calculate damage
  const damage = Math.max(1, player.attack - targetMob.defense);
  targetMob.health -= damage;
  
  // Broadcast the attack to the room
  broadcastToRoom(room.id, {
    type: 'combat',
    message: `${player.name} attacks ${targetMob.name} for ${damage} damage!`
  });
  
  // Check if the mob is defeated
  if (targetMob.health <= 0) {
    // Remove the mob from the room
    room.mobs.delete(targetMob.id);
    
    // Calculate experience gained
    const expGained = targetMob.level * 10;
    player.experience += expGained;
    
    // Check for level up
    const levelUpExp = player.level * 100;
    if (player.experience >= levelUpExp) {
      player.level += 1;
      player.attack += 1;
      player.defense += 1;
      player.maxHealth += 10;
      player.health = player.maxHealth;
      
      // Notify the player of level up
      sendToPlayer(player.id, {
        type: 'levelup',
        message: `You have reached level ${player.level}!`,
        player: {
          level: player.level,
          health: player.health,
          maxHealth: player.maxHealth,
          attack: player.attack,
          defense: player.defense,
          experience: player.experience
        }
      });
    }
    
    // Notify the room of the defeat
    broadcastToRoom(room.id, {
      type: 'combat',
      message: `${player.name} has defeated ${targetMob.name}!`
    });
    
    // Schedule mob respawn
    setTimeout(() => {
      // Create a new instance of the mob
      const newMob = {
        ...targetMob,
        health: targetMob.maxHealth
      };
      
      // Add the mob back to the game world
      gameState.mobs.set(newMob.id, newMob);
      
      // Add the mob back to the room
      const respawnRoom = gameState.rooms.get(newMob.roomId);
      if (respawnRoom) {
        respawnRoom.mobs.add(newMob.id);
        
        // Notify the room of the respawn
        broadcastToRoom(respawnRoom.id, {
          type: 'respawn',
          message: `${newMob.name} has appeared.`
        });
      }
    }, targetMob.respawnTime);
    
    return { 
      type: 'combat', 
      message: `You have defeated ${targetMob.name} and gained ${expGained} experience!`,
      experience: player.experience,
      level: player.level
    };
  }
  
  // Mob counterattack
  const mobDamage = Math.max(1, targetMob.attack - player.defense);
  player.health -= mobDamage;
  
  // Notify the player of the counterattack
  sendToPlayer(player.id, {
    type: 'combat',
    message: `${targetMob.name} attacks you for ${mobDamage} damage!`,
    health: player.health,
    maxHealth: player.maxHealth
  });
  
  // Check if the player is defeated
  if (player.health <= 0) {
    // Respawn the player at the castle entrance
    player.health = player.maxHealth;
    
    // Remove player from current room
    room.players.delete(player.id);
    
    // Add player to castle entrance
    const castleEntrance = gameState.rooms.get('castle-entrance');
    castleEntrance.players.add(player.id);
    
    // Update player's room
    player.roomId = 'castle-entrance';
    
    // Notify the old room of the player's defeat
    broadcastToRoom(room.id, {
      type: 'combat',
      message: `${player.name} has been defeated and sent back to the castle.`,
      exclude: [player.id]
    });
    
    // Notify the player of their defeat
    sendToPlayer(player.id, {
      type: 'death',
      message: 'You have been defeated and sent back to the castle entrance.',
      health: player.health,
      maxHealth: player.maxHealth
    });
    
    // Return the look result for the castle entrance
    return lookRoom(gameState.players.get(player.id));
  }
  
  return { 
    type: 'combat', 
    message: `You attack ${targetMob.name} for ${damage} damage. It has ${targetMob.health}/${targetMob.maxHealth} health remaining.`,
    health: player.health,
    maxHealth: player.maxHealth
  };
}

// Calculate difficulty based on distance from castle
function calculateDifficulty(roomId, gameState) {
  // Base case: castle rooms are difficulty 0
  if (roomId.startsWith('castle-')) {
    return 0;
  }
  
  // Forest paths are difficulty 1
  if (roomId.startsWith('forest-path-') || roomId.startsWith('forest-clearing-')) {
    return 1;
  }
  
  // Deep forest is difficulty 2
  if (roomId.startsWith('deep-forest-')) {
    return 2;
  }
  
  // Default to difficulty 1 if unknown
  return 1;
}

// Generate a mob appropriate for the room's difficulty
function generateMobForRoom(roomId, gameState) {
  const difficulty = calculateDifficulty(roomId, gameState);
  
  // Adjust stats based on difficulty
  const healthBase = 15 + (difficulty * 10);
  const attackBase = 4 + (difficulty * 2);
  const defenseBase = 2 + difficulty;
  
  // Choose a mob type based on room location
  let mobType = 'wolf';
  if (roomId.includes('forest')) {
    // Random forest creature
    const forestTypes = ['wolf', 'bandit', 'deer', 'bear'];
    mobType = forestTypes[Math.floor(Math.random() * forestTypes.length)];
  }
  
  // Create the mob
  const mobId = `${mobType}-${Date.now()}`;
  const mob = {
    id: mobId,
    name: `${difficulty > 1 ? 'Fierce ' : ''}${mobType.charAt(0).toUpperCase() + mobType.slice(1)}`,
    description: `A ${difficulty > 1 ? 'dangerous looking ' : ''}${mobType}.`,
    health: healthBase,
    maxHealth: healthBase,
    attack: attackBase,
    defense: defenseBase,
    level: difficulty + 1,
    aggressive: ['wolf', 'bandit', 'bear'].includes(mobType),
    roomId: roomId,
    respawnTime: 60000 + (difficulty * 30000),
    loot: [`${mobType}-loot`]
  };
  
  return mob;
}

module.exports = {
  initializeMobs,
  attackTarget,
  calculateDifficulty,
  generateMobForRoom
};
