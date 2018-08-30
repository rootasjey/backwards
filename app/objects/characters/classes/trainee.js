import { baseCharacter } from '../base';

/**
 * Create a new Trainee character.
 * @param {Object} stats Initial character's stats.
 */
export const trainee = (stats = {}) => {
  const initialStats = {
    constitution  : 0,
    defense       : 1,
    dexterity     : 1,
    intelligence  : 1,
    luck          : 0,
    resistance    : 1,
    strength      : 1
  };

  return baseCharacter(initialStats, ...stats);
};