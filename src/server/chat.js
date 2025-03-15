const { players, rooms } = require('./server');
const { broadcastToRoom, sendToPlayer } = require('./commands');

// Chat system
function say(player, message, gameState) {
  const { players, rooms } = gameState;
  const room = rooms.get(player.roomId);
  if (!room) {
    return { type: 'error', message: 'You are in an unknown location.' };
  }
  
  broadcastToRoom(room.id, {
    type: 'chat',
    channel: 'say',
    sender: player.name,
    message: `${player.name} says: "${message}"`
  });
  
  return { type: 'chat', message: `You say: "${message}"` };
}

function shout(player, message, gameState) {
  const { players } = gameState;
  broadcastToAll({
    type: 'chat',
    channel: 'shout',
    sender: player.name,
    message: `${player.name} shouts: "${message}"`
  }, gameState);
  
  return { type: 'chat', message: `You shout: "${message}"` };
}

function whisper(player, targetName, message, gameState) {
  const { players } = gameState;
  // Find the target player
  let targetPlayer = null;
  for (const [_, p] of players.entries()) {
    if (p.name.toLowerCase() === targetName.toLowerCase()) {
      targetPlayer = p;
      break;
    }
  }
  
  if (!targetPlayer) {
    return { type: 'error', message: `Player ${targetName} is not online.` };
  }
  
  // Send the whisper to the target player
  sendToPlayer(targetPlayer.id, {
    type: 'chat',
    channel: 'whisper',
    sender: player.name,
    message: `${player.name} whispers: "${message}"`
  });
  
  return { type: 'chat', message: `You whisper to ${targetPlayer.name}: "${message}"` };
}

function emote(player, action, gameState) {
  const { players, rooms } = gameState;
  const room = rooms.get(player.roomId);
  if (!room) {
    return { type: 'error', message: 'You are in an unknown location.' };
  }
  
  broadcastToRoom(room.id, {
    type: 'emote',
    sender: player.name,
    message: `${player.name} ${action}`
  });
  
  return { type: 'emote', message: `You ${action}` };
}

// Predefined emotes
function smile(player, gameState) {
  return emote(player, 'smiles.', gameState);
}

function laugh(player, gameState) {
  return emote(player, 'laughs heartily.', gameState);
}

function wave(player, gameState) {
  return emote(player, 'waves.', gameState);
}

function dance(player, gameState) {
  return emote(player, 'dances around excitedly.', gameState);
}

function bow(player, gameState) {
  return emote(player, 'bows gracefully.', gameState);
}

function broadcastToAll(data, gameState) {
  const { players } = gameState;
  for (const [playerId, _] of players.entries()) {
    if (data.exclude && data.exclude.includes(playerId)) continue;
    sendToPlayer(playerId, data);
  }
}

module.exports = { 
  say, 
  shout, 
  whisper, 
  emote,
  smile,
  laugh,
  wave,
  dance,
  bow,
  broadcastToAll 
};
