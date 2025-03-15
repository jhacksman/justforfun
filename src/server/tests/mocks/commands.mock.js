// Mock command functions
const parseCommand = jest.fn().mockImplementation((command) => {
  if (command === 'look') {
    return {
      type: 'look',
      message: 'You see a room.'
    };
  }
  return {
    type: 'error',
    message: 'Unknown command.'
  };
});

const lookRoom = jest.fn().mockReturnValue({
  type: 'look',
  message: 'You are in a room.'
});

const broadcastToRoom = jest.fn();

module.exports = {
  parseCommand,
  lookRoom,
  broadcastToRoom
};
