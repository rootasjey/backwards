import { physicalSecondTypes } from '../const';
import { ironSword } from './ironSword';

export const createSword = (stats = {}) => {
  switch (stats.secondType) {
  case physicalSecondTypes.iron:
    return ironSword(stats);

  default:
    break;
  }
};