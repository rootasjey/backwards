import {
  damageTypes as WEAPON_DAMAGE_TYPES,
  rank as WEAPON_RANK,
  types as WEAPON_TYPES

} from './const';

import { createInventory } from './createInventory';

/**
 * Create a new character according to an initial stats.
 * The initial stats will help to determine which character class to choose.
 * @param {Object} stats Initial or previous character's stats.
 */
export const createUnit = (stats) => {
  const unit = baseUnit(stats);

  unit.inventory = createInventory({ items: stats.inventory, unit });

  return unit;
};

/**
 * Unit base structure.
 * @param {Object} state Unit statistics.
 */
const baseUnit = (state = {}) => {
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
    cons: 0,

    /**
     * Decrease physical damage taken.
     */
    def: 0,

    /**
     * Health Points.
     */
    hp: 10,

    /**
     * Magical damage.
     */
    mag: 0,

    /**
     * Affects critical hit.
     */
    lck: 0,

    /**
     * Decrease magical damage taken.
     */
    res: 0,

    /**
     * Affects unit's rate and critical hit rate.
     */
    skl: 0,

    /**
     * Affects the number of strikes the unit can make,
     * alongside her/his hability to evade a foe attack.
     */
    spd: 1,

    /**
     * Physical damage.
     */
    str: 0,

    /**
     * Weapons' exp
     */
    wexp: {},

    /**
     * The unit must have a rank at or higher than
     * a weapon rank to us it in battle.
     */
    wrank: {},

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
    id: state.name,

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
      // if (weapon.getPropertyValue('ownerId') !== this.get('id')) {
      //   return false;
      // }

      // 2. Check if the unit can wield it.
      const weaponsAllowed = this.get('weaponsAllowed');

      return weaponsAllowed[weapon.getPropertyValue('type')] ?
        true : false;
    },

    /**
     * Equip a weapon available in the unit's items.
     * @param {Object} weapon Weapon to equip the unit with.
     */
    equip(weapon = {}) {
      if (this.canEquip(weapon)) {
        this.set('weapon', weapon);
      }

      return this;
    },

    /**
     * Return an object containing battle stats values.
     * @param {Object} opponent Opponnent to get the values against.
     */
    getBattleStats(opponent = {}) {
      return {
        atk: this.getAtk(opponent),
        criticalHit: this.getCriticalHit(),
        evade: this.getEvade(),
        hit: this.getHitRate(opponent)
      };
    },

    /**
     * Returns the unit's attack value.
     * If an opponent is provided, it'll return the value against this opponent.
     * @param {Object} opponent unit to get the value against.
     * @returns {Number} Damages value.
     */
    getAtk(opponent = {}) {
      const weapon = this.get('weapon');
      const { mag, str } = this.getFightingStats();

      if (!weapon.getPropertyValue) return 0; // no weapon wield

      let opponentDamageReduction = 0;
      let totalAtk = 0;
      let weaponAtk = weapon.getPropertyValue('atk');

      if (weapon.getPropertyValue('damageType') === WEAPON_DAMAGE_TYPES.physical) {
        totalAtk = weaponAtk + str;

        opponentDamageReduction = opponent.getPropertyValue ?
          opponent.getPropertyValue('def') : 0;

      } else {
        totalAtk = weaponAtk + mag;

        opponentDamageReduction = opponent.getPropertyValue ?
          opponent.getPropertyValue('res') : 0;
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
      const { cons, spd } = this;
      const { weight } = this.get('weapon');

      if (typeof weight === 'undefined') return 0;

      const burden = Math.max((weight - cons), 0);

      return spd - burden;
    },

    /**
     * Return hit value.
     * If an opponent is provided, it'll return the value against this opponent.
     * @param {Object} opponent unit get value against.
     * @returns {Number} Hit probability.
     */
    getHitRate() {
      if (!mergedState.weapon.accuracy) return 0;

      const { lck, mag, skl } = this.getFightingStats();
      const { accuracy, type } = this.get('weapon');

      if (type === WEAPON_TYPES.staff) {
        return (mag * 5) + skl + 30;
      }

      const weaponRankBonus = this.getWeaponRankBonus()['accuracy'];

      return (skl * 2) + (lck * 0.5) + weaponRankBonus + accuracy;
    },

    /**
     * Return the probability to do a critical hit for one attack.
     * @returns {Number} Critical hit value.
     * TOTO: Add support bonus, class critical bonus
     * http://fireemblem.wikia.com/wiki/Critical_hit
     */
    getCriticalHit(opponent = {}) {
      const skl = this.get('skl');
      const { criticalRate, rank } = this.get('weapon');
      const ennemyLuck = opponent.getPropertyValue('lck');

      let sRankBonus = 0;

      if (rank === WEAPON_RANK.S) sRankBonus = 5;

      return ((skl / 2) + sRankBonus + criticalRate) - ennemyLuck;
    },

    /**
     * Probability of successfully avoiding a weapon/magic.
     * @returns {Number} avoid probability.
     * TODO: add terrain modifier
     */
    getEvade() {
      const atkSpeed = this.getAtkSpeed() * 2;
      const lck = this.get('lck');

      return atkSpeed + lck;
    },

    /**
     * Return fighting stats.
     */
    getFightingStats() {
      const {
        cons,
        def,
        hp,
        mag,
        lck,
        res,
        skl,
        spd,
        str
      } = mergedState;

      return {
        cons,
        def,
        hp,
        mag,
        lck,
        res,
        skl,
        spd,
        str
      };
    },

    /**
     * Return the property's value.
     * @param {String} prop Property to get value of.
     */
    get(prop = '') {
      return mergedState[prop];
    },

    /**
     * Return unit's attack range.
     * @returns {Number} Range value.
     */
    getRange() {
      const { range } = this.get('weapon');

      return Number.isInteger(range) ? range : 0;
    },

    getWeaponRankBonus() {
      const { rank, type } = this.get('weapon');

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
    increment(stats) {
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
    set(prop = '', value) {
      mergedState[prop] = value;

      return this;
    }
  };
};