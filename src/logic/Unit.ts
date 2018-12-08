import {
  damageTypes as WEAPON_DAMAGE_TYPES,
  rank as WEAPON_RANK,
  types as WEAPON_TYPES,

} from './const';

export class Unit {
  private state: UnitState;

  /**
   * Unit class which has a state.
   */
  constructor(data: UnitDataConstructor) {
    this.state = data.unitData.stats.base;

    const rawItems = data.unitData.inventory as InventoryRawItem[];
    this.state.inventory = data.createInventory(rawItems);
  }

  get fullHP() {
    return this.state.fullHP;
  }

  get hp() {
    return this.state.hp;
  }

  /**
   * Return the amount of cells this unit can move.
   */
  get move() {
    return this.state.move;
  }

  /**
   * Return unit's name.
   */
  get name() {
    return this.state.name;
  }

  /**
   * Return true if the weapon can be equipped. False otherwise.
   */
  public canEquip(weapon: Weapon): boolean {
    const wrank = this.state.wrank;
    return wrank[weapon.type] !== '';
  }

  /**
   * Equip a weapon available in the unit's items.
   */
  public equip(weapon: Weapon) {
    if (this.canEquip(weapon)) {
      this.state.weapon = weapon;
    }

    return this;
  }

  /**
   * Return the probability (%) of this unit
   * landing a successful hit on a defending unit.
   * https://fireemblem.fandom.com/wiki/Accuracy
   */
  public getAccuracy(opponent?: Unit) {
    const atkHitRate = this.getHitRate();
    let defEvade = 0;

    let weaponTriangleEffect: WeaponTriangleBonus = { atk: 0, hit: 0 };

    if (opponent) {
      defEvade = opponent.getEvade();

      weaponTriangleEffect = this.getWeaponTriangleEffect(
        this.state.weapon, opponent.state.weapon);
    }

    return atkHitRate - defEvade + weaponTriangleEffect.hit;
  }
  /**
   * Returns the unit's attack value.
   * If an opponent is provided, it'll return the value against this opponent.
   */
  public getAtk(opponent?: Unit) {
    const weapon = this.state.weapon;
    const { mag, str } = this.state;

    if (!weapon || !weapon.atk) { return 0; }

    let opponentDamageReduction = 0;
    let totalAtk = 0;
    const weaponAtk = weapon.atk;

    if (weapon.damageType === WEAPON_DAMAGE_TYPES.physical) {
      totalAtk = weaponAtk + str;

      opponentDamageReduction = opponent ?
        opponent.state.def : 0;

    } else {
      totalAtk = weaponAtk + mag;

      opponentDamageReduction = opponent ?
        opponent.state.res : 0;
    }

    // Opponent => damage reduction
    totalAtk = totalAtk - opponentDamageReduction;

    return Math.max(totalAtk, 0);
  }

  /**
   * Perform a double attack against the enemy
   * if the unit's value is >= 4 points than the enemy.
   */
  public getAtkSpeed() {
    const { cons, spd } = this.state;

    if (!this.state.weapon) { return 0; }

    const { weight } = this.state.weapon;

    if (typeof weight === 'undefined') { return 0; }

    const burden = Math.max((weight - cons), 0);

    return spd - burden;
  }

  /**
   * Return an object containing battle stats values.
   */
  public getBattleStats(opponent?: Unit) {
    return {
      atk: this.getAtk(opponent),
      criticalHit: this.getCriticalHit(),
      evade: this.getEvade(),
      hit: this.getAccuracy(opponent),
    };
  }

  /**
   * Return the probability to do a critical hit for one attack.
   * TOTO: Add support bonus, class critical bonus
   * http://fireemblem.wikia.com/wiki/Critical_hit
   */
  public getCriticalHit(opponent?: Unit): number {
    const skl = this.state.skl;
    let ennemyLuck = opponent ? opponent.state.lck : 0;

    if (!this.state.weapon) { return 0; }

    const { ctr, rank } = this.state.weapon;

    let sRankBonus = 0;

    if (rank === WEAPON_RANK.S) { sRankBonus = 5; }

    return ((skl / 2) + sRankBonus + ctr) - ennemyLuck;
  }

  /**
   * Probability of successfully avoiding a weapon/magic.
   * TODO: add terrain modifier
   * https://fireemblem.fandom.com/wiki/Evade
   */
  public getEvade() {
    const atkSpeed = this.getAtkSpeed() * 2;
    const lck = this.state.lck;

    return atkSpeed + lck;
  }

  /**
   * Return hit value.
   * If an opponent is provided, it'll return the value against this opponent.
   * https://fireemblem.fandom.com/wiki/Hit_Rate
   */
  public getHitRate() {
    if (!this.state.weapon) { return 0; }

    const { lck, mag, skl } = this.state;
    const { hit, type } = this.state.weapon;

    if (type === WEAPON_TYPES.staff) {
      return (mag * 5) + skl + 30;
    }

    const hitRankBonus = this.getWeaponRankBonus().hit;

    return (skl * 2) + (lck * 0.5) + hitRankBonus + hit;
  }

  /**
   * Return Unit's inventory.
   */
  public getInvetory() {
    return this.state.inventory;
  }

  /**
   * Return unit's attack range.
   */
  public getRange() {
    const { inventory } = this.state;

    let min: number = 0;
    let max: number = 0;

    inventory.getItems()
      .filter((item) => item.type === 'weapon')
      .map((item) => {
        // Diff range formats: '0', '1-3'
        const rangeValues = item.range.split('-');

        // Supposing the format is well formed: 'min-max'
        let minR = parseInt(rangeValues[0], 10);

        let maxR = rangeValues[1] ?
          parseInt(rangeValues[1], 10) :
          parseInt(rangeValues[0], 10);

        // In case the range has been specified backwards: '10-0'
        rangeValues.map((strRange) => {
          const range = parseInt(strRange, 10);

          minR = range < minR ? range : minR; // check min
          maxR = range > maxR ? range : maxR; // check max
        });

        min = typeof min === 'undefined' ? minR : min;
        max = typeof max === 'undefined' ? maxR : max;

        min = minR < min ? minR : min;
        max = maxR > max ? maxR : max;
      });

    min = Number.isInteger(min) ? min : 0;
    max = Number.isInteger(max) ? max : 0;

    return { min, max };
  }

  /**
   * Increment a unit's statistic with the passed value.
   * @param {Object} stats Contains statistic name and value to add.
   */
  public getWeaponRankBonus(): WeaponRankBonus {
    let bonus = {
      hit       : 0,
      atk       : 0,
      recovery  : 0,
    };

    if (!this.state.weapon) { return bonus; }
    const { rank, type } = this.state.weapon;

    switch (type) {
      case WEAPON_TYPES.axe:
        if (WEAPON_RANK.C === rank) { bonus.hit = 5; }
        if (WEAPON_RANK.B === rank) { bonus.hit = 10; }
        if (WEAPON_RANK.A === rank) { bonus.hit = 15; }

        break;

      case WEAPON_TYPES.bow:
        if (WEAPON_RANK.C === rank) { bonus.atk = 1; }
        if (WEAPON_RANK.B === rank) { bonus = { atk: 1, hit: 5 , recovery: 0 }; }
        if (WEAPON_RANK.A === rank) { bonus = { atk: 2, hit: 5 , recovery: 0 }; }

        break;

      case WEAPON_TYPES.lance:
        if (WEAPON_RANK.C === rank) { bonus.atk = 1; }
        if (WEAPON_RANK.B === rank) { bonus = { atk: 1, hit: 5, recovery: 0 }; }
        if (WEAPON_RANK.A === rank) { bonus = { atk: 2, hit: 5, recovery: 0 }; }

        break;

      case WEAPON_TYPES.staff:
        if (WEAPON_RANK.C === rank) { bonus.recovery = 1; }
        if (WEAPON_RANK.B === rank) { bonus.recovery = 2; }
        if (WEAPON_RANK.A === rank) { bonus.recovery = 3; }

        break;

      case WEAPON_TYPES.sword:
        if (WEAPON_RANK.C === rank) { bonus.atk = 1; }
        if (WEAPON_RANK.B === rank) { bonus.atk = 2; }
        if (WEAPON_RANK.A === rank) { bonus.atk = 3; }
        break;

      case WEAPON_TYPES.tome:
        if (WEAPON_RANK.C === rank) { bonus.atk = 1; }
        if (WEAPON_RANK.B === rank) { bonus = { atk: 1, hit: 5, recovery: 0 }; }
        if (WEAPON_RANK.A === rank) { bonus = { atk: 2, hit: 5, recovery: 0 }; }

        break;

      default:
        break;
    }

    return bonus;
  }

  /**
   * Return weapon triangle effect bonus/malus.
   * @param weapon1 Attacking weapon.
   * @param weapon2 Defending Weapon.
   * https://fireemblem.fandom.com/wiki/Weapon_Triangle
   */
  public getWeaponTriangleEffect(weapon1?: Weapon, weapon2?: Weapon): WeaponTriangleBonus  {
    const neutral = {
      atk: 0,
      hit: 0,
    };

    const triangle: WeaponTriangleCorrespondance = {
      physical: {
        sword: 'axe',
        axe: 'lance',
        lance: 'sword',
      },
      magical: {
        anima: 'light',
        dark: 'anima',
        light: 'dark',
      },
    };

    if (!weapon1 || !weapon2) { return neutral; }

    if (triangle[weapon1.damageType][weapon1.weaponType] === weapon2.weaponType) {
      return { atk: 1, hit: 15 };

    } else if (triangle[weapon2.damageType][weapon2.weaponType] === weapon1.weaponType) {
      return { atk: -1, hit: -15 };
    }

    return neutral;
  }
}
