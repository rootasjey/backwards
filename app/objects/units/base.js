// ~~~~~~~~~~~~~~~~~~~~~~~~
// UNIT BASE STRUCTURE
// ~~~~~~~~~~~~~~~~~~~~~~~~

import {
  damageTypes as WEAPON_DAMAGE_TYPES,
  rank as WEAPON_RANK,
  types as WEAPON_TYPES

} from '../items/weapons/const';

/**
 * Unit base structure.
 * @param {Object} state Unit statistics.
 */
export const baseUnit = (state = {}) => {
  // ~~~~~~~~~~~~~~~~~~~
  // Internal Properties
  // ~~~~~~~~~~~~~~~~~~~

  const initialState = {

    // ~~~~~~~~~~~~~~~
    // Fighting stats
    // ~~~~~~~~~~~~~~~

    /**
     * How sturdly this unit is.
     * Affects resistance for special types of damage (poisons, illness).
     * Used to determine if this unit can save another.
     */
    constitution: 0,

    /**
     * Decrease physical damage taken.
     */
    defense: 0,

    /**
     * Health Points.
     */
    hp: 10,

    /**
     * Magical damage.
     */
    magic: 0,

    /**
     * Affects critical hit.
     */
    luck: 0,

    /**
     * Decrease magical damage taken.
     */
    resistance: 0,

    /**
     * Affects unit's rate and critical hit rate.
     */
    skill: 0,

    /**
     * Affects the number of strikes the unit can make,
     * alongside her/his hability to evade a foe attack.
     */
    speed: 1,

    /**
     * Physical damage.
     */
    strength: 0,

    /**
     * The unit must have a rank at or higher than
     * a weapon rank to us it in battle.
     */
    weaponRank: {},

    // ~~~~~~~~~~~~
    // Properties
    // ~~~~~~~~~~~~

    /**
     * Unit's class.
     */
    class: '',

    /**
     * Level up when it reaches 100.
     */
    experience: 0,

    /**
     * Uniq identifier.
     */
    id: -1,

    /**
     * Unit's inventory.
     */
    inventory: {},

    /**
     * From 1 to 20. After each level up, abilities points are distributed.
     */
    level: 1,

    /**
     * Amount of cells the unit can move to.
     */
    move: 4,

    /**
     * Unit's name.
     */
    name: 'none',

    /**
     * Current weapon wield.
     * This weapon will be used if the unit attacks.
     */
    weapon: {},

    /**
     * Weapons' types the unit can only uses.
     */
    weaponsAllowed: {},
  };

  const mergedState = Object.assign({}, initialState, state);

  // ~~~~~~~~~~~~~~~
  // Exposed object
  // ~~~~~~~~~~~~~~~

  return {
    /**
     * Return true if the weapon can be equipped. False otherwise.
     * @param {Object} weapon The weapon to equip.
     */
    canEquip(weapon = {}) {
      // 1. Check if the weapon belongs to the unit.
      if (weapon.getPropertyValue('ownerId') !== this.getPropertyValue('id')) {
        return false;
      }

      // 2. Check if the unit can wield it.
      const weaponsAllowed = this.getPropertyValue('weaponsAllowed');

      return weaponsAllowed[weapon.getPropertyValue('type')] ?
        true : false;
    },

    /**
     * Equip a weapon available in the unit's items.
     * @param {Object} weapon Weapon to equip the unit with.
     */
    equip(weapon = {}) {
      if (this.canEquip(weapon)) {
        this.setPropertyValue('weapon', weapon);
      }

      return this;
    },

    /**
     * Return an object containing battle stats values.
     * @param {Object} opponent Opponnent to get the values against.
     */
    getBattleStats (opponent = {}) {
      return {
        atk         : this.getAtk(opponent),
        criticalHit : this.getCriticalHit(),
        evade       : this.getEvade(),
        hit         : this.getHitRate(opponent)
      };
    },

    /**
     * Returns the unit's attack value.
     * If an opponent is provided, it'll return the value against this opponent.
     * @param {Object} opponent unit to get the value against.
     * @returns {Number} Damages value.
     */
    getAtk(opponent = {}) {
      const weapon = this.getPropertyValue('weapon');
      const { magic, strength } = this.getFightingStats();

      if (!weapon.getPropertyValue) return 0; // no weapon wield

      let opponentDamageReduction = 0;
      let totalAtk = 0;
      let weaponAtk = weapon.getPropertyValue('atk');

      if (weapon.getPropertyValue('damageType') === WEAPON_DAMAGE_TYPES.physical) {
        totalAtk = weaponAtk + strength;

        opponentDamageReduction = opponent.getPropertyValue ?
          opponent.getPropertyValue('defense') : 0;

      } else {
        totalAtk = weaponAtk + magic;

        opponentDamageReduction = opponent.getPropertyValue ?
          opponent.getPropertyValue('resistance') : 0;
      }

      // Opponent => damage reduction
      totalAtk = totalAtk - opponentDamageReduction;

      return Math.max(totalAtk, 0);
    },

    /**
     * Perform a double attack against the enemy
     * if the unit's value is >= 4 points than the enemy.
     */
    getAtkSpeed() {
      const { constitution, speed } = this;
      const { weight } = this.getPropertyValue('weapon');

      if (typeof weight === 'undefined') return 0;

      const burden = Math.max((weight - constitution), 0);

      return speed - burden;
    },

    /**
     * Return hit value.
     * If an opponent is provided, it'll return the value against this opponent.
     * @param {Object} opponent unit get value against.
     * @returns {Number} Hit probability.
     */
    getHitRate() {
      if (!mergedState.weapon.accuracy) return 0;

      const { luck, magic, skill } = this.getFightingStats();
      const { accuracy, type } = this.getPropertyValue('weapon');

      if (type === WEAPON_TYPES.staff) {
        return (magic * 5) + skill + 30;
      }

      const weaponRankBonus = this.getWeaponRankBonus()['accuracy'];

      return (skill * 2) + (luck * 0.5) + weaponRankBonus + accuracy;
    },

    /**
     * Return the probability to do a critical hit for one attack.
     * @returns {Number} Critical hit value.
     * TOTO: Add support bonus, class critical bonus
     * http://fireemblem.wikia.com/wiki/Critical_hit
     */
    getCriticalHit(opponent = {}) {
      const skill = this.getPropertyValue('skill');
      const { criticalRate, rank } = this.getPropertyValue('weapon');
      const ennemyLuck = opponent.getPropertyValue('luck');

      let sRankBonus = 0;

      if (rank === WEAPON_RANK.S) sRankBonus = 5;

      return ((skill / 2) + sRankBonus + criticalRate) - ennemyLuck;
    },

    /**
     * Probability of successfully avoiding a weapon/magic.
     * @returns {Number} avoid probability.
     * TODO: add terrain modifier
     */
    getEvade() {
      const atkSpeed = this.getAtkSpeed() * 2;
      const luck = this.getPropertyValue('luck');

      return atkSpeed + luck;
    },

    /**
     * Return fighting stats.
     */
    getFightingStats() {
      const {
        constitution,
        defense,
        hp,
        magic,
        luck,
        resistance,
        skill,
        speed,
        strength
      } = mergedState;

      return {
        constitution,
        defense,
        hp,
        magic,
        luck,
        resistance,
        skill,
        speed,
        strength
      };
    },

    /**
     * Return the property's value.
     * @param {String} prop Property to get value of.
     */
    getPropertyValue(prop = '') {
      return mergedState[prop];
    },

    /**
     * Return unit's attack range.
     * @returns {Number} Range value.
     */
    getRange() {
      const { range } = this.getPropertyValue('weapon');

      return Number.isInteger(range) ? range : 0;
    },

    getWeaponRankBonus() {
      const { rank, type } = this.getPropertyValue('weapon');

      let bonus = {
        accuracy: 0,
        atk: 0,
        recovery: 0
      };

      switch (type) {
      case WEAPON_TYPES.axe:
        if (WEAPON_RANK.C === rank) bonus.accuracy = 5;
        if (WEAPON_RANK.B === rank) bonus.accuracy = 10;
        if (WEAPON_RANK.A === rank) bonus.accuracy = 15;

        break;

      case WEAPON_TYPES.bow:
        if (WEAPON_RANK.C === rank) bonus.atk = 1;
        if (WEAPON_RANK.B === rank) bonus = Object.assign({}, { atk: 1, accuracy: 5 });
        if (WEAPON_RANK.A === rank) bonus = Object.assign({}, { atk: 2, accuracy: 5 });

        break;

      case WEAPON_TYPES.lance:
        if (WEAPON_RANK.C === rank) bonus.atk = 1;
        if (WEAPON_RANK.B === rank) bonus = Object.assign({}, { atk: 1, accuracy: 5 });
        if (WEAPON_RANK.A === rank) bonus = Object.assign({}, { atk: 2, accuracy: 5 });

        break;

      case WEAPON_TYPES.staff:
        if (WEAPON_RANK.C === rank) bonus.recovery = 1;
        if (WEAPON_RANK.B === rank) bonus.recovery = 2;
        if (WEAPON_RANK.A === rank) bonus.recovery = 3;

        break;

      case WEAPON_TYPES.sword:
        if (WEAPON_RANK.C === rank) bonus.atk = 1;
        if (WEAPON_RANK.B === rank) bonus.atk = 2;
        if (WEAPON_RANK.A === rank) bonus.atk = 3;
        break;

      case WEAPON_TYPES.tome:
        if (WEAPON_RANK.C === rank) bonus.atk = 1;
        if (WEAPON_RANK.B === rank) bonus = Object.assign({}, { atk: 1, accuracy: 5 });
        if (WEAPON_RANK.A === rank) bonus = Object.assign({}, { atk: 2, accuracy: 5 });

        break;

      default:
        break;
      }

      return bonus;
    },

    /**
     * Increment a unit's statistic with the passed value.
     * @param {Object} stats Contains statistic name and value to add.
     */
    incrementStats(stats) {
      const { name, value } = stats;

      if (!name || !value) return this;

      if (mergedState.hasOwnProperty(name)) {
        mergedState[name] += value;
      }

      return this;
    },

    /**
     * Set a property value.
     * @param {String} prop Property name
     * @param {*} value Value to set to the property.
     */
    setPropertyValue(prop = '', value) {
      mergedState[prop] = value;

      return this;
    }
  };
};
