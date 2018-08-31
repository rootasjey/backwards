import { baseSword } from './base';
import { physicalTypes, rank } from '../const';

export const ironSword = (stats = {}) => {
  const initialStats = {
    accuracy      : 70,
    atk           : 5,
    cost          : 1000,
    criticalRate  : 5,
    rank          : rank.E,
    secondType    : physicalTypes.iron,
    usage         : 45,
    weight        : 5 // TODO: check
  };

  return baseSword(Object.assign({}, initialStats, stats));
};