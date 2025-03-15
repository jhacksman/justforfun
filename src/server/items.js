const { gameState } = require('./server');
const { broadcastToRoom, sendToPlayer } = require('./commands');

// Item system
function initializeItems(gameState) {
  console.log('Initializing items...');
  
  // Create some starter items
  const wolfPelt = {
    id: 'wolf-pelt',
    name: 'Wolf Pelt',
    description: 'A gray wolf pelt. It could be sold to a merchant or used for crafting.',
    value: 5,
    weight: 2,
    isEquippable: false,
    isConsumable: false
  };
  
  const wolfFang = {
    id: 'wolf-fang',
    name: 'Wolf Fang',
    description: 'A sharp wolf fang. It could be used for crafting.',
    value: 3,
    weight: 1,
    isEquippable: false,
    isConsumable: false
  };
  
  const rustyDagger = {
    id: 'rusty-dagger',
    name: 'Rusty Dagger',
    description: 'A rusty dagger. It\'s not very sharp, but it\'s better than nothing.',
    value: 10,
    weight: 2,
    isEquippable: true,
    equipSlot: 'weapon',
    attackBonus: 2,
    isConsumable: false
  };
  
  const leatherPouch = {
    id: 'leather-pouch',
    name: 'Leather Pouch',
    description: 'A small leather pouch. It contains a few coins.',
    value: 15,
    weight: 1,
    isEquippable: false,
    isConsumable: true,
    consumeEffect: 'gold',
    consumeValue: 5
  };
  
  const deerHide = {
    id: 'deer-hide',
    name: 'Deer Hide',
    description: 'A soft deer hide. It could be used for crafting or sold to a merchant.',
    value: 8,
    weight: 3,
    isEquippable: false,
    isConsumable: false
  };
  
  const venison = {
    id: 'venison',
    name: 'Venison',
    description: 'Fresh venison. It looks delicious and would restore some health if eaten.',
    value: 6,
    weight: 2,
    isEquippable: false,
    isConsumable: true,
    consumeEffect: 'health',
    consumeValue: 10
  };
  
  const bearPelt = {
    id: 'bear-pelt',
    name: 'Bear Pelt',
    description: 'A thick bear pelt. It\'s quite valuable and could be used for crafting warm clothing.',
    value: 20,
    weight: 5,
    isEquippable: false,
    isConsumable: false
  };
  
  const bearClaw = {
    id: 'bear-claw',
    name: 'Bear Claw',
    description: 'A sharp bear claw. It could be used for crafting or as a trophy.',
    value: 12,
    weight: 1,
    isEquippable: false,
    isConsumable: false
  };
  
  const leatherArmor = {
    id: 'leather-armor',
    name: 'Leather Armor',
    description: 'Basic leather armor. It provides some protection.',
    value: 25,
    weight: 8,
    isEquippable: true,
    equipSlot: 'armor',
    defenseBonus: 3,
    isConsumable: false
  };
  
  const healingPotion = {
    id: 'healing-potion',
    name: 'Healing Potion',
    description: 'A small vial containing a red liquid. It will restore health when consumed.',
    value: 15,
    weight: 1,
    isEquippable: false,
    isConsumable: true,
    consumeEffect: 'health',
    consumeValue: 25
  };
  
  // Add items to the game
  gameState.items.set('wolf-pelt', wolfPelt);
  gameState.items.set('wolf-fang', wolfFang);
  gameState.items.set('rusty-dagger', rustyDagger);
  gameState.items.set('leather-pouch', leatherPouch);
  gameState.items.set('deer-hide', deerHide);
  gameState.items.set('venison', venison);
  gameState.items.set('bear-pelt', bearPelt);
  gameState.items.set('bear-claw', bearClaw);
  gameState.items.set('leather-armor', leatherArmor);
  gameState.items.set('healing-potion', healingPotion);
  
  console.log('Items initialized with', gameState.items.size, 'items');
}

function showInventory(player, gameState) {
  if (player.inventory.size === 0) {
    return { type: 'inventory', message: 'Your inventory is empty.' };
  }
  
  let response = '<strong>Inventory:</strong>\n';
  for (const itemId of player.inventory) {
    const item = gameState.items.get(itemId);
    if (item) {
      response += `- ${item.name}: ${item.description}\n`;
    }
  }
  
  // Show equipped items if any
  if (player.equipment) {
    response += '\n<strong>Equipped:</strong>\n';
    for (const [slot, itemId] of Object.entries(player.equipment)) {
      if (itemId) {
        const item = gameState.items.get(itemId);
        if (item) {
          response += `- ${slot}: ${item.name}\n`;
        }
      }
    }
  }
  
  return { type: 'inventory', message: response };
}

function getItem(player, itemName, gameState) {
  const room = gameState.rooms.get(player.roomId);
  if (!room) {
    return { type: 'error', message: 'You are in an unknown location.' };
  }
  
  // Find the item in the room
  let itemId = null;
  let item = null;
  
  for (const id of room.items) {
    const roomItem = gameState.items.get(id);
    if (roomItem && roomItem.name.toLowerCase() === itemName.toLowerCase()) {
      itemId = id;
      item = roomItem;
      break;
    }
  }
  
  if (!item) {
    return { type: 'error', message: `You don't see ${itemName} here.` };
  }
  
  // Remove the item from the room
  room.items.delete(itemId);
  
  // Add the item to the player's inventory
  player.inventory.add(itemId);
  
  // Notify the room
  broadcastToRoom(room.id, {
    type: 'item',
    message: `${player.name} picks up ${item.name}.`,
    exclude: [player.id]
  });
  
  return { type: 'item', message: `You pick up ${item.name}.` };
}

function dropItem(player, itemName, gameState) {
  const room = gameState.rooms.get(player.roomId);
  if (!room) {
    return { type: 'error', message: 'You are in an unknown location.' };
  }
  
  // Find the item in the player's inventory
  let itemId = null;
  let item = null;
  
  for (const id of player.inventory) {
    const inventoryItem = items.get(id);
    if (inventoryItem && inventoryItem.name.toLowerCase() === itemName.toLowerCase()) {
      itemId = id;
      item = inventoryItem;
      break;
    }
  }
  
  if (!item) {
    return { type: 'error', message: `You don't have ${itemName}.` };
  }
  
  // Check if the item is equipped
  if (player.equipment) {
    for (const [slot, equippedItemId] of Object.entries(player.equipment)) {
      if (equippedItemId === itemId) {
        return { type: 'error', message: `You need to unequip ${item.name} first.` };
      }
    }
  }
  
  // Remove the item from the player's inventory
  player.inventory.delete(itemId);
  
  // Add the item to the room
  room.items.add(itemId);
  
  // Notify the room
  broadcastToRoom(room.id, {
    type: 'item',
    message: `${player.name} drops ${item.name}.`
  });
  
  return { type: 'item', message: `You drop ${item.name}.` };
}

function equipItem(player, itemName, gameState) {
  // Find the item in the player's inventory
  let itemId = null;
  let item = null;
  
  for (const id of player.inventory) {
    const inventoryItem = gameState.items.get(id);
    if (inventoryItem && inventoryItem.name.toLowerCase() === itemName.toLowerCase()) {
      itemId = id;
      item = inventoryItem;
      break;
    }
  }
  
  if (!item) {
    return { type: 'error', message: `You don't have ${itemName}.` };
  }
  
  // Check if the item is equippable
  if (!item.isEquippable) {
    return { type: 'error', message: `You can't equip ${item.name}.` };
  }
  
  // Initialize equipment object if it doesn't exist
  if (!player.equipment) {
    player.equipment = {};
  }
  
  // Check if something is already equipped in that slot
  const slot = item.equipSlot;
  if (player.equipment[slot]) {
    const oldItemId = player.equipment[slot];
    const oldItem = gameState.items.get(oldItemId);
    
    // Unequip the old item
    player.equipment[slot] = null;
    
    // Update player stats
    if (slot === 'weapon' && oldItem.attackBonus) {
      player.attack -= oldItem.attackBonus;
    } else if (slot === 'armor' && oldItem.defenseBonus) {
      player.defense -= oldItem.defenseBonus;
    }
    
    return { 
      type: 'equipment', 
      message: `You unequip ${oldItem.name} and equip ${item.name}.`,
      stats: {
        attack: player.attack,
        defense: player.defense
      }
    };
  }
  
  // Equip the new item
  player.equipment[slot] = itemId;
  
  // Update player stats
  if (slot === 'weapon' && item.attackBonus) {
    player.attack += item.attackBonus;
  } else if (slot === 'armor' && item.defenseBonus) {
    player.defense += item.defenseBonus;
  }
  
  return { 
    type: 'equipment', 
    message: `You equip ${item.name}.`,
    stats: {
      attack: player.attack,
      defense: player.defense
    }
  };
}

function unequipItem(player, itemName, gameState) {
  // Initialize equipment object if it doesn't exist
  if (!player.equipment) {
    return { type: 'error', message: `You don't have anything equipped.` };
  }
  
  // Find the equipped item
  let slot = null;
  let itemId = null;
  let item = null;
  
  for (const [s, id] of Object.entries(player.equipment)) {
    if (id) {
      const equippedItem = gameState.items.get(id);
      if (equippedItem && equippedItem.name.toLowerCase() === itemName.toLowerCase()) {
        slot = s;
        itemId = id;
        item = equippedItem;
        break;
      }
    }
  }
  
  if (!item) {
    return { type: 'error', message: `You don't have ${itemName} equipped.` };
  }
  
  // Unequip the item
  player.equipment[slot] = null;
  
  // Update player stats
  if (slot === 'weapon' && item.attackBonus) {
    player.attack -= item.attackBonus;
  } else if (slot === 'armor' && item.defenseBonus) {
    player.defense -= item.defenseBonus;
  }
  
  return { 
    type: 'equipment', 
    message: `You unequip ${item.name}.`,
    stats: {
      attack: player.attack,
      defense: player.defense
    }
  };
}

function useItem(player, itemName, gameState) {
  // Find the item in the player's inventory
  let itemId = null;
  let item = null;
  
  for (const id of player.inventory) {
    const inventoryItem = gameState.items.get(id);
    if (inventoryItem && inventoryItem.name.toLowerCase() === itemName.toLowerCase()) {
      itemId = id;
      item = inventoryItem;
      break;
    }
  }
  
  if (!item) {
    return { type: 'error', message: `You don't have ${itemName}.` };
  }
  
  // Check if the item is consumable
  if (!item.isConsumable) {
    if (item.isEquippable) {
      return equipItem(player, itemName, gameState);
    }
    return { type: 'error', message: `You can't use ${item.name}.` };
  }
  
  // Apply the consume effect
  let message = `You use ${item.name}.`;
  
  switch (item.consumeEffect) {
    case 'health':
      const oldHealth = player.health;
      player.health = Math.min(player.maxHealth, player.health + item.consumeValue);
      message = `You consume ${item.name} and restore ${player.health - oldHealth} health.`;
      break;
    case 'gold':
      if (!player.gold) player.gold = 0;
      player.gold += item.consumeValue;
      message = `You open ${item.name} and find ${item.consumeValue} gold.`;
      break;
    default:
      message = `You use ${item.name} but nothing happens.`;
  }
  
  // Remove the item from the player's inventory
  player.inventory.delete(itemId);
  
  return { 
    type: 'item', 
    message: message,
    health: player.health,
    maxHealth: player.maxHealth,
    gold: player.gold
  };
}

// Add items to rooms
function addItemsToRooms(gameState) {
  // Add healing potion to castle courtyard
  const castleCourtyard = gameState.rooms.get('castle-courtyard');
  if (castleCourtyard) {
    castleCourtyard.items.add('healing-potion');
  }
  
  // Add leather armor to castle guardhouse
  const castleGuardhouse = gameState.rooms.get('castle-guardhouse');
  if (castleGuardhouse) {
    castleGuardhouse.items.add('leather-armor');
  }
  
  // Add rusty dagger to forest path
  const forestPath = gameState.rooms.get('forest-path-1');
  if (forestPath) {
    forestPath.items.add('rusty-dagger');
  }
  
  console.log('Items added to rooms');
}

module.exports = {
  initializeItems,
  showInventory,
  getItem,
  dropItem,
  equipItem,
  unequipItem,
  useItem,
  addItemsToRooms
};
