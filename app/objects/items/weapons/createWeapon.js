import { types } from './const';
import { createSword } from './swords/createSword';

export const createWeapon = (state = {}) => {
  switch (state.type) {
  case types.sword:
    return createSword(state);
  default:
    break;
  }
};