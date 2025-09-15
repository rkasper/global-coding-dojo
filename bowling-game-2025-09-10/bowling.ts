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

    if (this.ball === 1) {  // First ball of the frame
      this.ball = 2;
      if (this.twoFramesAgoWasAStrike) {
        this.totalPinsKnockedDown += pinsKnockedDown;
        this.twoFramesAgoWasAStrike = false;
      }
      if (this.previousFrameWasAStrike) {
        this.totalPinsKnockedDown += pinsKnockedDown;
        this.twoFramesAgoWasAStrike = true;
      }
      if (pinsKnockedDown === 10) {
        this.handleStrike();
      }
      if (this.previousFrameWasASpare) {
        this.totalPinsKnockedDown += pinsKnockedDown;
        this.previousFrameWasASpare = false;
      }
    } else if (this.ball === 2) { // second ball of the frame
      if (this.previousFrameWasAStrike || this.twoFramesAgoWasAStrike) {
        this.totalPinsKnockedDown += pinsKnockedDown;
        this.twoFramesAgoWasAStrike = false;
      }
      this.previousFrameWasAStrike = false;

      if (this.frameScore === 10) { // we rolled a spare
        this.handleSpare();
      }
      this.ball = 1;
      this.frameScore = 0;
    }
  }

  private handleStrike(): void {
    this.previousFrameWasAStrike = true;
    this.ball = 1;
    this.frameScore = 0;
  }

  private handleSpare(): void {
    this.previousFrameWasASpare = true;
  }

  public score(): number {
    return this.totalPinsKnockedDown;
  }
}
