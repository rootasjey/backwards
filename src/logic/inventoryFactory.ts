import { Inventory } from './Inventory';

/**
 * Create new inventory containing items.
 * @param {Object} param0 Contains items data
 */
export const inventoryFactory = (data: InventoryFactoryParam) => {
  const { dataWeapons, dataConsummables } = data;

  return (rawItems: InventoryRawItem[]) => {
    const items = rawItems.map((item) => {
      if (dataWeapons[item.name]) {
        return Object.assign({}, dataWeapons[item.name], item);
      }

      if (dataConsummables[item.name]) {
        return Object.assign({}, dataConsummables[item.name], item);
      }

      return item;
    });

    return new Inventory({ items });
  };
};
