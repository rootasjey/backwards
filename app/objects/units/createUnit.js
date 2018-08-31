// ~~~~~~~~~~~~~~~~~~~~~~
// FACTORY: CREATE WEAPON
// ~~~~~~~~~~~~~~~~~~~~~~

import { types } from './const';
import { trainee } from './classes';

/**
 * Create a new character according to an initial stats.
 * The initial stats will help to determine which character class to choose.
 * @param {Object} stats Initial or previous character's stats.
 */
export const createUnit = (stats) => {
  switch (stats.class) {
  case types.trainee:
    return trainee(stats);

  default:
    return {};
  }
};