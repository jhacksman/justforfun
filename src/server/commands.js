const { gameState } = require('./server');

// Command parser
function parseCommand(message, playerId) {
  const player = gameState.players.get(playerId);
  if (!player) {
    return { type: 'error', message: 'Player not found.' };
  }
  const words = message.trim().toLowerCase().split(/\s+/);
  const command = words[0];
  const args = words.slice(1);
  
  switch (command) {
    // Movement commands
    case 'north':
    case 'n':
      return movePlayer(player, 'north');
    case 'south':
    case 's':
      return movePlayer(player, 'south');
    case 'east':
    case 'e':
      return movePlayer(player, 'east');
    case 'west':
    case 'w':
      return movePlayer(player, 'west');
    case 'up':
    case 'u':
      return movePlayer(player, 'up');
    case 'down':
    case 'd':
      return movePlayer(player, 'down');
      
    // Look command
    case 'look':
    case 'l':
      if (args.length === 0) {
        return lookRoom(player);
      } else {
        return lookAt(player, args.join(' '));
      }
      
    // Help command
    case 'help':
      return showHelp(player, args[0]);
      
    // Combat commands
    case 'attack':
    case 'kill':
      if (args.length === 0) {
        return { type: 'error', message: 'Attack what?' };
      }
      const combatSystem = require('./combat');
      return combatSystem.attackTarget(player, args.join(' '), { players, rooms, mobs });
      
    // Chat commands
    case 'say':
      if (args.length === 0) {
        return { type: 'error', message: 'Say what?' };
      }
      const chatSystem = require('./chat');
      return chatSystem.say(player, args.join(' '), { players, rooms, mobs });
      
    case 'shout':
      if (args.length === 0) {
        return { type: 'error', message: 'Shout what?' };
      }
      const chatSystem2 = require('./chat');
      return chatSystem2.shout(player, args.join(' '), { players, rooms, mobs });
      
    case 'whisper':
      if (args.length < 2) {
        return { type: 'error', message: 'Whisper to whom and what?' };
      }
      const targetName = args[0];
      const whisperMessage = args.slice(1).join(' ');
      const chatSystem3 = require('./chat');
      return chatSystem3.whisper(player, targetName, whisperMessage, { players, rooms, mobs });
      
    // Emote commands
    case 'emote':
    case 'me':
      if (args.length === 0) {
        return { type: 'error', message: 'Emote what?' };
      }
      const chatSystem4 = require('./chat');
      return chatSystem4.emote(player, args.join(' '), { players, rooms, mobs });
      
    case 'smile':
      const chatSystem5 = require('./chat');
      return chatSystem5.smile(player, { players, rooms, mobs });
      
    case 'laugh':
      const chatSystem6 = require('./chat');
      return chatSystem6.laugh(player, { players, rooms, mobs });
      
    case 'wave':
      const chatSystem7 = require('./chat');
      return chatSystem7.wave(player, { players, rooms, mobs });
      
    case 'dance':
      const chatSystem8 = require('./chat');
      return chatSystem8.dance(player, { players, rooms, mobs });
      
    case 'bow':
      const chatSystem9 = require('./chat');
      return chatSystem9.bow(player, { players, rooms, mobs });
      
    // Inventory commands
    case 'inventory':
    case 'i':
      const itemSystem = require('./items');
      return itemSystem.showInventory(player, { players, rooms, items, mobs });
      
    case 'get':
    case 'take':
      if (args.length === 0) {
        return { type: 'error', message: 'Get what?' };
      }
      const itemSystem2 = require('./items');
      return itemSystem2.getItem(player, args.join(' '), { players, rooms, items, mobs });
      
    case 'drop':
      if (args.length === 0) {
        return { type: 'error', message: 'Drop what?' };
      }
      const itemSystem3 = require('./items');
      return itemSystem3.dropItem(player, args.join(' '), { players, rooms, items, mobs });
      
    case 'equip':
    case 'wear':
    case 'wield':
      if (args.length === 0) {
        return { type: 'error', message: 'Equip what?' };
      }
      const itemSystem4 = require('./items');
      return itemSystem4.equipItem(player, args.join(' '), { players, rooms, items, mobs });
      
    case 'unequip':
    case 'remove':
      if (args.length === 0) {
        return { type: 'error', message: 'Unequip what?' };
      }
      const itemSystem5 = require('./items');
      return itemSystem5.unequipItem(player, args.join(' '), { players, rooms, items, mobs });
      
    case 'use':
    case 'consume':
      if (args.length === 0) {
        return { type: 'error', message: 'Use what?' };
      }
      const itemSystem6 = require('./items');
      return itemSystem6.useItem(player, args.join(' '), { players, rooms, items, mobs });
      
    default:
      return { type: 'error', message: 'Unknown command. Type "help" for a list of commands.' };
  }
}

// Movement function
function movePlayer(player, direction) {
  const currentRoom = gameState.rooms.get(player.roomId);
  if (!currentRoom) {
    return { type: 'error', message: 'You are in an unknown location.' };
  }
  
  if (!currentRoom.exits[direction]) {
    return { type: 'error', message: 'You cannot go that way.' };
  }
  
  const newRoomId = currentRoom.exits[direction];
  const newRoom = gameState.rooms.get(newRoomId);
  
  if (!newRoom) {
    return { type: 'error', message: 'The destination does not exist.' };
  }
  
  // Remove player from current room
  currentRoom.players.delete(player.id);
  
  // Add player to new room
  newRoom.players.add(player.id);
  
  // Update player's room
  player.roomId = newRoomId;
  
  // Notify other players in the old room
  broadcastToRoom(currentRoom.id, {
    type: 'message',
    message: `${player.name} has left to the ${direction}.`,
    exclude: [player.id]
  });
  
  // Notify other players in the new room
  broadcastToRoom(newRoom.id, {
    type: 'message',
    message: `${player.name} has arrived.`,
    exclude: [player.id]
  });
  
  // Return the look result for the new room
  return lookRoom(player);
}

// Look at room function
function lookRoom(player) {
  const room = gameState.rooms.get(player.roomId);
  if (!room) {
    return { type: 'error', message: 'You are in an unknown location.' };
  }
  
  let response = `<strong>${room.name}</strong>\n${room.description}\n\n`;
  
  // List exits
  response += 'Exits: ';
  const exits = Object.keys(room.exits);
  if (exits.length === 0) {
    response += 'none';
  } else {
    response += exits.join(', ');
  }
  response += '\n\n';
  
  // List players in the room
  const playersInRoom = Array.from(room.players)
    .filter(id => id !== player.id)
    .map(id => gameState.players.get(id)?.name || 'Unknown Player');
  
  if (playersInRoom.length > 0) {
    response += 'Players here: ' + playersInRoom.join(', ') + '\n';
  }
  
  // List mobs in the room
  const mobsInRoom = Array.from(room.mobs)
    .map(id => gameState.mobs.get(id)?.name || 'Unknown Creature');
  
  if (mobsInRoom.length > 0) {
    response += 'Creatures here: ' + mobsInRoom.join(', ') + '\n';
  }
  
  // List items in the room
  const itemsInRoom = Array.from(room.items)
    .map(id => gameState.items.get(id)?.name || 'Unknown Item');
  
  if (itemsInRoom.length > 0) {
    response += 'Items here: ' + itemsInRoom.join(', ') + '\n';
  }
  
  return { type: 'look', message: response };
}

// Look at specific target
function lookAt(player, target) {
  const room = gameState.rooms.get(player.roomId);
  if (!room) {
    return { type: 'error', message: 'You are in an unknown location.' };
  }
  
  // Check if looking at a player
  for (const playerId of room.players) {
    const otherPlayer = gameState.players.get(playerId);
    if (otherPlayer && otherPlayer.name.toLowerCase() === target.toLowerCase()) {
      return { 
        type: 'look', 
        message: `${otherPlayer.name} is a level ${otherPlayer.level} adventurer.` 
      };
    }
  }
  
  // Check if looking at a mob
  for (const mobId of room.mobs) {
    const mob = gameState.mobs.get(mobId);
    if (mob && mob.name.toLowerCase() === target.toLowerCase()) {
      return { 
        type: 'look', 
        message: `${mob.name}: ${mob.description}` 
      };
    }
  }
  
  // Check if looking at an exit
  if (room.exits[target]) {
    const exitRoom = gameState.rooms.get(room.exits[target]);
    if (exitRoom) {
      return { 
        type: 'look', 
        message: `You peer ${target} and see ${exitRoom.name}.` 
      };
    }
  }
  
  return { type: 'error', message: `You don't see ${target} here.` };
}

// Help command
function showHelp(player, topic) {
  if (!topic) {
    return { 
      type: 'help', 
      message: `
<strong>Available Commands:</strong>

<strong>Movement:</strong>
  north (n), south (s), east (e), west (w), up (u), down (d)

<strong>Information:</strong>
  look (l) - Look at the room or a specific object
  help - Display this help message
  help [topic] - Get help on a specific topic

<strong>Communication:</strong>
  say [message] - Say something to everyone in the room
  shout [message] - Shout something to everyone in the game
  whisper [player] [message] - Send a private message to another player
  emote (me) [action] - Perform a custom emote
  smile, laugh, wave, dance, bow - Perform predefined emotes

<strong>Combat:</strong>
  attack [target] - Attack a creature or player
  flee - Try to escape from combat

<strong>Items:</strong>
  inventory (i) - Show your inventory
  get [item] - Pick up an item
  drop [item] - Drop an item

Type 'help [command]' for more information on a specific command.
      `
    };
  }
  
  // Help for specific topics
  switch (topic.toLowerCase()) {
    case 'movement':
    case 'move':
      return { 
        type: 'help', 
        message: `
<strong>Movement Commands:</strong>

You can move in six directions: north, south, east, west, up, and down.
Each direction can be abbreviated to its first letter (n, s, e, w, u, d).

Example: 'north' or 'n' to move north.

You can only move in directions that have exits from your current location.
Use the 'look' command to see available exits.
        `
      };
      
    case 'look':
    case 'l':
      return { 
        type: 'help', 
        message: `
<strong>Look Command:</strong>

'look' or 'l' - Look at your surroundings
'look [object]' - Look at a specific object, player, or creature
'look [direction]' - Look in a specific direction

Examples:
  'look' - Describes the room you're in
  'look wolf' - Examines a wolf in the room
  'look north' - Looks at what's to the north
        `
      };
      
    case 'communication':
    case 'chat':
      return { 
        type: 'help', 
        message: `
<strong>Communication Commands:</strong>

'say [message]' - Say something to everyone in the room
'shout [message]' - Shout something to everyone in the game
'whisper [player] [message]' - Send a private message to another player
'emote [action]' or 'me [action]' - Perform a custom emote
'smile', 'laugh', 'wave', 'dance', 'bow' - Perform predefined emotes

Examples:
  'say Hello everyone!' - Says "Hello everyone!" to the room
  'shout I need help!' - Shouts to everyone in the game
  'whisper Alice Meet me at the castle' - Whispers to Alice
  'emote draws his sword' - Shows "Player draws his sword" to the room
        `
      };
      
    case 'combat':
      return { 
        type: 'help', 
        message: `
<strong>Combat Commands:</strong>

'attack [target]' or 'kill [target]' - Attack a creature or player
'flee' - Try to escape from combat (not yet implemented)

Combat is turn-based. When you attack a target, you deal damage based on your attack stat
minus the target's defense. The target will then counterattack.

If you defeat a creature, you gain experience points. Gain enough experience and you'll level up,
increasing your stats.

If you are defeated, you'll respawn at the castle entrance with full health.

Safe zones (like the castle) prevent combat from occurring.
        `
      };
      
    // Add more help topics as needed
      
    default:
      return { type: 'error', message: `No help available for '${topic}'.` };
  }
}

// Utility functions
function broadcastToRoom(roomId, data) {
  const room = gameState.rooms.get(roomId);
  if (!room) return;
  
  for (const playerId of room.players) {
    if (data.exclude && data.exclude.includes(playerId)) continue;
    sendToPlayer(playerId, data);
  }
}

function sendToPlayer(playerId, data) {
  const player = gameState.players.get(playerId);
  if (!player || !player.socket) return;
  
  try {
    player.socket.send(JSON.stringify(data));
  } catch (error) {
    console.error(`Error sending message to player ${playerId}:`, error);
  }
}

module.exports = { 
  parseCommand,
  movePlayer,
  lookRoom,
  lookAt,
  showHelp,
  broadcastToRoom,
  sendToPlayer
};
