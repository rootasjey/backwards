import test from 'ava';

import heroes from '../app/static/assets/data/heroes.json';
import units from '../app/static/assets/data/unitsClasses.json';

import weapons from '../app/static/assets/data/weapons.json';

import { unitsFactory } from '../app/objects/unitsFactory';

test('An unit should have some default values', (t) => {
  const createUnit = unitsFactory({dataHeroes: heroes, dataUnits: units});
  const emilie = createUnit('emilie');

  // Stats value are number
  Object.entries(emilie.getFightingStats())
    .map(([, value]) => { Number.isInteger(value); });

  const oldSpeed = emilie.get('spd');

  // Test increment stats function.
  const speedIncr = emilie
    .increment({ name: 'spd', value: 1})
    .get('spd');

  t.true(speedIncr > oldSpeed);

  // ......................
  // ----------------------
  // Zero battle value test
  // ----------------------
  // Unit has currently no waepon
  // -------------------------------
  t.true(emilie.getAtk() === 0);
  t.true(emilie.getRange() === 0);

  // ..............
  // --------------
  // Inventory test
  // --------------
  const sword = Object.assign({}, weapons['Iron Sword']);

  const oldSize = emilie.inventory.getSize();

  emilie.inventory.add(sword);

  t.true(emilie.inventory.getSize() > oldSize);

  // .................
  // -----------------
  // Weapon equip test
  // -----------------
  t.deepEqual(emilie.get('weapon'), {});

  const weapon = emilie.inventory
    .find(element => element.itemType === 'weapon');

  t.true(emilie.canEquip(weapon));

  emilie.equip(weapon);

  t.deepEqual(emilie.get('weapon'), weapon);

  t.true(emilie.getAtk() > 0);
});
