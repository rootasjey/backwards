import { baseSword } from './base';

export const ironSword = (stats = {}) => {
  const initialStats = {
    atk : 2
  };

  return baseSword(initialStats, ...stats);
};