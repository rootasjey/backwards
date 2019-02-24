export enum MapActions {
  /** Close the menu. */
  cancel = 'cancel',

  /** End the current player's turn. */
  endTurn = 'endTurn',

  /** Save the current game's state. */
  suspend = 'suspend',
}

export const eventName = 'map:';
