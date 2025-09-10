export class BowlingGame {
  private totalPinsKnockedDown: number = 0;
  private ball: number = 1;
  private frameScore: number = 0;
  private spareBonusActive: boolean = false;
  private strikeBonusActive: boolean = false;

  public roll(pinsKnockedDown: number): void {
    this.totalPinsKnockedDown += pinsKnockedDown;
    this.frameScore += pinsKnockedDown;

    if (this.ball === 1) {
      // console.log(this.totalPinsKnockedDown);
      // console.log(this.frameScore);
      this.ball = 2;
      if(this.strikeBonusActive) {
        this.totalPinsKnockedDown += pinsKnockedDown;
      }
      if(pinsKnockedDown === 10) {
        this.strikeBonusActive = true;
        this.ball = 1;
      }
      if (this.spareBonusActive) {
        this.totalPinsKnockedDown += pinsKnockedDown;
        this.spareBonusActive = false;
      }
    } else if (this.ball === 2) {
      if(this.strikeBonusActive) {
        this.totalPinsKnockedDown += pinsKnockedDown;
      }
      this.strikeBonusActive = false;
      this.ball = 1;
      if (this.frameScore === 10) {
        this.spareBonusActive = true;
      }
      this.frameScore = 0;
    }
  }

  public score(): number {
    return this.totalPinsKnockedDown;
  }
}
