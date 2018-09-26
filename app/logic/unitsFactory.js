import { buildUnit } from './buildUnit';
import { inventoryFactory } from './inventoryFactory';

/**
 * Create a new character according to an initial stats.
 * The initial stats will help to determine which character class to choose.
 * @param {Object} stats Initial or previous character's stats.
 */
export const unitsFactory = ({
  dataHeroes = {},
  dataUnits = {},
  dataWeapons = {},
  dataConsummables = {}}) => {

  const createInventory = inventoryFactory({ dataWeapons, dataConsummables });

  return (hero = '') => {
    let data = {};

    hero = hero.toLowerCase();

    if (dataHeroes[hero]) {
      data = Object.assign({}, dataHeroes[hero]);
      data = Object.assign({}, dataUnits[data.class], data);

    } else { data = Object.assign({}, dataUnits[hero]); }

    Object.assign(data, data.stats.base);

    const unit = buildUnit(data);

    unit.inventory = createInventory(unit);

    return unit;
  };
};
