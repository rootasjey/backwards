// ~~~~~~~~~~~~~~~~~~~~~~
// FACTORY: CREATE WEAPON
// ~~~~~~~~~~~~~~~~~~~~~~

import { types } from './const';
import { trainee } from './classes';

import { createInventory } from '../items/createInventory';

/**
 * Create a new character according to an initial stats.
 * The initial stats will help to determine which character class to choose.
 * @param {Object} stats Initial or previous character's stats.
 */
export const createUnit = (stats) => {
  let unit = {};

  switch (stats.class) {
  case types.trainee:
    unit = trainee(stats);
    break;
  default:
    unit = trainee(stats);
  }

  unit.inventory = createInventory({ items: unit.items, unit });

  return unit;
};