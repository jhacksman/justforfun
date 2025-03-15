// Mock player management functions
const handleLogin = jest.fn().mockImplementation((data, socket) => {
  return {
    type: 'login',
    message: `Welcome, ${data.name}!`,
    player: {
      name: data.name,
      class: data.className,
      level: 1,
      health: 100,
      maxHealth: 100,
      experience: 0
    }
  };
});

const removePlayer = jest.fn();

module.exports = {
  handleLogin,
  removePlayer
};
