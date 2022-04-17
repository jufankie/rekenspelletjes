import { LitElement, html } from 'lit';
// eslint-disable-next-line import/extensions
import { state } from 'lit/decorators.js';
import type { HTMLTemplateResult } from 'lit';

import './MessageDialog';
import type { MessageDialog } from './MessageDialog';

import './GameOverDialog';
import type { GameOverDialog } from './GameOverDialog';

import { ChildNotFoundError } from './ChildNotFoundError';

export abstract class GameSkeleton extends LitElement {
  /** Gametime in number of seconds.
   * Number of seconds the game was played, correct at the end of the game.
   */
  @state()
  protected gameTime = 0;
  /** Number correct answers */
  @state()
  protected numberOk = 0;
  /** Number incorrect answers */
  @state()
  protected numberNok = 0;
  /** Image to use for the welcome diaglog, can be overruled in the constructor of children */
  @state()
  protected welcomeDialogImageUrl = new URL(
    '../images/Mompitz Otto.png',
    import.meta.url
  );

  /** Helper function to easily query for an element.
   *  @param query Querystring for the element.
   *  @template T The type of the element.
   *  @throws ChildNotFoundError in case the element can't be found.
   *
   */
  protected getElement<T>(query: string): T {
    const ret = <T | null>this.renderRoot.querySelector(query);
    if (ret === null) {
      throw new ChildNotFoundError(query, 'TimeLimitedGame');
    }
    return ret;
  }

  /** Get the game over dialog */
  protected get gameOverDialog(): GameOverDialog {
    return this.getElement<GameOverDialog>('#gameOverDialog');
  }

  /** Get the message dialog. */
  protected get messageDialog(): MessageDialog {
    return this.getElement<MessageDialog>('#messageDialog');
  }

  /** Get the gametime in minutes */
  protected getGameTimeString() {
    const minutes = Math.floor(this.gameTime / 60);
    const seconds = this.gameTime % 60;

    let ret: string;
    if (seconds === 0)
      ret = `${minutes} ${minutes === 1 ? 'minuut' : 'minuten'}`;
    else ret = `${minutes}:${seconds.toString().padStart(2, '0')} minuten`;

    return ret;
  }

  /** Reset the number of correct and incorrect answers. */
  private resetCounters(): void {
    this.numberNok = 0;
    this.numberOk = 0;
  }

  /** Additional first update actions, can be overriden in child classes */
  additionalFirstUpdatedActions() {
    // Do nothing
  }

  /** Actions performed after the first update is complete. */
  async firstUpdated(): Promise<void> {
    await this.updateComplete;
    this.additionalFirstUpdatedActions();
    await this.showWelcomeMessage();
    console.log('GameSkeleton - firstUpdated - welcomeMessage shown');
    this.startNewGame();
  }

  override async getUpdateComplete(): Promise<boolean> {
    const result = await super.getUpdateComplete();
    await this.gameOverDialog.updateComplete;
    await this.messageDialog.updateComplete;
    return result;
  }

  /** Show the welcome message */
  async showWelcomeMessage(): Promise<string> {
    return this.messageDialog.show(
      this.welcomeDialogTitle,
      this.welcomeMessage
    );
  }

  /** Render the game skeleton */
  renderGameSkeleton(): HTMLTemplateResult {
    return html`
      <message-dialog
        id="messageDialog"
        .imageUrl=${this.welcomeDialogImageUrl}
      ></message-dialog>

      <gameover-dialog id="gameOverDialog"></gameover-dialog>
    `;
  }

  get timePlayedForGameOverText(): HTMLTemplateResult {
    return html`<p>Je hebt ${this.getGameTimeString()} gespeeld.</p>`;
  }

  get numberOkForGameOverText(): HTMLTemplateResult {
    return html`
      <p>
        Je hebt ${this.numberOk === 0 ? 'geen' : `${this.numberOk}`}
        ${this.numberOk === 1 ? 'goed antwoord' : 'goede antwoorden'} gegeven.
      </p>
    `;
  }

  get numberNokForGameOverText(): HTMLTemplateResult {
    return html` <p>
      Je hebt ${this.numberNok === 0 ? 'geen' : this.numberNok}
      ${this.numberNok === 1 ? 'fout' : 'fouten'} gemaakt.
    </p>`;
  }

  get resultsForGameOverText(): HTMLTemplateResult {
    return html`${this.timePlayedForGameOverText}
    ${this.numberOkForGameOverText} ${this.numberNokForGameOverText}`;
  }

  /** Get the text to show in the game over dialog
   *  This function may be overriden, but need not to. In the latter case a standard text will be shown.
   */
  get gameOverText(): HTMLTemplateResult {
    return this.resultsForGameOverText;
  }

  /** Start a new game.
   * Action to perform when starting a new game.
   * When overruled by a child, the super needs to be called
   */
  startNewGame(): void {
    console.log('GameSkeleton - startNewGame');
    this.resetCounters();
  }

  /** Get the text to show in the game over dialog */
  abstract get welcomeMessage(): HTMLTemplateResult;

  /** Get the title for the welcome dialog. */
  abstract get welcomeDialogTitle(): string;

  /** Actions to perform before the game over dialog is shown.
   * Need not be overriden in the derived class, in that case nothing is done.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  executeGameOverActions(): void {}
}
