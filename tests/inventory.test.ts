import test from 'ava';

import * as consumables from '../assets/data/consumables.json';
import * as heroes      from '../assets/data/heroes.json';
import * as units       from '../assets/data/unitsClasses.json';
import * as weapons     from '../assets/data/weapons.json';

import { unitsFactory } from '../src/logic/unitsFactory';

test('Moving a weapon to top should match index 0', async(assert) => {
  const createUnit = unitsFactory({
    dataConsummables: consumables,
    dataHeroes: heroes,
    dataUnits: units,
    dataWeapons: weapons,
  });

  const emilie = createUnit('emilie');

  const weapon = emilie.inventory.getWeapon(1);

  emilie.inventory.moveWeaponToTop(weapon);

  assert.deepEqual(emilie.inventory.getWeapon(0), weapon);
});
