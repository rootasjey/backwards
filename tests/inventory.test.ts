import test from 'ava';
import { unitsFactory } from '../src/logic/unitsFactory.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const consumables = JSON.parse(readFileSync(join(__dirname, '../public/assets/data/consumables.json'), 'utf8'));
const heroes = JSON.parse(readFileSync(join(__dirname, '../public/assets/data/heroes.json'), 'utf8'));
const units = JSON.parse(readFileSync(join(__dirname, '../public/assets/data/unitsClasses.json'), 'utf8'));
const weapons = JSON.parse(readFileSync(join(__dirname, '../public/assets/data/weapons.json'), 'utf8'));

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
