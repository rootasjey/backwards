import { baseUnit } from '../base';
import { types as WEAPON_TYPES } from '../../weapons/const';

/**
 * Create a new Trainee unit.
 * @param {Object} stats Initial unit's stats.
 */
export const trainee = (stats = {}) => {
  const initialStats = {
    constitution  : 0,
    defense       : 1,
    dexterity     : 1,
    intelligence  : 1,
    luck          : 0,
    resistance    : 1,
    strength      : 1,
    weaponsAllowed: { sword: WEAPON_TYPES.sword }
  };

  return baseUnit(Object.assign({}, initialStats, stats));
};