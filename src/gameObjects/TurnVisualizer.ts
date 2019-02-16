import { fonts } from '../const/config';
export default class TurnVisualizer extends Phaser.GameObjects.GameObject {
  // @ts-ignore : This prop is initialized in the `init()` method in the constructor.
  private textPlayerName: Phaser.GameObjects.Text;

  // @ts-ignore : This prop is initialized in the `init()` method in the constructor.
  private textTurn: Phaser.GameObjects.Text;

  // @ts-ignore : This prop is initialized in the `init()` method in the constructor.
  private textTurnNumber: Phaser.GameObjects.Text;

  // @ts-ignore : This prop is initialized in the `init()` method in the constructor.
  private rectBackground: Phaser.GameObjects.Rectangle;

  // @ts-ignore : This prop is initialized in the `init()` method in the constructor.
  private rectTextBackground: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene) {
    super(scene, 'TurnVisualizer');

    this.init();
  }

  // ~~~~~~~~~~~~~~~~~
  // PUBLIC FUNCTIONS
  // ~~~~~~~~~~~~~~~~~

  /** Show next turn: player's name & turns number. */
  public showNext(param: ShowTurnParam) {
    const { player: { name }, turnNumber } = param;

    this.textPlayerName.setText(name);
    this.textTurnNumber.setText(turnNumber.toString());

    this
      .toggleVisibility(true)
      .animateElements();
  }

  // ~~~~~~~~~~~~~~~~~
  // PRIVATE FUNCTIONS
  // ~~~~~~~~~~~~~~~~~

  private animateElements() {
    this
      .fadeInElements()
      .fadeOutElements();

    return this;
  }

  private createElements() {
    const { add } = this.scene;
    const { normal: normalStyle } = fonts.styles;

    const { innerHeight: windowHeight, innerWidth: windowWidth } = window;
    const halfHeight = windowHeight / 2;
    const halfWidth = windowWidth / 2;

    this.rectBackground = add.rectangle(halfWidth, halfHeight, windowWidth, windowHeight + 20, 0xfff, .5);
    this.rectTextBackground = add.rectangle(halfWidth, halfHeight, windowWidth, 100, 0x000);
    this.textPlayerName = add.text(40, halfHeight - 50, 'player name', normalStyle);
    this.textTurn = add.text(40, halfHeight - 20, 'TURN', { ...normalStyle, ...{ fontSize: 70 } });
    this.textTurnNumber = add.text(240, halfHeight - 80, '0', { ...normalStyle, ...{ fontSize: 160 } });

    return this;
  }

  private disableEvents() {
    this.scene.events.off('gameResize', this.onGameResize, this);
    return this;
  }

  private enableEvents() {
    this.scene.events.on('gameResize', this.onGameResize, this);
    return this;
  }

  private fadeInElements() {
    const { tweens } = this.scene;

    tweens.add({
      alpha: .5,
      duration: 600,
      targets: this.rectBackground,
    });

    tweens.add({
      alpha: 1,
      displayHeight: 150,
      duration: 600,
      targets: this.rectTextBackground,
    });

    tweens.add({
      alpha: 1,
      delay: 200,
      duration: 300,
      targets: this.textTurn,
      x: 20,
    });

    tweens.add({
      alpha: 1,
      delay: 300,
      duration: 300,
      targets: this.textPlayerName,
      x: 20,
    });

    tweens.add({
      alpha: 1,
      delay: 400,
      duration: 300,
      targets: this.textTurnNumber,
      x: 210,
    });

    return this;
  }

  private fadeOutElements() {
    const { tweens } = this.scene;

    const numberOfElements = 5;
    let elementsCompleted = 0;

    setTimeout(() => {
      tweens.add({
        alpha: 0,
        duration: 500,
        onComplete: () => {
          elementsCompleted++;

          if (elementsCompleted === numberOfElements) {
            this.toggleVisibility(false);
          }
        },
        targets: this.textTurnNumber,
        x: 240,
      });

      tweens.add({
        alpha: 0,
        delay: 200,
        duration: 500,
        onComplete: () => {
          elementsCompleted++;

          if (elementsCompleted === numberOfElements) {
            this.toggleVisibility(false);
          }
        },
        targets: this.textTurn,
        x: 40,
      });

      tweens.add({
        alpha: 0,
        delay: 300,
        duration: 500,
        onComplete: () => {
          elementsCompleted++;

          if (elementsCompleted === numberOfElements) {
            this.toggleVisibility(false);
          }
        },
        targets: this.textPlayerName,
        x: 40,
      });

      tweens.add({
        delay: 600,
        duration: 600,
        onComplete: () => {
          elementsCompleted++;

          if (elementsCompleted === numberOfElements) {
            this.toggleVisibility(false);
          }
        },
        targets: this.rectBackground,
        alpha: 0,
      });

      tweens.add({
        alpha: 0,
        delay: 600,
        displayHeight: 100,
        duration: 600,
        onComplete: () => {
          elementsCompleted++;

          if (elementsCompleted === numberOfElements) {
            this.toggleVisibility(false);
          }
        },
        targets: this.rectTextBackground,
      });

    }, 2000);

    return this;
  }

  private glueElements() {
    this.rectBackground.setScrollFactor(0);
    this.rectTextBackground.setScrollFactor(0);
    this.textPlayerName.setScrollFactor(0);
    this.textTurn.setScrollFactor(0);
    this.textTurnNumber.setScrollFactor(0);

    return this;
  }

  private init() {
    this
      .createElements()
      .glueElements()
      .listenToEvents()
      .toggleVisibility(false);

    return this;
  }

  private listenToDestroy() {
    this.once('destroy', () => {
      this.textPlayerName.destroy();
      this.textTurn.destroy();
      this.textTurnNumber.destroy();
      this.rectBackground.destroy();
      this.rectTextBackground.destroy();
    });

    return this;
  }

  private listenToEvents() {
    this.scene.events.on('subscribeTurnVisualizerEvents', this.enableEvents, this);
    this.scene.events.on('unsubscribeTurnVisualizerEvents', this.disableEvents, this);

    this
      .enableEvents()
      .listenToDestroy();

    return this;
  }

  private onGameResize() {
    // Move texts & rectangles.
  }

  private toggleVisibility(show: boolean) {
    if (show) {
      this.rectBackground.setAlpha(0);
      this.rectTextBackground.setAlpha(0);
      this.textPlayerName.setAlpha(0);
      this.textTurn.setAlpha(0);
      this.textTurnNumber.setAlpha(0);
    }

    this.rectBackground.setVisible(show);
    this.rectTextBackground.setVisible(show);
    this.textPlayerName.setVisible(show);
    this.textTurn.setVisible(show);
    this.textTurnNumber.setVisible(show);

    return this;
  }

}
