import { inventoryFactory } from './inventoryFactory';
import { Unit } from './Unit';

/**
 * Create a new character according to an initial stats.
 * The initial stats will help to determine which character class to choose.
 * @param {Object} stats Initial or previous character's stats.
 */
export const unitsFactory = (data: UnitsFactoryParameters) => {
  const {
    dataHeroes        = {},
    dataUnits         = {},
    dataWeapons       = {},
    dataConsummables  = {},
  } = data;

  const createInventory = inventoryFactory({ dataWeapons, dataConsummables });

  return (hero = '') => {
    let unitData: UnitData = dataUnits[hero];

    hero = hero.toLowerCase();

    if (dataHeroes[hero]) {
      unitData = Object.assign({}, dataHeroes[hero]);
      unitData = Object.assign({}, dataUnits[unitData.class], unitData);
    }

    const unit = new Unit({ unitData, createInventory });

    return unit;
  };
};
