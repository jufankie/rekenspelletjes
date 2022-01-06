import { html, css } from 'lit';
// eslint-disable-next-line import/extensions
import { customElement, state } from 'lit/decorators.js';
import type { CSSResultGroup, HTMLTemplateResult } from 'lit';

import { TimeLimitedGame } from './TimeLimitedGame';
import {
  randomFromSet,
  randomFromSetAndSplice,
  randomIntFromRange,
} from './Randomizer';
import './AscendingBalloons';
import type { Answers, AscendingBalloons } from './AscendingBalloons';
import { GameLogger } from './GameLogger';

@customElement('sorting-game-app')
export class SortingGameApp extends TimeLimitedGame {
  @state()
  private numbers = [1, 2, 3, 4];
  @state()
  private gameElementsDisabled = true;

  private gameLogger = new GameLogger('B', '');

  constructor() {
    super();
    this.welcomeDialogImageUrl = 'images/Mompitz Elli star-yellow.png';
    this.parseUrl();
  }

  private parseUrl(): void {
    const urlParams = new URLSearchParams(window.location.search);
    /*
    const operatorsFromUrl = urlParams.getAll('operator');
    operatorsFromUrl.forEach(operator => {
      if (operator === 'plus' && !this.operators.find(value => value === '+'))
        this.operators.push('+');
      else if (
        operator === 'minus' &&
        !this.operators.find(value => value === '-')
      )
        this.operators.push('-');
    });
    if (this.operators.length === 0) this.operators.push('+');

    if (this.operators.length === 2) {
      this.gameLogger.setSubCode('c');
    } else if (this.operators[0] === '+') {
      this.gameLogger.setSubCode('a');
    } else if (this.operators[1] === '-') {
      this.gameLogger.setSubCode('b');
    }
*/
  }

  /** Get all static styles */
  static get styles(): CSSResultGroup {
    return css`
      .numbersAndBoxes {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        height: 80vh;
      }

      .numbers,
      .boxes {
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        align-items: center;
      }

      .number {
        display: block;
        width: auto;
        height: 18vh;
      }

      .boxSmallest {
        display: block;
        width: auto;
        height: 12vh;
      }

      .boxSmall {
        display: block;
        width: auto;
        height: 25vh;
      }

      .boxBig {
        display: block;
        width: auto;
        height: 35vh;
      }

      .boxBiggest {
        display: block;
        width: auto;
        height: 45vh;
      }
    `;
  }

  override async getUpdateComplete(): Promise<boolean> {
    const result = await super.getUpdateComplete();
    // await this.ascendingBalloons.updateComplete;
    return result;
  }

  /** Start a new game.
   * Progress bar and counters are automatically reset.
   */
  startNewGame(): void {
    window.scrollTo(0, 1);
    this.newRound();
  }

  /** Get the text to show in the game over dialog */
  get welcomeMessage(): HTMLTemplateResult {
    return html`<p>
      Gooi het kleinste getal in de kleinste doos en het grootste getal in de
      grootste doos
    </p>`;
  }

  /** Get the title for the welcome dialog. */
  get welcomeDialogTitle(): string {
    return `Sorteer de getallen`;
  }

  private handleCorrectAnswer(): void {
    this.numberOk += 1;
    this.newRound();
  }

  private handleWrongAnswer(): void {
    this.numberNok += 1;
  }

  private newRound() {
    this.gameElementsDisabled = false;
  }

  executeGameOverActions(): void {
    this.gameElementsDisabled = true;
    fetch('asdflog.php?game=D', {
      method: 'POST',
    });
  }

  numberDragStart(evt: DragEvent) {
    // evt.dataTransfer!.setData('text/plain', evt.target!.id);
    // evt.dataTransfer!.dropEffect = 'move';
    console.log(evt);
  }

  boxDragOver(evt: DragEvent) {
    evt.preventDefault();
    // evt.dataTransfer!.dropEffect = 'move';
    console.log('drag over');
    // console.log(evt.target.id);
  }

  boxDragDrop(evt: DragEvent) {
    alert('box Drag Drop');
    evt.preventDefault();
    console.log('drag drop');
    console.log(evt);
  }

  /** Render the application */
  render(): HTMLTemplateResult {
    return html`
      ${this.renderTimedGameApp()}
      <div class="numbersAndBoxes">
        <div class="numbers">
          <img alt="number 1" id="number1" @dragstart="${(evt: DragEvent) =>
            this.numberDragStart(
              evt
            )}" draggable="true" class="number" src="images/Mompitz4.png"></img>
          <img alt="number 2" id="number2" @dragstart="${(evt: DragEvent) =>
            this.numberDragStart(
              evt
            )}" draggable="true" class="number" src="images/Mompitz7.png"></img>
          <img alt="number 3" id="number3" @dragstart="${(evt: DragEvent) =>
            this.numberDragStart(
              evt
            )}" draggable="true" class="number" src="images/Mompitz4.png"></img>
          <img alt="number 4" id="number4" @dragstart="${(evt: DragEvent) =>
            this.numberDragStart(
              evt
            )}" draggable="true" class="number" src="images/Mompitz7.png"></img>

        </div>
        <div class="boxes">
          <img alt="smallest box" @drop="${(evt: DragEvent) =>
            this.boxDragDrop(evt)}" @dragover="${(evt: DragEvent) =>
      this.boxDragOver(evt)}"
            
            class="boxSmallest" src="images/red-box.png"></img>
          <img alt="small box" class="boxSmall" src="images/red-box.png"></img>
          <img alt="big box" class="boxBig" src="images/red-box.png"></img>
          <img alt="biggest box" class="boxBiggest" src="images/red-box.png"></img>
        </div>
      </div>
    `;
  }
}