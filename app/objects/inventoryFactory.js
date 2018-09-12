import { buildInventory } from './buildInventory';

/**
 * Create new inventory containing items.
 * @param {Object} param0 Contains items data
 */
export const inventoryFactory = ({dataWeapons = {}, dataConsummables = {}}) => {
  return (unit = {}) => {
    const rawItems = unit.get('inventory');

    const items = rawItems.map((item) => {
      if (dataWeapons[item.name]) {
        return Object.assign({}, dataWeapons[item.name], item);
      }

      if (dataConsummables[item.name]) {
        return Object.assign({}, dataConsummables[item.name], item);
      }

      return item;
    });

    return buildInventory({items});
  };
};
