/**
 * Character base structure.
 * @param {Object} state Character statistics.
 */
export const baseCharacter = (state = {}) => {
  // ~~~~~~~~~~~~~~~~~~~
  // Internal Properties
  // ~~~~~~~~~~~~~~~~~~~

  const initialState = {

    // ~~~~~~~~~~~~~~~
    // Fighting stats
    // ~~~~~~~~~~~~~~~

    /**
     * How sturdly this character is.
     * Affects resistance for special types of damage (poisons, illness).
     * Used to determine if this unit can save another.
     */
    constitution: 0,

    /**
     * Decrease physical damage taken.
     */
    defense: 0,

    /**
     * Affects how many time an unit can attack,
     * accuracy and evading opponent's attack
     */
    dexterity: 0,

    /**
     * Magical damage.
     */
    intelligence: 0,

    /**
     * Affects critical hit.
     */
    luck: 0,

    /**
     * Decrease magical damage taken.
     */
    resistance: 0,

    /**
     * Physical damage.
     */
    strength: 0,

    // ~~~~~~~~~~~~
    // Properties
    // ~~~~~~~~~~~~

    /**
     * Character's class.
     */
    class: '',

    /**
     * Level up when it reaches 100.
     */
    experience: 0,

    /**
     * Health Points.
     */
    hp: 10,

    /**
     * Uniq identifier.
     */
    id: 0,

    /**
     * Items warried by this character.
     */
    items: [],

    /**
     * From 1 to 20. After each level up, abilities points are distributed.
     */
    level: 1,

    /**
     * Max items this character can carry.
     */
    maxItems: 5,

    /**
     * Amount of cells the character can move to.
     */
    move: 4,

    /**
     * Character's name.
     */
    name: 'none',

    /**
     * Current weapon wield.
     * This weapon will be used if the character attacks.
     */
    weapon: {},

    /**
     * Weapons' types the character can only uses.
     */
    weaponsAllowed: {},
  };

  const mergedState = Object.assign(initialState, state);

  // ~~~~~~~~~~~~~~~
  // Exposed object
  // ~~~~~~~~~~~~~~~

  return {
    // ~~~~~~~~~~~~~
    // Battle stats
    // ~~~~~~~~~~~~~

    /**
     * Return an object containing battle stats values.
     * @param {Object} opponent Opponnent to get the values against.
     */
    getBattleStats (opponent = {}) {
      return {
        atk         : this.getAtk(opponent),
        criticalHit : this.getCriticalHit(),
        dodge       : this.getDodge(),
        hit         : this.getHit(opponent)
      };
    },

    /**
     * Returns the character's attack value.
     * If an opponent is provided, it'll return the value against this opponent.
     * @param {Object} opponent Character to get the value against.
     * @returns {Number} Damages value.
     */
    getAtk(opponent = {}) {
      if (!mergedState.weapon.atk) return 0; // No weapon wield

      let opponentDamageReduction = 0;
      let totalAtk = 0;
      let weaponAtk = mergedState.weapon.atk;

      if (mergedState.weapon.physical) {
        totalAtk = weaponAtk + mergedState.strength;
        opponentDamageReduction = opponent.getPropertyValue('defense');

      } else {
        totalAtk = weaponAtk + mergedState.intelligence;
        opponentDamageReduction = opponent.getPropertyValue('resistance');
      }

      // No opponent => pure damage
      if (!opponent.getPropertyValue) return totalAtk;

      // Opponent => damage reduction
      totalAtk = totalAtk - opponentDamageReduction;

      return Math.max(totalAtk, 0);
    },

    /**
     * Return hit value.
     * If an opponent is provided, it'll return the value against this opponent.
     * @param {Object} opponent Character get value against.
     * @returns {Number} Hit probability.
     */
    getHit(opponent = {}) {
      if (!mergedState.weapon.accuracy) return 0;

      const { accuracy } = mergedState.weapon;
      const dexBonus = mergedState.dexterity * (accuracy / 100);

      let hitValue = accuracy + dexBonus;

      // No opponent => pure Hit
      if (!opponent.getPropertyValue) {
        return Math.min(hitValue, 100);
      }

      // Opponent => hit reduction
      const opponentDodge = opponent.getDodge();

      hitValue = Math.max(hitValue - opponentDodge, 0);

      return Math.min(hitValue, 100);
    },

    /**
     * Return character's attack range.
     * @returns {Number} Range value.
     */
    getRange() {
      if (!mergedState.weapon.range) return 0;
      return mergedState.weapon.range;
    },

    /**
     * Return the probability to do a critical hit for one attack.
     * @returns {Number} Critical hit value.
     */
    getCriticalHit() {
      const weaponCriticalHit = mergedState.weapon.criticalHit;
      const playerCriticalHit = mergedState.luck * (weaponCriticalHit / 100);

      return weaponCriticalHit + playerCriticalHit;
    },

    /**
     * Return the probability to dodge the enemy attack.
     * @returns {Number} Dodge value.
     */
    getDodge() {
      const weaponSpeed = mergedState.weapon.speed;
      return mergedState.dexterity + weaponSpeed;
    },

    // ~~~~~~~~~~~~~~
    // Other methods
    // ~~~~~~~~~~~~~~

    /**
     * Return true if the weapon can be equipped. False otherwise.
     * @param {Object} weapon The weapon to equip.
     */
    canBeEquipped (weapon = {}) {
      // 1. Check if the character is the current owner.
      if (weapon.getPropertyValue('ownerId') !== this.getPropertyValue('id')) {
        return false;
      }

      // 2. Check if the character can wield it.
      if (mergedState.weaponsAllowed.indexOf(weapon.type) === -1) {
        return false;
      }

      return true;
    },

    /**
     * Equip a weapon available in the character's items.
     * @param {Object} weapon Weapon to equip the character with.
     */
    equip (weapon = {}) {
      if (this.canBeEquipped(weapon)) {
        mergedState.weapon = weapon;
      }

      return this;
    },

    // ~~~~~~~~
    // Getters
    // ~~~~~~~~

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
     * Return fighting stats.
     */
    getFightingStats() {
      const {
        constitution,
        defense,
        dexterity,
        intelligence,
        luck,
        resistance,
        strength
      } = mergedState;

      return {
        constitution,
        defense,
        dexterity,
        intelligence,
        luck,
        resistance,
        strength
      };
    },

    // ~~~~~~~~
    // Setters
    // ~~~~~~~~

    /**
     * Increment a character's statistic with the passed value.
     * @param {Object} stats Contains statistic name and value to add.
     */
    incrementStats(stats) {
      const { name, value } = stats;

      if (!name || !value) return;

      if (mergedState.hasOwnProperty(name)) {
        mergedState[name] += value;
      }

      return this;
    }
  };
};
