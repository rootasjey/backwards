# Game Mechanics Documentation - Backwards

## Core Gameplay Loop

### Turn Structure
1. **Turn Start**: Current player's units become available
2. **Unit Selection**: Player selects a unit to control
3. **Action Phase**: Unit can move and/or attack
4. **Action Resolution**: Effects are applied, animations play
5. **Turn End**: When all units have acted or player ends turn
6. **Next Player**: Turn passes to next player

### Victory Conditions
- **Defeat All Enemies**: Eliminate all opposing units
- **Survive X Days**: Last for a specified number of turns
- **Defeat Specific Enemy**: Eliminate a particular target unit
- **Rescue Mission**: Reach and protect a specific unit/location

## Unit System

### Unit Statistics
```typescript
interface UnitStats {
  fullHP: number;    // Maximum health points
  hp: number;        // Current health points
  str: number;       // Physical attack power
  mag: number;       // Magical attack power
  def: number;       // Physical defense
  res: number;       // Magical resistance
  move: number;      // Movement range in tiles
}
```

### Unit States
- **Unplayed**: Unit can act this turn (full opacity)
- **Played**: Unit has acted this turn (reduced opacity)
- **Selected**: Unit is currently selected (highlighted, shows ranges)
- **Animating**: Unit is moving (prevents other actions)

### Movement System
- **Grid-based**: Units move on discrete tile positions
- **Movement Range**: Each unit has a specific movement allowance
- **Pathfinding**: A* algorithm finds optimal path around obstacles
- **Collision**: Units cannot move through other units or obstacles
- **Movement Visualization**: Valid movement tiles are highlighted

### Combat Mechanics

#### Damage Calculation
```typescript
// Physical damage
totalAtk = weaponAtk + str - opponentDef;

// Magical damage  
totalAtk = weaponAtk + mag - opponentRes;

// Final damage (minimum 0)
finalDamage = Math.max(totalAtk, 0);
```

#### Weapon System
- **Weapon Types**: Sword, Lance, Axe, Bow, Magic
- **Damage Types**: Physical or Magical
- **Weapon Durability**: Limited uses before breaking
- **Attack Range**: Different weapons have different reach
- **Weapon Triangle**: Rock-paper-scissors effectiveness (planned)

#### Combat Range
- **Melee Weapons**: Adjacent tiles only
- **Ranged Weapons**: Multiple tile range
- **Range Visualization**: Attack range shown when unit selected
- **Line of Sight**: Obstacles may block ranged attacks (planned)

## Inventory System

### Inventory Mechanics
- **Capacity**: Maximum 5 items per unit
- **Item Types**: Weapons and Consumables
- **Equipment**: First weapon in inventory is equipped
- **Weapon Switching**: Can change equipped weapon during turn
- **Item Usage**: Consumables provide temporary effects

### Item Categories

#### Weapons
```typescript
interface Weapon {
  name: string;
  type: WeaponTypes;
  damageType: WeaponDamageType;
  atk: number;
  usage: number;        // Durability
  range: number;        // Attack range
  itemType: ItemTypes.weapon;
}
```

#### Consumables
```typescript
interface Consumable {
  name: string;
  effect: string;       // Healing, stat boost, etc.
  value: number;        // Effect magnitude
  itemType: ItemTypes.consumable;
}
```

### Inventory Operations
- **Add Item**: Add weapon or consumable to inventory
- **Remove Item**: Remove item from inventory
- **Move to Top**: Change equipped weapon
- **Use Item**: Consume item for effect

## Map System

### Tilemap Structure
- **Tiled Integration**: Maps created with Tiled map editor
- **Multiple Layers**: Different elements on separate layers
- **Tile Properties**: Custom properties for special tiles
- **Object Layers**: Unit spawn points and objectives

### Map Layers
1. **Floor**: Base terrain tiles
2. **Details**: Decorative elements
3. **Objects**: Interactive map objects
4. **Units**: Unit positions
5. **Movement**: Valid movement overlay
6. **Attack Range**: Attack range overlay
7. **Cursor**: Player cursor position
8. **Target Selector**: Target selection overlay

### Interactive Elements
- **Cursor System**: Visual feedback for player input
- **Tile Highlighting**: Movement and attack ranges
- **Unit Selection**: Visual indication of selected units
- **Animation System**: Smooth movement and combat animations

## Player Interaction

### Input Handling
- **Mouse/Touch**: Primary interaction method
- **Tile Selection**: Click/tap to select tiles
- **Unit Selection**: Click/tap units to select them
- **Movement**: Click destination to move selected unit
- **Attack**: Click target to attack with selected unit

### UI Feedback
- **Visual Indicators**: Color-coded tiles for different states
- **Animations**: Smooth transitions and feedback
- **Information Panels**: Unit stats and information display
- **Turn Indicators**: Current player and turn number display

### Game Flow
1. **Scene Loading**: Boot → Menu → Play
2. **Map Initialization**: Load tilemap and create units
3. **Turn Management**: Handle player turns and progression
4. **Event Processing**: Handle user input and game events
5. **State Updates**: Update game state and visual representation

## Advanced Mechanics (Planned/Partial)

### Weapon Triangle
- **Sword > Axe > Lance > Sword**: Rock-paper-scissors effectiveness
- **Damage Modifiers**: Bonus/penalty based on weapon matchup
- **Strategic Depth**: Encourages diverse unit composition

### Terrain Effects
- **Movement Costs**: Different terrain types affect movement
- **Defensive Bonuses**: Some tiles provide defense bonuses
- **Special Tiles**: Healing tiles, trap tiles, etc.

### Status Effects
- **Buffs/Debuffs**: Temporary stat modifications
- **Duration Tracking**: Effects last for specific number of turns
- **Visual Indicators**: Show active effects on units

### AI System (Planned)
- **Enemy AI**: Computer-controlled opponents
- **Difficulty Levels**: Different AI behaviors
- **Pathfinding**: AI uses same movement system as player

## Technical Implementation Notes

### Performance Considerations
- **Sprite Pooling**: Reuse sprites for better performance
- **Layer Management**: Efficient rendering of multiple layers
- **Event Optimization**: Minimize unnecessary event firing
- **Animation Queuing**: Smooth animation sequences

### Extensibility
- **Data-Driven**: Units, weapons, maps defined in JSON
- **Modular Design**: Easy to add new unit types, weapons, etc.
- **Event System**: Loose coupling allows easy feature addition
- **Factory Pattern**: Centralized object creation

This documentation serves as a comprehensive guide to the game's mechanics and can be used for both development reference and player documentation.
