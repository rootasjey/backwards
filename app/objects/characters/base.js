/**
 * Character base class.
 * @param {Object} state Character statistics.
 */
const baseCharacter = (state = {}) => {
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
    // Other stats
    // ~~~~~~~~~~~~

    class: '',
    experience      : 0,        // current experience progress
    hp              : 10,       // health point
    items           : [],       // inventory
    level           : 1,
    maxItems        : 5,        // inventory's limit
    move            : 4,        // movement
    name            : 'none',
    weapon          : {},       // current weapons wield
    weaponsAllowed  : {},       // weapons this character can use


    // ~~~~~~~~~~~~~
    // Battle stats
    // ~~~~~~~~~~~~~

    /**
     * Returns the character's attack value.
     */
    atk () {
      if (!this.weapon.atk) return 0;

      let weaponAtk = this.weapon.atk;

      if (this.weapon.physical) {
        return weaponAtk + this.strength;
      }

      return weaponAtk + this.intelligence;
    },

    hit () {
      if (!this.weapon.accuracy) return 0;

      let hitValue = this.weapon.accuracy;
      let dexBonus = this.dexterity * (hitValue / 100);

      return Math.min(hitValue + dexBonus, 100);
    },

    range () {
      if (!this.weapon.range) return 0;
      return this.weapon.range;
    },

    criticalHit () {
      const weaponCriticalHit = this.weapon.criticalHit;
      const playerCriticalHit = this.luck * (weaponCriticalHit / 100);

      return weaponCriticalHit + playerCriticalHit;
    },

    dodge () {
      const weaponSpeed = this.weapon.speed;
      return this.dexterity + weaponSpeed;
    },

    // ~~~~~~~~
    // Getters
    // ~~~~~~~~

    getFightingStats () {
      const {
        constitution,
        defense,
        dexterity,
        intelligence,
        luck,
        resistance,
        strength
      } = this;

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
    incrementStats (stats) {
      const { name, value } = stats;

      if (!name || !value) return;

      if (this.hasOwnProperty(name)) {
        this[name] += value;
      }
    }
  };

  return Object.assign(initialState, state);
};

export default baseCharacter;