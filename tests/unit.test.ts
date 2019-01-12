import test from 'ava';

import * as consumables from '../assets/data/consumables.json';
import * as heroes      from '../assets/data/heroes.json';
import * as units       from '../assets/data/unitsClasses.json';
import * as weapons     from '../assets/data/weapons.json';

import { unitsFactory } from '../src/logic/unitsFactory';

test("A unit's battle stats are numbers", async (assert) => {
  const createUnit = unitsFactory({
    dataConsummables  : consumables,
    dataHeroes        : heroes,
    dataUnits         : units,
    dataWeapons       : weapons,
  });

  const emilie = createUnit('emilie');

  Object.entries(emilie.getBattleStats())
    .map(([, value]) => { assert.true(Number.isInteger(value)); });
});
