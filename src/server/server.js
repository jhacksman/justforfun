const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Create Express app
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../client')));

// Game state (in-memory for now)
const players = new Map();
const rooms = new Map();
const items = new Map();
const mobs = new Map();

// WebSocket connection handler
wss.on('connection', (socket) => {
  console.log('Client connected');
  
  // Send welcome message
  socket.send(JSON.stringify({
    type: 'welcome',
    message: 'Welcome to the MUD! Please enter your name to begin.'
  }));
  
  // Handle messages from clients
  socket.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data);
      
      // Process message based on type
      if (data.type === 'command') {
        // Get the player ID associated with this socket
        let playerId = null;
        for (const [id, player] of players.entries()) {
          if (player.socket === socket) {
            playerId = id;
            break;
          }
        }
        
        if (!playerId) {
          socket.send(JSON.stringify({
            type: 'error',
            message: 'You are not logged in.'
          }));
          return;
        }
        
        // Parse and execute the command
        const result = commands.parseCommand(data.message, playerId);
        socket.send(JSON.stringify(result));
      }
      else if (data.type === 'login') {
        // Handle player login
        const result = playerManager.handleLogin(data, socket);
        socket.send(JSON.stringify(result));
        
        // If login was successful, also send the room description
        if (result.type === 'login') {
          // Find the player ID
          let playerId = null;
          for (const [id, player] of players.entries()) {
            if (player.socket === socket) {
              playerId = id;
              break;
            }
          }
          
          if (playerId) {
            const roomDescription = commands.lookRoom(players.get(playerId));
            socket.send(JSON.stringify(roomDescription));
          }
        }
      }
      
    } catch (error) {
      console.error('Error processing message:', error);
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });
  
  // Handle disconnection
  socket.on('close', () => {
    console.log('Client disconnected');
    
    // Find the player associated with this socket
    let playerId = null;
    for (const [id, player] of players.entries()) {
      if (player.socket === socket) {
        playerId = id;
        break;
      }
    }
    
    // Remove the player from the game
    if (playerId) {
      playerManager.removePlayer(playerId);
    }
  });
});

// Import the game world initialization function, command parser, player manager, combat system, chat system, and item system
const { initializeWorld } = require('./world');
const commands = require('./commands');
const playerManager = require('./players');
const combat = require('./combat');
const chat = require('./chat');
const itemSystem = require('./items');

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Initialize the game world after the server starts
  // Pass the game state to avoid circular dependencies
  initializeWorld({ players, rooms, items, mobs });
  
  // Initialize mobs and items
  combat.initializeMobs({ players, rooms, items, mobs });
  itemSystem.initializeItems({ players, rooms, items, mobs });
  itemSystem.addItemsToRooms({ players, rooms, items, mobs });
});

// Export necessary variables and functions for other modules
module.exports = {
  app,
  server,
  wss,
  players,
  rooms,
  items,
  mobs
};
