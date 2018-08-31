// ~~~~~~~~~~~~~~~~
// TEST: WEAPON
// ~~~~~~~~~~~~~~~~

import test from 'ava';

import { physicalTypes, types } from '../app/objects/weapons/const';
import { createWeapon } from '../app/objects/weapons/createWeapon';

test('A weapon of type sword should have some default values.', (t) => {
  const sword = createWeapon({
    secondType: physicalTypes.iron,
    type: types.sword
  });

  t.is(sword.getPropertyValue('type'), types.sword);
});