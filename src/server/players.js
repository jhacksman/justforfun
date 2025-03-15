const { v4: uuidv4 } = require('uuid');
const { gameState } = require('./server');
const { broadcastToRoom, sendToPlayer } = require('./commands');

// Player management
function createPlayer(name, socket) {
  const playerId = uuidv4();
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
  
  // Add player to the game
  gameState.players.set(playerId, player);
  
  // Add player to the starting room
  const startingRoom = gameState.rooms.get('castle-entrance');
  startingRoom.players.add(playerId);
  
  return player;
}

function removePlayer(playerId) {
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
}

// Update player class and stats
function setPlayerClass(player, className) {
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
}

// Handle player login
function handleLogin(data, socket) {
  const { name, className } = data;
  
  // Validate name
  if (!name || name.trim().length < 2 || name.trim().length > 20) {
    return {
      type: 'error',
      message: 'Name must be between 2 and 20 characters.'
    };
  }
  
  // Check if name is already taken
  for (const [_, player] of gameState.players.entries()) {
    if (player.name.toLowerCase() === name.toLowerCase()) {
      return {
        type: 'error',
        message: 'That name is already taken. Please choose another.'
      };
    }
  }
  
  // Create the player
  const player = createPlayer(name, socket);
  
  // Set player class if provided
  if (className) {
    setPlayerClass(player, className);
  }
  
  // Send welcome message
  const response = {
    type: 'login',
    message: `Welcome, ${player.name}! You are now in the game.`,
    player: {
      id: player.id,
      name: player.name,
      class: player.class,
      level: player.level,
      health: player.health,
      maxHealth: player.maxHealth,
      experience: player.experience
    }
  };
  
  // Notify other players in the room
  broadcastToRoom(player.roomId, {
    type: 'message',
    message: `${player.name} has entered the game.`,
    exclude: [player.id]
  });
  
  // Return login response and room description
  return response;
}

module.exports = {
  createPlayer,
  removePlayer,
  setPlayerClass,
  handleLogin
};
