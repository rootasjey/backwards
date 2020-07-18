import { Base, ConstructorParams as BaseConstructorParams } from "./base";

const VELOCITY = 232;

export type ConstructorParams = BaseConstructorParams & { char: string };

export class Player extends Base {
  private char: string;
  private jumps = 2;
  private jumping = false;
  private previousY: number;

  constructor({ char, ...args }: ConstructorParams) {
    super({ ...args, texture: `char:${char}-idle` });

    this.char = char;
    this.previousY = args.y;

    this.createPhysics();
    this.createAnimations();
  }

  private createPhysics() {
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    this.setSize(18, 32);
    this.setCollideWorldBounds(true);
  }

  private createAnimations() {
    this.scene.anims.create({
      key: "idle",
      frames: this.scene.anims.generateFrameNumbers(`char:${this.char}-idle`, { start: 0, end: 10 }),
    });

    this.scene.anims.create({
      key: "run",
      frames: this.scene.anims.generateFrameNumbers(`char:${this.char}-run`, { start: 0, end: 11 }),
    });

    this.scene.anims.create({
      key: "jump",
      frames: this.scene.anims.generateFrameNumbers(`char:${this.char}-jump`, {}),
    });

    this.scene.anims.create({
      key: "wall-jump",
      frames: this.scene.anims.generateFrameNumbers(`char:${this.char}-wall-jump`, { start: 0, end: 4 }),
    });

    this.scene.anims.create({
      key: "double-jump",
      frames: this.scene.anims.generateFrameNumbers(`char:${this.char}-double-jump`, { start: 0, end: 4 }),
      repeat: -1,
    });

    this.scene.anims.create({
      key: "fall",
      frames: this.scene.anims.generateFrameNumbers(`char:${this.char}-fall`, {}),
    });
  }

  update() {
    const cursors = this.scene.input.keyboard.createCursorKeys();

    if (this.body.blocked.down) {
      this.jumps = 2;
      this.jumping = false;
    }

    if (cursors.left.isDown || cursors.right.isDown) {
      this.setFlipX(cursors.left.isDown);
      this.setVelocityX(VELOCITY * (cursors.left.isDown ? -1 : 1));

      if (this.body.blocked.down) {
        this.anims.play("run", true);
      }
    } else {
      this.setVelocityX(0);

      if (this.body.blocked.down) {
        this.anims.play("idle", true);
      }
    }

    if (this.previousY < this.y) {
      if (this.body.blocked.left || this.body.blocked.right) {
        this.jumps = 1;
        this.anims.play("wall-jump", true);
        this.setGravityY(-400);
      } else {
        this.setGravityY(0);
        this.anims.play("fall", true);
      }
    } else {
      this.setGravityY(0);
    }

    if (cursors.up.isUp) {
      this.jumping = false;
    } else if (cursors.up.isDown && this.jumps > 0 && !this.jumping) {
      this.jumps -= 1;
      this.jumping = true;
      this.setVelocityY(-VELOCITY);

      if (this.body.blocked.down) {
        this.anims.play("jump", true);
      } else {
        this.anims.play("double-jump", true);
      }
    }

    this.previousY = this.y;
  }
}
