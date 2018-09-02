// ~~~~~~~~~~~~~~~~~~~~~~~~
// ITEM BASE STRUCTURE
// ~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * Item base structure.
 * @param {Object} state Item's properties.
 */
export const baseItem = (state = {}) => {
  return Object.assign({
    /**
     * Define which type of object it is.
     */
    objectTypeId: -1,

    /**
     * inventory order in the items list.
     */
    order: -1,

    /**
     * Character's id to which this weapon belongs to.
     */
    ownerId: -1,


    /**
     * Change to whom belong this weapon.
     * @param {Number} ownerId New unit owner id.
     */
    changeOwner(ownerId = -2) {
      this.setPropertyValue('ownerId', ownerId);
      return this;
    },

    /**
     * Return the property's value.
     * @param {String} prop Property to get value of.
     */
    getPropertyValue(prop = '') {
      if (state.hasOwnProperty(prop)) {
        return state[prop];
      }

      return null;
    },

    setPropertyValue(prop = '', value) {
      if (state.hasOwnProperty(prop)) {
        state[prop] = value;
      }

      return this;
    }
  }, state);
};