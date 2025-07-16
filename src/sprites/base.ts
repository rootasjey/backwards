import Phaser from "phaser";

export type ConstructorParams = {
  x: number;
  y: number;
  scene: Phaser.Scene;
  texture?: string;
};

export abstract class Base extends Phaser.Physics.Arcade.Sprite {
  constructor({ scene, x, y, texture }: ConstructorParams) {
    super(scene, x, y, texture || '', 0);
  }
}
