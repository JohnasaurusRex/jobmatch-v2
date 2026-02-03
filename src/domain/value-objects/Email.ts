export class Email {
  private readonly _value: string;

  constructor(value: string) {
    this._value = value;
    this.validate();
  }

  get value(): string {
    return this._value;
  }

  private validate(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this._value)) {
      throw new Error('Invalid email format');
    }
  }

  public getDomain(): string {
    return this._value.split('@')[1];
  }

  public toString(): string {
    return this._value;
  }
}
