import { v4 as uuidv4 } from 'uuid';

export class JobId {
  private readonly _value: string;

  constructor(value?: string) {
    this._value = value || uuidv4();
    this.validate();
  }

  get value(): string {
    return this._value;
  }

  private validate(): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(this._value)) {
      throw new Error('Invalid JobId format');
    }
  }

  public equals(other: JobId): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
