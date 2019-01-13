class WeaponConst {
  public types = {
    axe   : 'axe',
    bow   : 'bow',
    lance : 'lance',
    tome  : 'tome',
    staff : 'staff',
    sword : 'sword',
  };

  public physicalTypes = {
    iron  : 'iron',
    steel : 'steel',
  };

  public magicTypes = {
    anima : 'anima',
    dark  : 'dark',
    white : 'white',
  };

  public damageTypes = {
    magical   : 'magical',
    physical  : 'physical',
  };

  public rank = {
    S: 'S',
    A: 'A',
    B: 'B',
    C: 'C',
    D: 'D',
    E: 'E',
  };
}

export default new WeaponConst();
