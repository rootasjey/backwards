import {
  WeaponDamageType,
  WeaponRanks,
  WeaponTypes,
} from '../const/weapons';

export class Unit {
  private privateInventory: InventoryShape;

  private data: UnitData;

  /** Shortcur on data.stats.base. */
  private stats: UnitStats;

  get fullHP() {
    return this.stats.fullHP;
  }

  get hp() {
    return this.stats.hp;
  }

  get inventory() {
    return this.privateInventory;
  }

  /** Return the amount of cells this unit can move. */
  get move() {
    return this.stats.move;
  }

  /**  unit's name. */
  get name() {
    return this.data.name;
  }

  constructor(config: UnitConfig) {
    this.data = config.unitData;
    this.stats = config.unitData.stats.base;

    const rawItems = config.unitData.inventory as InventoryRawItem[];
    this.privateInventory = config.createInventory(rawItems);
  }

  /** Return true if the weapon can be equipped. False otherwise. */
  public canEquip(weapon: Weapon): boolean {
    const { wrank } = this.data;
    return wrank[weapon.type] !== '';
  }

  /** Equip a weapon available in the unit's items. */
  public equip(weapon: Weapon) {
    if (this.canEquip(weapon)) {
      this.inventory.moveWeaponToTop(weapon);
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
        this.inventory.getWeapon(0), opponent.inventory.getWeapon(0));
    }

    return atkHitRate - defEvade + weaponTriangleEffect.hit;
  }

  /**
   * Returns the unit's attack value.
   * If an opponent is provided, it'll return the value against this opponent.
   */
  public getAtk(opponent?: Unit) {
    const weapon = this.inventory.getWeapon(0);
    const { mag, str } = this.stats;

    if (!weapon || !weapon.atk) { return 0; }

    let opponentDamageReduction = 0;
    let totalAtk = 0;
    const weaponAtk = weapon.atk;

    if (weapon.damageType === WeaponDamageType.physical) {
      totalAtk = weaponAtk + str;

      opponentDamageReduction = opponent ?
        opponent.stats.def : 0;

    } else {
      totalAtk = weaponAtk + mag;

      opponentDamageReduction = opponent ?
        opponent.stats.res : 0;
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
    const { cons, spd } = this.stats;

    if (!this.inventory.getWeapon(0)) { return 0; }

    const { weight } = this.inventory.getWeapon(0);

    if (typeof weight === 'undefined') { return 0; }

    const burden = Math.max((weight - cons), 0);

    return spd - burden;
  }

  /** Return an object containing battle stats values. */
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
    const skl = this.stats.skl;
    const ennemyLuck = opponent ? opponent.stats.lck : 0;

    if (!this.inventory.getWeapon(0)) { return 0; }

    const { ctr, rank } = this.inventory.getWeapon(0);

    let sRankBonus = 0;

    if (rank === WeaponRanks.S) { sRankBonus = 5; }

    return ((skl / 2) + sRankBonus + ctr) - ennemyLuck;
  }

  /**
   * Probability of successfully avoiding a weapon/magic.
   * TODO: add terrain modifier
   * https://fireemblem.fandom.com/wiki/Evade
   */
  public getEvade() {
    const atkSpeed = this.getAtkSpeed() * 2;
    const lck = this.stats.lck;

    return atkSpeed + lck;
  }

  /** Return hit value. https://fireemblem.fandom.com/wiki/Hit_Rate */
  public getHitRate() {
    if (!this.inventory.getWeapon(0)) { return 0; }

    const { lck, mag, skl } = this.stats;
    const { hit, type } = this.inventory.getWeapon(0);

    if (type === WeaponTypes.staff) {
      return (mag * 5) + skl + 30;
    }

    const hitRankBonus = this.getWeaponRankBonus().hit;

    return (skl * 2) + (lck * 0.5) + hitRankBonus + hit;
  }

  /** Return unit's attack range. */
  public getAllWeaponsRange() {
    let min = Infinity;
    let max = 0;

    this.inventory
      .getWeapons()
      .map((weapon) => {
        // Diff range formats: '0', '1-3'
        const rangeValues = weapon.range.split('-');

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

  public getWeaponRange(config: weaponRangeConfig) {
    const { weapon: weaponConfig, weaponIndex } = config;
    const weapons = this.inventory.getWeapons();

    if (weapons.length === 0) {
      return { min: 0, max: 0 };
    }

    let index = 0;

    if (typeof weaponIndex === 'number') {
      index = weaponIndex;

    } else {
      if (!weaponConfig) { throw new Error('No weapon\'s index specifed, neither a weapon object.'); }

      weapons
        .some((weaponInventory, i) => {
          if (weaponInventory.name === weaponConfig.name &&
              weaponInventory.usage === weaponConfig.usage) {
                index = i;
                return true;
          }

          return false;
        });
    }

    if (index < 0 || index >= weapons.length) {
      throw new Error(`The weapon's index specified is out of range.
        Please provide a number between 0 and ${weapons.length}`);
    }

    const weapon = weapons[index];

    const rangeValues = weapon.range.split('-');

    const min = parseInt(rangeValues[0], 10);
    const max = rangeValues[1] ?
      parseInt(rangeValues[1], 10) :
      parseInt(rangeValues[0], 10);

    return { min, max };
  }

  public getWeaponRankBonus(): WeaponRankBonus {
    let bonus = {
      hit       : 0,
      atk       : 0,
      recovery  : 0,
    };

    if (!this.inventory.getWeapon(0)) { return bonus; }
    const { rank, type } = this.inventory.getWeapon(0);

    switch (type) {
      case WeaponTypes.axe:
        if (WeaponRanks.C === rank) { bonus.hit = 5; }
        if (WeaponRanks.B === rank) { bonus.hit = 10; }
        if (WeaponRanks.A === rank) { bonus.hit = 15; }

        break;

      case WeaponTypes.bow:
        if (WeaponRanks.C === rank) { bonus.atk = 1; }
        if (WeaponRanks.B === rank) { bonus = { atk: 1, hit: 5 , recovery: 0 }; }
        if (WeaponRanks.A === rank) { bonus = { atk: 2, hit: 5 , recovery: 0 }; }

        break;

      case WeaponTypes.lance:
        if (WeaponRanks.C === rank) { bonus.atk = 1; }
        if (WeaponRanks.B === rank) { bonus = { atk: 1, hit: 5, recovery: 0 }; }
        if (WeaponRanks.A === rank) { bonus = { atk: 2, hit: 5, recovery: 0 }; }

        break;

      case WeaponTypes.staff:
        if (WeaponRanks.C === rank) { bonus.recovery = 1; }
        if (WeaponRanks.B === rank) { bonus.recovery = 2; }
        if (WeaponRanks.A === rank) { bonus.recovery = 3; }

        break;

      case WeaponTypes.sword:
        if (WeaponRanks.C === rank) { bonus.atk = 1; }
        if (WeaponRanks.B === rank) { bonus.atk = 2; }
        if (WeaponRanks.A === rank) { bonus.atk = 3; }
        break;

      case WeaponTypes.tome:
        if (WeaponRanks.C === rank) { bonus.atk = 1; }
        if (WeaponRanks.B === rank) { bonus = { atk: 1, hit: 5, recovery: 0 }; }
        if (WeaponRanks.A === rank) { bonus = { atk: 2, hit: 5, recovery: 0 }; }

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
