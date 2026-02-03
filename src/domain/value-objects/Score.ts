export class Score {
  private readonly _value: number;

  constructor(value: number) {
    this._value = value;
    this.validate();
  }

  get value(): number {
    return this._value;
  }

  private validate(): void {
    if (this._value < 0 || this._value > 100) {
      throw new Error('Score must be between 0 and 100');
    }
  }

  public isExcellent(): boolean {
    return this._value >= 90;
  }

  public isGood(): boolean {
    return this._value >= 70;
  }

  public isFair(): boolean {
    return this._value >= 50;
  }

  public isPoor(): boolean {
    return this._value < 50;
  }

  public toString(): string {
    return this._value.toString();
  }

  toJSON() {
    return this._value;
  }
}
