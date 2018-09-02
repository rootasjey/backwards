import { physicalTypes } from '../const';
import { ironSword } from './ironSword';

export const createSword = (stats = {}) => {
  switch (stats.secondType) {
  case physicalTypes.iron:
    return ironSword(stats);

  default:
    break;
  }
};