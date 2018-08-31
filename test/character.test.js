// ~~~~~~~~~~~~~~~~
// TEST: CHARACTER
// ~~~~~~~~~~~~~~~~

import test from 'ava';

import { types as UNIT_TYPES } from '../app/objects/units/const';
import { createUnit } from '../app/objects/units/createUnit';

import { physicalTypes, types as WEAPON_TYPES } from '../app/objects/weapons/const';
import { createWeapon } from '../app/objects/weapons/createWeapon';

test('A character should have some default values', (t) => {
  const trainee = createUnit({ class: UNIT_TYPES.trainee, id: 0 });
  const traineeStats = trainee.getFightingStats();

  // Test unit's class.
  t.is(trainee.getPropertyValue('class'), UNIT_TYPES.trainee);

  // Test unit's stats.
  for (const stat in traineeStats) {
    if (traineeStats.hasOwnProperty(stat)) {
      const value = traineeStats[stat];
      t.true(Number.isInteger(value));
    }
  }

  // Test incrementStats function.
  const speedIncr = trainee
    .incrementStats({ name: 'speed', value: 1})
    .getPropertyValue('speed');

  t.true(speedIncr > traineeStats.speed);

  // .................
  // -----------------
  // Weapon equip test
  // -----------------

  // Atk should equal 0 as there's no weapon.
  t.true(trainee.getAtk() === 0);
  t.true(trainee.getRange() === 0);

  const sword = createWeapon({
    secondType: physicalTypes.iron,
    type: WEAPON_TYPES.sword
  });

  t.true(sword.getPropertyValue('ownerId') !== trainee.getPropertyValue('id'));

  // t.true(trainee.canEquip(sword));
});
