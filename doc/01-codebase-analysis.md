# Codebase Analysis - Backwards Game

## Overview

**Backwards** (originally "Cycles") is a turn-based tactical game built with Phaser 3 and TypeScript. The game features grid-based movement, unit management, inventory systems, and tactical combat mechanics similar to classic strategy RPGs.

## Technology Stack

### Core Technologies
- **Game Engine**: Phaser 3.24.1 (JavaScript game framework)
- **Language**: TypeScript 3.9.7
- **Build Tool**: Snowpack 2.0.0 (ES modules bundler)
- **Testing**: AVA 3.10.1 (test runner)
- **Package Manager**: Yarn (with lock file)

### Development Tools
- **Linting**: ESLint 7.5.0 with TypeScript support
- **Code Style**: Standard TypeScript configuration
- **Type Checking**: TypeScript with strict mode enabled

## Architecture Overview

### Core Game Structure

The game follows a modular architecture with clear separation of concerns:

```
src/
├── index.ts              # Entry point and Phaser game configuration
├── scenes/               # Phaser scenes (boot, menu, play)
├── gameObjects/          # Core game logic classes
├── logic/                # Business logic (units, inventory)
├── actions/              # Event-driven action system
├── const/                # Game constants and configuration
├── sprites/              # Sprite management
└── typings/              # TypeScript type definitions
```

### Key Components

#### 1. Game Singleton (`src/gameObjects/Game.ts`)
- Central game state manager
- Holds references to core systems: GameMap, MapUI, Turn, TurnVisualizer
- Provides global access to game components

#### 2. GameMap (`src/gameObjects/GameMap.ts`)
- Manages the tilemap-based game world
- Handles unit placement and movement
- Implements cursor system for player interaction
- Manages multiple tilemap layers (floor, units, movement, attack range, etc.)
- Integrates with Tiled map editor format

#### 3. Unit System
- **Unit** (`src/logic/Unit.ts`): Core unit logic with stats, inventory, combat
- **TileUnit** (`src/gameObjects/TileUnit.ts`): Combines Unit with tile position and visual representation
- **unitsFactory** (`src/logic/unitsFactory.ts`): Factory pattern for unit creation

#### 4. Turn Management (`src/gameObjects/Turn.ts`)
- Manages player turns and turn order
- Tracks which units have acted
- Handles turn progression and state

#### 5. Inventory System (`src/logic/Inventory.ts`)
- Manages unit equipment and items
- Supports weapons and consumables
- Implements weapon switching and usage tracking

### Data-Driven Design

The game uses JSON files for configuration:
- `heroes.json`: Hero unit definitions
- `unitsClasses.json`: Unit class templates
- `weapons.json`: Weapon statistics and properties
- `consumables.json`: Consumable item definitions
- `level0.json`: Tiled map data

### Event System

The game implements an event-driven architecture with action modules:
- `actions/map.ts`: Map-related events
- `actions/unit.ts`: Unit action events
- `actions/targetSelector.ts`: Target selection events
- `actions/weaponSelector.ts`: Weapon selection events

## Code Quality Assessment

### Strengths
1. **Type Safety**: Strong TypeScript usage with strict mode
2. **Modular Design**: Clear separation between game logic and presentation
3. **Factory Pattern**: Clean unit creation system
4. **Event-Driven**: Decoupled communication between components
5. **Data-Driven**: External JSON configuration for game content

### Areas for Improvement
1. **Error Handling**: Limited error handling throughout the codebase
2. **Documentation**: Minimal inline documentation and comments
3. **Testing Coverage**: Only basic inventory tests, missing comprehensive test suite
4. **Code Duplication**: Some repetitive patterns in event handling
5. **Magic Numbers**: Hard-coded values scattered throughout the code

### Technical Debt
1. **TypeScript Errors**: Several `@ts-expect-error` comments indicating type issues
2. **Commented Code**: Extensive commented-out code in configuration files
3. **Inconsistent Naming**: Mix of camelCase and other conventions
4. **Tight Coupling**: Some components have direct dependencies that could be abstracted

## Performance Considerations

### Current State
- Uses Phaser's built-in optimization for sprite rendering
- Tilemap system provides efficient rendering for grid-based gameplay
- Event system allows for responsive UI updates

### Potential Issues
- No object pooling for frequently created/destroyed objects
- Pathfinding calculations could be expensive for large maps
- No lazy loading of assets or scenes

## Security and Maintenance

### Current Security Posture
- Client-side only game with no server communication
- No user input validation beyond game mechanics
- Asset loading from trusted local sources

### Maintenance Concerns
- Dependencies are significantly outdated (2020 versions)
- Build system (Snowpack) is deprecated in favor of Vite
- Limited automated testing for regression prevention

## Game Mechanics Summary

### Core Gameplay
1. **Turn-Based Combat**: Players take turns moving and acting with units
2. **Grid Movement**: Units move on a tile-based grid with movement ranges
3. **Tactical Combat**: Weapon types, damage calculations, and positioning matter
4. **Inventory Management**: Units can carry and switch between weapons/items
5. **Multiple Victory Conditions**: Defeat enemies, survive, rescue objectives

### Technical Implementation
- Pathfinding using A* algorithm via `pathfinding` library
- Sprite animations for unit selection and movement
- Layer-based rendering for different game elements
- JSON-driven content system for easy modification

This analysis provides the foundation for understanding the current state and identifying improvement opportunities.
