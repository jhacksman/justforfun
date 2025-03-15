// DOM Elements
const loginScreen = document.getElementById('login-screen');
const gameScreen = document.getElementById('game-screen');
const characterNameInput = document.getElementById('character-name');
const characterClassSelect = document.getElementById('character-class');
const loginButton = document.getElementById('login-button');
const outputContainer = document.getElementById('output-container');
const output = document.getElementById('output');
const commandInput = document.getElementById('command-input');
const sendButton = document.getElementById('send-button');
const healthSpan = document.getElementById('health');
const maxHealthSpan = document.getElementById('max-health');
const levelSpan = document.getElementById('level');
const expSpan = document.getElementById('exp');
const commandButtons = document.querySelectorAll('.command-btn');

// Game state
let socket;
let connected = false;
let loggedIn = false;
let playerData = {
  name: '',
  class: '',
  level: 1,
  health: 100,
  maxHealth: 100,
  experience: 0
};

// Connect to the WebSocket server
function connectToServer() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.hostname;
  const port = 3000; // Match the server port
  
  const wsUrl = `${protocol}//${host}:${port}`;
  
  socket = new WebSocket(wsUrl);
  
  socket.onopen = () => {
    connected = true;
    appendToOutput('Connected to server.', 'system');
  };
  
  socket.onclose = () => {
    connected = false;
    loggedIn = false;
    appendToOutput('Disconnected from server. Trying to reconnect...', 'error');
    setTimeout(connectToServer, 5000);
  };
  
  socket.onerror = (error) => {
    appendToOutput('WebSocket error: ' + error.message, 'error');
  };
  
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      handleServerMessage(data);
    } catch (error) {
      appendToOutput('Error parsing server message: ' + error.message, 'error');
    }
  };
}

// Handle messages from the server
function handleServerMessage(data) {
  switch (data.type) {
    case 'welcome':
      appendToOutput(data.message, 'system');
      break;
      
    case 'login':
      handleLogin(data);
      break;
      
    case 'error':
      appendToOutput(data.message, 'error');
      break;
      
    case 'look':
      appendToOutput(data.message, 'look');
      break;
      
    case 'chat':
      appendToOutput(data.message, 'chat');
      break;
      
    case 'emote':
      appendToOutput(data.message, 'emote');
      break;
      
    case 'combat':
      appendToOutput(data.message, 'combat');
      updatePlayerStats(data);
      break;
      
    case 'death':
      appendToOutput(data.message, 'combat');
      updatePlayerStats(data);
      break;
      
    case 'levelup':
      appendToOutput(data.message, 'system');
      updatePlayerStats(data);
      break;
      
    case 'inventory':
      appendToOutput(data.message, 'item');
      break;
      
    case 'item':
      appendToOutput(data.message, 'item');
      updatePlayerStats(data);
      break;
      
    case 'equipment':
      appendToOutput(data.message, 'item');
      if (data.stats) {
        playerData.attack = data.stats.attack;
        playerData.defense = data.stats.defense;
      }
      break;
      
    case 'help':
      appendToOutput(data.message, 'help');
      break;
      
    default:
      appendToOutput(JSON.stringify(data), 'system');
  }
}

// Handle successful login
function handleLogin(data) {
  loggedIn = true;
  playerData = {
    ...playerData,
    ...data.player
  };
  
  // Update UI with player data
  updatePlayerStats(playerData);
  
  // Switch to game screen
  loginScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  
  appendToOutput(data.message, 'system');
  
  // Focus on command input
  commandInput.focus();
}

// Update player stats in the UI
function updatePlayerStats(data) {
  if (data.health !== undefined) {
    playerData.health = data.health;
    healthSpan.textContent = data.health;
  }
  
  if (data.maxHealth !== undefined) {
    playerData.maxHealth = data.maxHealth;
    maxHealthSpan.textContent = data.maxHealth;
  }
  
  if (data.level !== undefined) {
    playerData.level = data.level;
    levelSpan.textContent = data.level;
  }
  
  if (data.experience !== undefined) {
    playerData.experience = data.experience;
    expSpan.textContent = data.experience;
  }
}

// Append message to the output container
function appendToOutput(message, type) {
  const messageElement = document.createElement('div');
  messageElement.className = `message ${type}`;
  messageElement.innerHTML = message;
  
  output.appendChild(messageElement);
  
  // Scroll to bottom
  outputContainer.scrollTop = outputContainer.scrollHeight;
}

// Send command to the server
function sendCommand(command) {
  if (!connected) {
    appendToOutput('Not connected to server.', 'error');
    return;
  }
  
  if (!loggedIn && command.trim().toLowerCase() !== 'login') {
    appendToOutput('You need to log in first.', 'error');
    return;
  }
  
  try {
    const message = {
      type: 'command',
      message: command
    };
    
    socket.send(JSON.stringify(message));
    
    // Echo the command to the output
    appendToOutput(`> ${command}`, 'system');
    
    // Clear the input field
    commandInput.value = '';
  } catch (error) {
    appendToOutput('Error sending command: ' + error.message, 'error');
  }
}

// Login to the game
function login() {
  const name = characterNameInput.value.trim();
  const className = characterClassSelect.value;
  
  if (!name) {
    appendToOutput('Please enter a character name.', 'error');
    return;
  }
  
  if (name.length < 2 || name.length > 20) {
    appendToOutput('Character name must be between 2 and 20 characters.', 'error');
    return;
  }
  
  try {
    const message = {
      type: 'login',
      name: name,
      className: className
    };
    
    socket.send(JSON.stringify(message));
    
    playerData.name = name;
    playerData.class = className;
  } catch (error) {
    appendToOutput('Error logging in: ' + error.message, 'error');
  }
}

// Event Listeners
loginButton.addEventListener('click', login);

characterNameInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    login();
  }
});

sendButton.addEventListener('click', () => {
  const command = commandInput.value.trim();
  if (command) {
    sendCommand(command);
  }
});

commandInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    const command = commandInput.value.trim();
    if (command) {
      sendCommand(command);
    }
  }
});

// Command buttons
commandButtons.forEach(button => {
  button.addEventListener('click', () => {
    const command = button.getAttribute('data-command');
    if (command) {
      sendCommand(command);
      commandInput.focus();
    }
  });
});

// Connect to the server when the page loads
window.addEventListener('load', connectToServer);

// Command history
let commandHistory = [];
let historyIndex = -1;

commandInput.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') {
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      commandInput.value = commandHistory[historyIndex];
    }
    event.preventDefault();
  } else if (event.key === 'ArrowDown') {
    if (historyIndex > 0) {
      historyIndex--;
      commandInput.value = commandHistory[historyIndex];
    } else if (historyIndex === 0) {
      historyIndex = -1;
      commandInput.value = '';
    }
    event.preventDefault();
  }
});

// Add command to history
function addToHistory(command) {
  if (command && command !== commandHistory[0]) {
    commandHistory.unshift(command);
    if (commandHistory.length > 50) {
      commandHistory.pop();
    }
    historyIndex = -1;
  }
}

// Override the sendCommand function to add commands to history
const originalSendCommand = sendCommand;
sendCommand = function(command) {
  addToHistory(command);
  originalSendCommand(command);
};
