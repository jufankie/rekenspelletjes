import { html, css } from 'lit';
// eslint-disable-next-line import/extensions
import { customElement, state } from 'lit/decorators.js';
import type { CSSResultArray, HTMLTemplateResult } from 'lit';

import { TimeLimitedGame2 } from './TimeLimitedGame2';

import { randomFromSet, randomIntFromRange } from './Randomizer';
import { GameLogger } from './GameLogger';

import './AnalogClock';
import './DigitalClock';
import './SentenceClock';
import './DynamicGrid';
import './GroupOfImages';

import './RealHeight';

@customElement('clock-pairing-app')
export class ClockPairingApp extends TimeLimitedGame2 {
  private gameLogger = new GameLogger('L', '');
  @state()
  private numberOfClockPairs = 0;

  constructor() {
    super();
    this.parseUrl();
  }

  private parseUrl(): void {
    // const urlParams = new URLSearchParams(window.location.search);

    this.gameLogger.setSubCode('a');
  }

  override async getUpdateComplete(): Promise<boolean> {
    const result = await super.getUpdateComplete();
    /*
    const promises = [];
    for (const number of this.numbers) {
      promises.push(this.getNumber(`#${number.id}`).updateComplete);
    }
    await Promise.all(promises);
    */
    return result;
  }

  /** Start a new game.
   */
  startNewGame(): void {
    super.startNewGame();
    this.newRound();
  }

  /** Get the text to show in the game over dialog */
  get welcomeMessage(): HTMLTemplateResult {
    return html`<p>
      Klik een analoge en een digitale klok aan die dezelfde tijd aangeven.
    </p>`;
  }

  /** Get the title for the welcome dialog. */
  get welcomeDialogTitle(): string {
    return `Combineer klokken`;
  }

  private handleCorrectAnswer(): void {
    this.numberOk += 1;
    this.newRound();
  }

  private handleWrongAnswer(): void {
    this.numberNok += 1;
  }

  private newRound() {
    //
  }

  executeGameOverActions(): void {
    this.gameLogger.logGameOver();
  }

  async firstUpdated(): Promise<void> {
    await this.getUpdateComplete();

    /* Workaround for bug found in firefox where draggable=false is ignored in case user-select is set to none.
     * Please note that this expression cannot pierce into webcomponent's shadowroms.
     * The img in slots are found though.
     */
    if (window.navigator.userAgent.toLowerCase().includes('firefox')) {
      this.renderRoot.querySelectorAll('img[draggable=false]').forEach(el => {
        el.addEventListener('mousedown', event => event.preventDefault());
      });
    }
    return super.firstUpdated();
  }

  /** Get all static styles */
  static get styles(): CSSResultArray {
    return [
      ...super.styles,
      css`
        #totalGame {
          position: absolute;
          width: calc(var(--vw) * 100);
          height: calc(var(--vh) * 100 - 20px);
          box-sizing: border-box;
        }
      `,
    ];
  }

  /** Render the game content */
  renderGameContent(): HTMLTemplateResult {
    const hours = 11;
    const minutes = 16;

    return html`
      <dynamic-grid
        numberInGroup="11"
        contentAspectRatio="1"
        padding="2"
        style="width: 100%; height: 100%; top: 0;"
      >
        <analog-clock
          id="analog"
          hours="${hours}"
          minutes="${minutes}"
          showQuarterNumbers
          showAllTickMarks
        ></analog-clock>
        <digital-clock hours="${hours}" minutes="${minutes}"></digital-clock>
        <sentence-clock
          hours="${hours}"
          minutes="${minutes}"
          useWords
        ></sentence-clock>
        <sentence-clock hours="${hours}" minutes="${minutes}"></sentence-clock>
        <analog-clock
          id="analog"
          hours="${hours}"
          minutes="${minutes}"
          showQuarterNumbers
          showAllTickMarks
        ></analog-clock>

        <analog-clock
          id="analog"
          hours="${hours}"
          minutes="${minutes}"
          showQuarterNumbers
          showAllTickMarks
        ></analog-clock>

        <analog-clock
          id="analog"
          hours="${hours}"
          minutes="${minutes}"
          showQuarterNumbers
          showAllTickMarks
        ></analog-clock>

        <analog-clock
          id="analog"
          hours="${hours}"
          minutes="${minutes}"
          showQuarterNumbers
          showAllTickMarks
        ></analog-clock>

        <analog-clock
          id="analog"
          hours="${hours}"
          minutes="${minutes}"
          showQuarterNumbers
          showAllTickMarks
        ></analog-clock>
        <digital-clock hours="${hours}" minutes="${minutes}"></digital-clock>
        <digital-clock hours="${hours}" minutes="${minutes}"></digital-clock>
      </dynamic-grid>
    `;
  }
}