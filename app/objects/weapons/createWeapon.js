import { types } from './const';
import { createSword } from './swords/createSword';

export const createWeapon = (stats = {}) => {
  switch (stats.type) {
  case types.sword:
    return createSword(stats);

  default:
    break;
  }
};