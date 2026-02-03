export class JobDescription {
  constructor(
    private readonly _content: string,
    private readonly _jobTitle?: string
  ) {}

  get content(): string { return this._content; }
  get jobTitle(): string | undefined { return this._jobTitle; }

  public isEmpty(): boolean {
    return !this._content || this._content.trim().length === 0;
  }

  public hasValidContent(): boolean {
    return this._content.length >= 50; // Minimum content requirement
  }
}
