// ~~~~~~~~~~~~~~~~~~~~~~~~
// CHARACTER BASE STRUCTURE
// ~~~~~~~~~~~~~~~~~~~~~~~~

import {
  rank as WEAPON_RANK,
  types as WEAPON_TYPES

} from '../weapons/const';

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
     * Affects the number of strikes the character can make,
     * alongside her/his hability to evade a foe attack.
     */
    speed: 1,

    /**
     * Physical damage.
     */
    strength: 0,

    /**
     * The character must have a rank at or higher than
     * a weapon rank to us it in battle.
     */
    weaponRank: {},

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
        evade       : this.getEvade(),
        hit         : this.getHitRate(opponent)
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
        totalAtk = weaponAtk + mergedState.magic;
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
    getHitRate(opponent = {}) {
      if (!mergedState.weapon.accuracy) return 0;

      const { luck, magic, skill } = this.getFightingStats();
      const { accuracy, type } = this.getPropertyValue('weapon');

      if (type === WEAPON_TYPES.staff) {
        return (magic * 5) + skill + 30;
      }

      const weaponRankBonus = this.getWeaponRankBonus()['accuracy'];

      return (skill * 2) + (luck * 0.5) + weaponRankBonus + accuracy;
    },

    getWeaponRankBonus() {
      const { rank, type } = this.getPropertyValue('weapon');

      let bonus = {
        accuracy  : 0,
        atk       : 0,
        recovery  : 0
      };

      switch (type) {
      case WEAPON_TYPES.axe:
        if (WEAPON_RANK.C === rank) bonus.accuracy = 5;
        if (WEAPON_RANK.B === rank) bonus.accuracy = 10;
        if (WEAPON_RANK.A === rank) bonus.accuracy = 15;

        break;

      case WEAPON_TYPES.bow:
        if (WEAPON_RANK.C === rank) bonus.atk = 1;
        if (WEAPON_RANK.B === rank) bonus = Object.assign({}, { atk: 1, accuracy: 5});
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
