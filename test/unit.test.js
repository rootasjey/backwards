import test from 'ava';

import heroes from '../app/static/assets/data/heroes.json';

import weapons from '../app/static/assets/data/weapons.json';

import { createUnit } from '../app/objects/createUnit';

test('An unit should have some default values', (t) => {
  const ophie = createUnit(heroes.Ophie);
  const ophieStats = ophie.getFightingStats();

  // Stats value are number
  for (const stat in ophieStats) {
    if (ophieStats.hasOwnProperty(stat)) {
      const value = ophieStats[stat];
      t.true(Number.isInteger(value));
    }
  }

  const oldSpeed = ophie.get('spd');

  // Test increment stats function.
  const speedIncr = ophie
    .increment({ name: 'spd', value: 1})
    .get('spd');

  t.true(speedIncr > oldSpeed);

  // ......................
  // ----------------------
  // Zero battle value test
  // ----------------------
  // Trainee has currently no waepon
  // -------------------------------
  t.true(ophie.getAtk() === 0);
  t.true(ophie.getRange() === 0);

  // ..............
  // --------------
  // Inventory test
  // --------------
  const sword = Object.assign({}, weapons['Iron Sword']);

  const oldSize = ophie.inventory.getSize();

  ophie.inventory.add(sword);

  t.true(ophie.inventory.getSize() > oldSize);

  // .................
  // -----------------
  // Weapon equip test
  // -----------------
  // t.true(trainee.canEquip(sword));

  // trainee.equip(sword);

  // t.true(sword.getPropertyValue('atk') > 0);

  // t.is(trainee.getPropertyValue('weapon'), sword);
  // t.true(trainee.getAtk() > 0);
});
