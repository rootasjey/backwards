// ~~~~~~~~~~~~~~~~~~~~~~~~
// SWORD BASE STRUCTURE
// ~~~~~~~~~~~~~~~~~~~~~~~~

import { baseWeapon } from '../base';
import { damageTypes, types } from '../const';

export const baseSword = (stats = {}) => {
  const initialStats = {
    physical    : true,
    damageType  : damageTypes.physical,
    type        : types.sword,
    range       : 1
  };

  return baseWeapon(Object.assign({}, initialStats, stats));
};