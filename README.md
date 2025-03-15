# JustForFun MUD

A web-based multi-user dungeon (MUD) with an ultra-low latency webserver that serves a text-based adventure game.

## What is a MUD?

A Multi-User Dungeon (MUD) is a multiplayer real-time virtual world, primarily text-based, that combines elements of:
- Role-playing games
- Hack and slash combat
- Player versus player interaction
- Interactive fiction
- Online chat

Players interact with the game world and each other by typing commands that resemble natural language.

## Core Features

### World Design
- **Starting Area**: Players begin in a castle that serves as the central hub and safe zone
- **Scaling Difficulty**: Monsters become progressively more challenging the further players venture from the castle
- **Rich Environment**: Detailed room descriptions with objects, NPCs, and exits
- **Persistent World**: The game world continues to exist and evolve even when players are offline

### Character System
- **Character Creation**: Customizable characters with different races and classes
- **Skill Progression**: Characters gain experience and level up through combat and quests
- **Attributes**: Strength, Dexterity, Intelligence, etc. that affect gameplay
- **Equipment**: Weapons, armor, and items that can be found, purchased, or crafted

### Command System

#### Movement Commands
- **Cardinal Directions**: `north`, `south`, `east`, `west` (or abbreviated as `n`, `s`, `e`, `w`)
- **Vertical Movement**: `up`, `down` (or `u`, `d`)
- **Special Movement**: `enter`, `exit`, `climb`, `swim`

#### Combat Commands
- **Attack**: `attack [target]`, `kill [target]`
- **Combat Skills**: `cast [spell] [target]`, `bash [target]`, `backstab [target]`
- **Defensive Actions**: `flee`, `hide`, `parry`
- **Target Selection**: `consider [target]` to evaluate difficulty

#### Social Commands
- **Communication**: `say [message]`, `shout [message]`, `whisper [player] [message]`
- **Channels**: `chat [message]`, `newbie [message]`, `guild [message]`
- **Emotes**: `emote [action]`, `smile`, `laugh`, `wave`
- **Group Management**: `follow [player]`, `group [player]`, `ungroup [player]`

#### Object Interaction
- **Inventory Management**: `inventory`, `get [item]`, `drop [item]`, `give [player] [item]`
- **Equipment**: `wear [item]`, `wield [weapon]`, `remove [item]`
- **Environment**: `look`, `examine [object]`, `search`, `open [door]`, `close [door]`

#### Information Commands
- **Help System**: `help [topic]`, `commands`, `rules`
- **Character Info**: `score`, `skills`, `attributes`, `equipment`
- **World Info**: `time`, `weather`, `who` (lists online players)

### Gameplay Elements
- **Quests**: Tasks and missions for players to complete for rewards
- **Crafting**: Create items from gathered resources
- **Economy**: Currency system, shops, trading between players
- **Housing**: Player-owned spaces that can be customized
- **PvP Zones**: Designated areas for player versus player combat

## Technical Goals
- Ultra-low latency webserver for real-time interaction
- Responsive text-based interface
- Scalable architecture to support multiple concurrent users
- Persistent data storage for player progress and world state

## Development Roadmap
1. Core engine and command parser
2. World building and content creation
3. Character system implementation
4. Combat mechanics
5. Social features and multiplayer functionality
6. Web interface optimization
7. Testing and balancing
8. Launch and ongoing content updates
