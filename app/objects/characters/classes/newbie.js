import { baseCharacter } from '../base';

/**
 * Create a new Newbie character.
 * @param {Object} stats Initial character's stats.
 */
export const newbie = (stats = {}) => {
  const constitution  = stats.constitution ? stats.constitution : 0;
  const defense       = stats.defense ? stats.defense : 0;
  const dexterity     = stats.dexterity ? stats.dexterity : 0;
  const intelligence  = stats.intelligence ? stats.intelligence : 0;
  const luck          = stats.luck ? stats.luck : 0;
  const resistance    = stats.resistance ? stats.resistance : 0;
  const strength      = stats.strength ? stats.strength : 0;

  const newNewbie = baseCharacter(Object.assign(stats, {
    constitution  : 1 + constitution,
    defense       : 1 + defense,
    dexterity     : 1 + dexterity,
    intelligence  : 1 + intelligence,
    luck          : 0 + luck,
    resistance    : 1 + resistance,
    strength      : 2 + strength
  }));

  return newNewbie;
};