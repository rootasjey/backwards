/**
 * Create a new inventory
 * @param {Array} items Items which should be added to the inventory.
 * @param {Object} unit Unit's to which the inventory belongs.
 * @returns {Object} Inventory.
 */
export const createInventory = ({ items = [], unit = {} }) => {
  const internalState = {
    items,
    maxItems: 5,
    ownerId: unit.getPropertyValue('id')
  };

  return {
    add(item = {}) {
      // item.setPropertyValue('ownerId', 31);
      if (internalState.items.length >= internalState.maxItems) {
        return this;
      }

      if (item.getPropertyValue('ownerId') === internalState.ownerId) {
        return this;
      }

      item.changeOwner(internalState.ownerId);
      // item.ownerId = internalState.ownerId;
      // item.ownerId = 0;
      item.setPropertyValue('order', this.getSize());

      internalState.items.push(item);

      return this;
    },

    /**
     * Return an array of items.
     * @returns {Array} Array of all items.
     */
    getAllItems() {
      return items;
    },

    /**
     * Return owner's id.
     * @returns Owner's id.
     */
    getOwnerId() {
      return internalState.ownerId;
    },

    /**
     * Return inventory's items count.
     * @returns {Number} Number of items in the inventory.
     */
    getSize() {
      return internalState.items.length;
    },

    /**
     * Remove an item from the inventory.
     * @param {Object} item Item to remove.
     */
    remove(item = {}) {
      const ownerId = item.getPropertyValue('ownerId');
      const order = item.getPropertyValue('order');

      if (ownerId !== this.getPropertyValue('ownerId')) return this;
      if (order === -1) return this;

      this.getAllItems().splice(order, 1);

      item.changeOwner(-1);

      return this;
    }
  };
};