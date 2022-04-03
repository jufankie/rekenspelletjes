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

type Operator = '+' | '-';

@customElement('addition-substraction-within-decade-app')
export class AdditionSubstractionWithinDecadeApp extends TimeLimitedGame {
  @state()
  private firstNumber = 1;
  @state()
  private secondNumber = 1;
  @state()
  private operator: Operator = '+';
  @state()
  private answers: Answers = { correct: 1, incorrect: [2, 3, 4] };
  @state()
  private gameElementsDisabled = true;

  private decades: number[] = [];
  private operators: Operator[] = [];

  constructor() {
    super();
    this.parseUrl();
  }

  private parseUrl(): void {
    const urlParams = new URLSearchParams(window.location.search);

    const decadesFromUrl = urlParams.getAll('decade');
    decadesFromUrl.forEach(decadeAsString => {
      const decade = parseInt(decadeAsString, 10);
      if (
        !Number.isNaN(decade) &&
        decade >= 0 &&
        decade % 10 === 0 &&
        decade < 100 &&
        !this.decades.find(value => value === decade)
      ) {
        this.decades.push(decade);
      }
    });
    if (this.decades.length === 0) this.decades.push(0);

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
  }

  /** Get the ascending balloons child */
  private get ascendingBalloons(): AscendingBalloons {
    return this.getElement('#ascendingBalloons');
  }

  /** Get all static styles */
  static get styles(): CSSResultGroup {
    return css`
      .exercise {
        font-size: calc(1em + 4vmin);
      }
    `;
  }

  override async getUpdateComplete(): Promise<boolean> {
    const result = await super.getUpdateComplete();
    await this.ascendingBalloons.updateComplete;
    return result;
  }

  /** Start a new game.
   * Progress bar and counters are automatically reset.
   */
  startNewGame(): void {
    this.newRound();
  }

  /** Get the text to show in the game over dialog */
  get welcomeMessage(): HTMLTemplateResult {
    const exerciseExamples: string[] = [];
    let exerciseExamplesAsScentence = '';

    if (this.operators.find(value => value === '+')) {
      this.decades.forEach(decade => exerciseExamples.push(`${decade + 3}+4`));
    }
    if (this.operators.find(value => value === '-')) {
      this.decades.forEach(decade => exerciseExamples.push(`${decade + 7}-5`));
    }

    if (exerciseExamples.length <= 0) throw new Error('Internal error');
    else if (exerciseExamples.length === 1)
      exerciseExamplesAsScentence = exerciseExamplesAsScentence.concat(
        `${exerciseExamples[0]}.`
      );
    else {
      exerciseExamples.forEach((value, index) => {
        if (index === 0) {
          exerciseExamplesAsScentence =
            exerciseExamplesAsScentence.concat(value);
        } else if (index === exerciseExamples.length - 1) {
          exerciseExamplesAsScentence = exerciseExamplesAsScentence.concat(
            ` en ${value}.`
          );
        } else {
          exerciseExamplesAsScentence = exerciseExamplesAsScentence.concat(
            `, ${value}`
          );
        }
      });
    }

    return html`<p>Sommen als ${exerciseExamplesAsScentence}</p>
      <p>Klik op de ballon met het juiste antwoord.</p> `;
  }

  /** Get the title for the welcome dialog. */
  get welcomeDialogTitle(): string {
    return `Sommen binnen het tiental`;
  }

  private handleCorrectAnswer(): void {
    this.numberOk += 1;
    this.newRound();
  }

  private handleWrongAnswer(): void {
    this.numberNok += 1;
  }

  private handleAscensionComplete(): void {
    this.numberNok += 1;
    this.newRound();
  }

  private newRound() {
    this.operator = randomFromSet(this.operators);
    const decade = randomFromSet(this.decades);
    let answer: number;

    if (this.operator === '+') {
      this.firstNumber = randomIntFromRange(0 + decade, 9 + decade);
      this.secondNumber = randomIntFromRange(
        0,
        10 - (this.firstNumber - decade)
      );
      answer = this.firstNumber + this.secondNumber;
    } else if (this.operator === '-') {
      this.firstNumber = randomIntFromRange(1 + decade, 10 + decade);
      this.secondNumber = randomIntFromRange(0, this.firstNumber - decade);
      answer = this.firstNumber - this.secondNumber;
    } else {
      throw new Error('Unsupported operator found');
    }

    const possibleAnswers = [];
    for (let i = 0 + decade; i <= 10 + decade; i++) {
      if (i !== answer) possibleAnswers.push(i);
    }
    this.answers = {
      correct: answer,
      incorrect: [
        randomFromSetAndSplice(possibleAnswers),
        randomFromSetAndSplice(possibleAnswers),
        randomFromSetAndSplice(possibleAnswers),
      ],
    };
    this.ascendingBalloons.restartAscension();
    this.gameElementsDisabled = false;
  }

  executeGameOverActions(): void {
    this.gameElementsDisabled = true;
  }

  /** Render the application */
  render(): HTMLTemplateResult {
    return html`
      ${this.renderTimedGameApp()}
      <ascending-balloons
        id="ascendingBalloons"
        style="position: absolute; top: 0; left: 0; height: 100%; width:100%;"
        @correct-balloon-clicked="${() => this.handleCorrectAnswer()}"
        @wrong-balloon-clicked="${() => this.handleWrongAnswer()}"
        @ascension-complete="${() => this.handleAscensionComplete()}"
        .answers=${this.answers}
        ?disabled=${this.gameElementsDisabled}
      ></ascending-balloons>
      <div
        class="exercise"
        style="display: ${this.gameElementsDisabled
          ? 'none'
          : 'block'}; position: absolute; top: 20%; width: 100%; text-align: center;"
      >
        ${this.firstNumber} ${this.operator} ${this.secondNumber} = ?
      </div>
    `;
  }
}
