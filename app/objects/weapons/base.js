// ~~~~~~~~~~~~~~~~~~~~~~~~
// WEAPON BASE STRUCTURE
// ~~~~~~~~~~~~~~~~~~~~~~~~

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
    accuracy: 0,

    /**
     * Damage per hit.
     */
    atk: 0,

    /**
     * How expensive the weapon is.
     */
    cost: 0,

    /**
     * Critical rate (in %).
     * Critical rate does x3 damage.
     */
    criticalRate: 0,

    /**
     * Weapon's damage type (physical, magic).
     */
    damageType: '',

    /**
     * Illustration.
     */
    imagePath: '',

    /**
     * Character's id to which this weapon belongs to.
     */
    ownerId: -1,

    /**
     * Range to hit opponents (in tile measurement).
     */
    range: 1,

    /**
     * Weapon's rank from E, D, C, B, A, S.
     * The character must have a weapon rank at or higher
     * than the weapon to use it in battle.
     */
    rank: '',

    /**
     * Second weapon's type,
     * e.g.: iron sword, steel sword, dark magic.
     * The value correspond to only the specified part e.g.: 'iron', 'steel', 'dark'.
     */
    secondType: '',

    /**
     * Type (axe, sword, bow, ...).
     */
    type: '',

    /**
     * Weapon durability.
     * Represent the amount of time a weapon can be used before it breaks.
     */
    usage: 1,


    /**
     * Affects how easy it is to use.
     * Impact character's speed, dodge.
     */
    weight: 1
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