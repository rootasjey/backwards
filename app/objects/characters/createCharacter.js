import { newbie } from './classes';

/**
 * Create a new character according to an initial stats.
 * The initial stats will help to determine which character class to choose.
 * @param {Object} stats Initial or previous character's stats.
 */
export const createCharacter = (stats) => {
  switch (stats.class) {
  case 'newbie':
    return newbie(stats);

  default:
    return {};
  }
};