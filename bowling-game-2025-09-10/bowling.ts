export class BowlingGame {
  private ball: number = 1;
  private totalPinsKnockedDown: number = 0;
  private frameScore: number = 0;
  private previousFrameWasASpare: boolean = false;
  private previousFrameWasAStrike: boolean = false;
  private twoFramesAgoWasAStrike: boolean = false;

  public roll(pinsKnockedDown: number): void {
    this.totalPinsKnockedDown += pinsKnockedDown;
    this.frameScore += pinsKnockedDown;

    if (this.ball === 1) {
      this.handleFirstBall(pinsKnockedDown);
    } else if (this.ball === 2) {
      this.handleSecondBall(pinsKnockedDown);
    }
  }

  private handleFirstBall(pinsKnockedDown: number): void {
    this.ball = 2;
    this.updateStrikeBonusForFirstBall(pinsKnockedDown);
    if (pinsKnockedDown === 10) {
      this.handleStrike();
    }
    if (this.previousFrameWasASpare) {
      this.totalPinsKnockedDown += pinsKnockedDown;
      this.previousFrameWasASpare = false;
    }
  }

  private handleSecondBall(pinsKnockedDown: number): void {
    this.updateStrikeBonusForSecondBall(pinsKnockedDown);
    this.previousFrameWasAStrike = false;

    if (this.frameScore === 10) {
      this.handleSpare();
    }
    this.advanceFrame();
  }

  private handleStrike(): void {
    this.previousFrameWasAStrike = true;
    this.advanceFrame();
  }

  private handleSpare(): void {
    this.previousFrameWasASpare = true;
  }

  private updateStrikeBonusForFirstBall(pinsKnockedDown: number): void {
    if (this.twoFramesAgoWasAStrike) {
      this.totalPinsKnockedDown += pinsKnockedDown;
      this.twoFramesAgoWasAStrike = false;
    }
    if (this.previousFrameWasAStrike) {
      this.totalPinsKnockedDown += pinsKnockedDown;
      this.twoFramesAgoWasAStrike = true;
    }
  }

  private updateStrikeBonusForSecondBall(pinsKnockedDown: number): void {
    if (this.previousFrameWasAStrike || this.twoFramesAgoWasAStrike) {
      this.totalPinsKnockedDown += pinsKnockedDown;
      this.twoFramesAgoWasAStrike = false;
    }
  }

  private advanceFrame(): void {
    this.ball = 1;
    this.frameScore = 0;
  }

  public score(): number {
    return this.totalPinsKnockedDown;
  }
}
