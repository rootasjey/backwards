// ~~~~~~~~~~~~~~~~~~~~~~~~
// SWORD BASE STRUCTURE
// ~~~~~~~~~~~~~~~~~~~~~~~~

import { baseWeapon } from '../base';
import { types } from '../const';

export const baseSword = (stats = {}) => {
  const initialStats = {
    atk       : 2,
    physical  : true,
    type      : types.sword,
    range     : 1
  };

  return baseWeapon(initialStats, ...stats);
};