/**
 * Weapon base structure.
 * @param {Object} state Initial weapon's state.
 */
export const baseWeapon = (state = {}) => {
  // ~~~~~~~~~~~~~~~~~~~
  // Internal Properties
  // ~~~~~~~~~~~~~~~~~~~

  const initialState = {
    /**
     * Accuracy (in %).
     */
    accuracy: 70,

    /**
     * Damage per hit.
     */
    atk: 1,

    /**
     * Critical hit (in %).
     * Critical hit does x2 damage.
     */
    criticalHit: 5,

    /**
     * Illustration.
     */
    imagePath: '',

    /**
     * Character's id to which this weapon belongs to.
     */
    ownerId: 0,

    /**
     * If false, the weapons cast magic.
     */
    physical: true,

    /**
     * Range to hit opponents (in tile measurement).
     */
    range: 1,

    /**
     * Affects how many time the weapon can hit an opponent in a fight,
     * and the weilder's dodge probability.
     */
    speed: 10,

    /**
     * Type, e.g.: sword, axe, spear, magic
     */
    type: ''
  };

  const mergedState = Object.assign(initialState, state);

  // ~~~~~~~~~~~~~~~
  // Exposed object
  // ~~~~~~~~~~~~~~~

  return {
    /**
     * Change to whom belong this weapon.
     * @param {Object} newOwner New character owner.
     */
    changeOwner (newOwner) {
      this.setPropertyValue('ownerId', newOwner.id);
    },

    /**
     * Return the property's value.
     * @param {String} prop Property to get value of.
     */
    getPropertyValue(prop = '') {
      if (mergedState.hasOwnProperty(prop)) {
        return mergedState[prop];
      }

      return null;
    },

    /**
     * Set a new value to the specified property.
     * @param {String} prop Property to set the value of.
     * @param {String} value Value to set to the property.
     */
    setPropertyValue(prop = '', value = '') {
      if (mergedState.hasOwnProperty(prop)) {
        mergedState[prop] = value;
      }

      return this;
    }
  };
};