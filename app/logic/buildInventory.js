/**
 * Create a new inventory
 * @param {Array} items Items which should be added to the inventory.
 * @returns {Object} Inventory.
 */
export const buildInventory = ({ items = [] }) => {
  const internalState = {
    items,
    maxItems: 5
  };

  return {
    add(item = {}) {
      if (internalState.items.length >= internalState.maxItems) {
        return this;
      }

      internalState.items.push(item);

      return this;
    },

    find() {
      return items.find(...arguments);
    },

    /**
     * Return an array of items.
     * @returns {Array} Array of all items.
     */
    getItems() {
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
      this.getItems()
        .some((currItem, index) => {
          if (currItem === item) this.getItems().splice(index, 1);
        });

      return this;
    }
  };
};
