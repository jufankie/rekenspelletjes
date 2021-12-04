import { LitElement, html, css } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import type { CSSResultGroup, HTMLTemplateResult, PropertyValues } from 'lit';
import { randomFromSetAndSplice } from './Randomizer';

/** Interface definition for type storing the answers. */
export interface Answers {
  correct: number;
  incorrect: [number, number, number];
}

/** Possible balloon colors */
type BalloonColors = 'blue' | 'green' | 'yellow' | 'purple';

/** Interface definition for the ballooninfo */
interface BalloonInfo {
  color: BalloonColors;
  label: number;
  disabled: boolean;
}

/** Ascending balloons custom element.
 * @fires wrong-balloon-clicked - Fired when a wrong balloon has been clicked.
 * @fires correct-balloon-clicked - Fired when a wrong balloon has been clicked.
 * @fires ascension-complete - Fired when balloons have hit the ceiling.
 */
@customElement('ascending-balloons')
export class AscendingBalloons extends LitElement {
  /** Answers for the balloons, 1 correct answer and 3 incorrect answers. */
  @property({ attribute: false })
  answers: Answers = { correct: 12, incorrect: [1, 3, 74] };

  /** Disabled state of the balloons.
   * If disabled, the balloons do not show their label, do not react to clicks
   * and do not ascend.
   */
  @property({ type: Boolean })
  disabled = false;

  /** Ascension state */
  @state()
  private ascension = false;
  /** Balloon info for each of 4 balloons.
   * Is refreshed each time new answers are set.
   */
  @state()
  balloonInfoList: BalloonInfo[] = [];

  constructor() {
    super();
    this.updateBalloonInfo();
  }

  /** Update the ballooninfo.
   * Also shufles the balloons and colors.
   */
  private updateBalloonInfo(): void {
    this.balloonInfoList = [];
    const availableColors: BalloonColors[] = [
      'blue',
      'green',
      'yellow',
      'purple',
    ];
    const availableAnswers: number[] = [
      this.answers.correct,
      ...this.answers.incorrect,
    ];

    while (availableAnswers.length > 0) {
      this.balloonInfoList.push({
        color: randomFromSetAndSplice(availableColors),
        label: randomFromSetAndSplice(availableAnswers),
        disabled: false,
      });
    }

    this.requestUpdate();
  }

  /** Called whenever a property is updated.
   * Checks whether the updated property is answers and updates the balloon info in that case.
   */
  willUpdate(changedProperties: PropertyValues): void {
    if (changedProperties.has('answers')) {
      this.updateBalloonInfo();
    }
  }

  /** Get the styles for this custom element. */
  static get styles(): CSSResultGroup {
    return css`
      .MoveUp {
        animation-name: MoveUp;
        animation-duration: 10s;
        animation-delay: 0.05s; /* Needed to ensure iOS safari has sufficient time to process restarts of the animation */
        animation-timing-function: linear;
        animation-fill-mode: forwards;
      }
      @keyframes MoveUp {
        from {
          transform: translate(0px, -0px);
        }
        to {
          transform: translate(0px, calc(-100vh + 2em));
        }
      }

      .Balloon {
        background-size: 1.76em 2em;
        background-color: Transparent;
        font-size: calc(1em + 4vmin);
        border: none;
        outline: none;
        width: 1.76em;
        height: 2em;
        color: black;
        text-align: center;
        padding: 0;
      }

      #balloons {
        position: absolute;
        width: 100%;
        border: none;
        display: flex;
        justify-content: space-around;
        bottom: 0px;
      }
    `;
  }

  /* Restart the balloon ascension from the bottom.
   */
  async restartAscension(): Promise<void> {
    await this.reset();
    this.startAscension();
  }

  /** Reset the balloons to the bottom and stop movement.
   * Wait until the promise resolves before starting ascension again as
   * otherwise the reset might be missed by the browser.
   */
  async reset(): Promise<void> {
    this.updateBalloonInfo();
    this.ascension = false;
    await this.performUpdate();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const dummy = this.offsetWidth; // This is a dummy command to force a reflow such that the animation is reset.
  }

  /** Start ascension of the balloons.
   * If the balloons are already ascending this action has no effect.
   */
  startAscension(): void {
    this.ascension = true;
  }

  /** Event handler for when a balloon is clicked
   * @param label - label of the clicked balloon.
   */
  private balloonClicked(label: number): void {
    if (label !== this.answers.correct) {
      const balloonInfo = this.balloonInfoList.find(b => b.label === label);
      if (balloonInfo != null) {
        balloonInfo.disabled = true;
      } else {
        throw Error(
          'Balloon label not found in balloonInfoList, this should not happen'
        );
      }
      this.requestUpdate();
      const event = new Event('wrong-balloon-clicked');
      this.dispatchEvent(event);
    } else {
      const event = new Event('correct-balloon-clicked');
      this.dispatchEvent(event);
    }
  }

  private ascensionComplete(): void {
    const event = new Event('ascension-complete');
    this.dispatchEvent(event);
  }

  /** Render the text on the balloon, taking disabledness into account. */
  private renderTextBalloon(balloonInfo: BalloonInfo): string {
    let ret: string;
    if (this.disabled) ret = '';
    else if (balloonInfo.disabled) ret = '✗';
    else ret = `${balloonInfo.label}`;

    return ret;
  }

  /** Render the ascending balloons custom element. */
  render(): HTMLTemplateResult {
    return html`
      <div
        id="balloons"
        class="${this.ascension && !this.disabled ? 'MoveUp' : ''}"
        @animationend=${() => this.ascensionComplete()}
      >
        ${this.balloonInfoList.map(
          balloonInfo =>
            html`
              <button
                type="button"
                class="Balloon"
                style="background-image: url('images/balloon-${balloonInfo.color}.png');"
                @click="${() => this.balloonClicked(balloonInfo.label)}"
                ?disabled="${balloonInfo.disabled || this.disabled}"
              >
                ${this.renderTextBalloon(balloonInfo)}
              </button>
            `
        )}
      </div>
    `;
  }
}