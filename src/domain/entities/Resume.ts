export class Resume {
  constructor(
    private readonly _id: string,
    private readonly _content: string,
    private readonly _fileName: string,
    private readonly _uploadedAt: Date
  ) {}

  get id(): string { return this._id; }
  get content(): string { return this._content; }
  get fileName(): string { return this._fileName; }
  get uploadedAt(): Date { return this._uploadedAt; }

  public isEmpty(): boolean {
    return !this._content || this._content.trim().length === 0;
  }

  public hasValidContent(): boolean {
    return this._content.length >= 100; // Minimum content requirement
  }
}
