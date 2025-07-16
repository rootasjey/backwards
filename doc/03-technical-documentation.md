# Technical Documentation - Backwards Game

## Game Overview

**Backwards** is a turn-based tactical RPG built with Phaser 3 and TypeScript. Players control units on a grid-based battlefield, managing resources, positioning, and combat to achieve victory conditions.

## Core Game Mechanics

### Turn System
- **Turn-based gameplay**: Players alternate turns
- **Unit activation**: Each unit can act once per turn
- **Turn progression**: Automatic advancement when all units have acted
- **Victory conditions**: Defeat enemies, survive X turns, rescue objectives

### Unit Management
- **Grid-based movement**: Units move on a tile-based map
- **Movement range**: Each unit has a specific movement allowance
- **Action economy**: Move and attack in the same turn
- **Unit states**: Active, played, selected states with visual feedback

### Combat System
- **Weapon types**: Physical and magical damage types
- **Damage calculation**: Attack vs Defense/Resistance
- **Weapon durability**: Limited usage before breaking
- **Range-based combat**: Different weapons have different attack ranges

### Inventory System
- **Equipment slots**: 5 item maximum per unit
- **Weapon switching**: Change equipped weapon during combat
- **Consumables**: Healing items and temporary buffs
- **Item management**: Add, remove, and organize inventory

## Architecture Deep Dive

### Core Classes and Responsibilities

#### Game Singleton Pattern
```typescript
export class Game {
  public static instance: Phaser.Game;
  public static gameMap: GameMap;
  public static mapUI: MapUI;
  public static turn: Turn;
  public static turnVisualizer: TurnVisualizer;
}
```
- **Purpose**: Central access point for all game systems
- **Pattern**: Singleton with static references
- **Responsibility**: Coordinate between major systems

#### GameMap - World Management
```typescript
export default class GameMap extends Phaser.GameObjects.GameObject
```
- **Tilemap Integration**: Uses Phaser's tilemap system with Tiled editor
- **Layer Management**: Multiple layers for different game elements
  - `floor`: Base terrain
  - `units`: Unit positions
  - `movement`: Valid movement tiles
  - `attackRange`: Attack range visualization
  - `cursor`: Player cursor position
  - `targetSelector`: Target selection overlay
- **Event Handling**: Processes player input and game events
- **Pathfinding**: Integrates A* pathfinding for unit movement

#### Unit System Architecture
```typescript
// Core unit logic
class Unit {
  private readonly data: UnitData;
  private readonly stats: UnitStats;
  private readonly privateInventory: InventoryShape;
}

// Visual representation + tile position
class TileUnit extends Phaser.GameObjects.GameObject {
  private readonly unit: Unit;
  private readonly tile: Phaser.Tilemaps.Tile;
  private readonly sprite: Phaser.GameObjects.Sprite;
}
```
- **Separation of Concerns**: Logic (Unit) vs Presentation (TileUnit)
- **Composition**: TileUnit contains Unit rather than inheritance
- **Factory Pattern**: unitsFactory creates units from JSON data

#### Turn Management
```typescript
export default class Turn {
  private players: Player[];
  private currentPlayerIndex: number;
  private TURN_NUMBER: number;
}
```
- **Player Management**: Tracks multiple players and turn order
- **State Tracking**: Manages which units have acted
- **Turn Progression**: Handles end-of-turn logic and cleanup

### Data Flow Architecture

#### Event-Driven Communication
```
User Input → GameMap → Events → Action Handlers → Game State Update → Visual Update
```

#### Action System
- **map.ts**: Map interaction events (cursor movement, tile selection)
- **unit.ts**: Unit action events (movement, attack, selection)
- **targetSelector.ts**: Target selection events
- **weaponSelector.ts**: Weapon switching events

#### Data Sources
```
JSON Files → Factory Functions → Game Objects → Runtime State
```

### File Structure Analysis

```
src/
├── index.ts                 # Game initialization and Phaser config
├── scenes/                  # Phaser scene management
│   ├── boot.ts             # Asset loading scene
│   ├── menu.ts             # Main menu scene
│   └── play.ts             # Main gameplay scene
├── gameObjects/            # Core game logic classes
│   ├── Game.ts             # Central game state manager
│   ├── GameMap.ts          # World and tilemap management
│   ├── MapUI.ts            # User interface overlay
│   ├── TileUnit.ts         # Unit + tile combination
│   ├── Turn.ts             # Turn management system
│   ├── TurnVisualizer.ts   # Turn display UI
│   ├── TargetSelector.ts   # Target selection system
│   └── VisualLoader.ts     # Asset loading utilities
├── logic/                  # Business logic (pure functions)
│   ├── Unit.ts             # Core unit mechanics
│   ├── Inventory.ts        # Item management
│   ├── unitsFactory.ts     # Unit creation factory
│   └── inventoryFactory.ts # Inventory creation factory
├── actions/                # Event handling system
│   ├── map.ts              # Map-related events
│   ├── unit.ts             # Unit action events
│   ├── targetSelector.ts   # Target selection events
│   └── weaponSelector.ts   # Weapon selection events
├── const/                  # Game configuration and constants
│   ├── config.ts           # Game settings and colors
│   ├── items.ts            # Item type definitions
│   └── weapons.ts          # Weapon type definitions
├── sprites/                # Sprite management
│   ├── base.ts             # Base sprite class
│   └── player.ts           # Player sprite implementation
└── typings/                # TypeScript type definitions
    ├── custom.d.ts          # Custom type declarations
    └── cycles.d.ts          # Game-specific types
```

### Key Design Patterns

#### Factory Pattern
- **unitsFactory**: Creates units from JSON configuration
- **inventoryFactory**: Creates inventories with items
- **Benefits**: Centralized creation logic, easy to extend

#### Observer Pattern
- **Event System**: Components communicate via events
- **Phaser Events**: Built-in event emitter system
- **Benefits**: Loose coupling, easy to add new features

#### Singleton Pattern
- **Game Class**: Central access to game systems
- **Trade-offs**: Easy access vs potential tight coupling

#### Composition over Inheritance
- **TileUnit**: Contains Unit rather than extending it
- **Benefits**: Flexible, easier to test and maintain

## Technical Implementation Details

### Pathfinding System
```typescript
// Uses external pathfinding library
import * as PF from 'pathfinding';

// Grid-based A* pathfinding
const finder = new PF.AStarFinder();
const path = finder.findPath(startX, startY, endX, endY, grid);
```

### Animation System
```typescript
// Phaser tween-based animations
this.scene.tweens.timeline({
  targets: this.sprite,
  tweens: path.map(([x, y]) => ({
    x: tilemapLayer.tileToWorldX(x),
    y: tilemapLayer.tileToWorldY(y),
    duration: 100
  }))
});
```

### Asset Management
- **Tiled Integration**: Maps created in Tiled map editor
- **JSON Configuration**: Units, weapons, items defined in JSON
- **Sprite Atlases**: Efficient sprite rendering with atlases
- **Asset Loading**: Preloaded in boot scene

### State Management
- **Game State**: Centralized in Game singleton
- **Unit State**: Distributed across Unit and TileUnit classes
- **Turn State**: Managed by Turn class
- **UI State**: Handled by MapUI and TurnVisualizer

## API Reference

### Core Classes

#### Unit Class
```typescript
class Unit {
  // Properties
  get fullHP(): number
  get hp(): number
  get move(): number
  get name(): string
  get inventory(): InventoryShape

  // Methods
  attackTarget(target: Unit): Unit
  canEquip(weapon: Weapon): boolean
  equip(weapon: Weapon): Unit
  getAtk(opponent?: Unit): number
  receiveDamage(damage: number): Unit
  useCurrentWeapon(times: number): Unit
}
```

#### TileUnit Class
```typescript
class TileUnit extends Phaser.GameObjects.GameObject {
  // Properties
  readonly PLAYER: { id: string, name: string }

  // Methods
  bringToFront(): TileUnit
  canMoveTo(coord: Coord): boolean
  getUnit(): Unit
  markAsPlayed(): TileUnit
  markAsUnplayed(): TileUnit
  moveTo(endX: number, endY: number): Promise<{moved: boolean, tileUnit: TileUnit}>
  select(): TileUnit
  sendToBack(): TileUnit
}
```

#### GameMap Class
```typescript
class GameMap extends Phaser.GameObjects.GameObject {
  // Properties
  layers: GameMapLayers
  map: Phaser.Tilemaps.Tilemap
  selectedUnit?: Phaser.Tilemaps.Tile

  // Methods
  getAllPlayersOnMap(): Player[]
  getUnitAt(x: number, y: number): TileUnit | undefined
  highlightMovementRange(unit: TileUnit): void
  showAttackRange(unit: TileUnit): void
}
```

### Event System

#### Map Events
```typescript
// Event names from actions/map.ts
const mapEvents = {
  CANCEL: 'map:cancel',
  END_TURN: 'map:endTurn',
  SUSPEND: 'map:suspend'
};
```

#### Unit Events
```typescript
// Event names from actions/unit.ts
const unitEvents = {
  ATTACK: 'unit:attack',
  MOVE: 'unit:move',
  SELECT: 'unit:select'
};
```

### Configuration

#### Game Constants
```typescript
// From const/config.ts
const colors = {
  tileMovementActive: 0x00ff00,
  tileMovementPassive: 0x0000ff,
  attackRange: 0xff0000
};
```

#### Weapon Types
```typescript
// From const/weapons.ts
enum WeaponTypes {
  sword = 'sword',
  lance = 'lance',
  axe = 'axe',
  bow = 'bow',
  magic = 'magic'
}

enum WeaponDamageType {
  physical = 'physical',
  magical = 'magical'
}
```

This documentation provides the foundation for understanding the game's technical implementation and serves as a reference for future development and maintenance.
